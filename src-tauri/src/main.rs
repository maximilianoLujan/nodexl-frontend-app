// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{
    fs,
    io::Write,
    net::{IpAddr, Ipv4Addr, SocketAddr, TcpStream},
    path::PathBuf,
    process::{Command, Stdio},
    sync::{Mutex, OnceLock},
    time::Duration,
};
use tauri::{path::BaseDirectory, Manager, RunEvent};

#[cfg(windows)]
use std::os::windows::process::CommandExt;

#[cfg(windows)]
const CREATE_NO_WINDOW: u32 = 0x08000000;

static BACKEND_PID: OnceLock<Mutex<Option<u32>>> = OnceLock::new();

fn backend_pid_cell() -> &'static Mutex<Option<u32>> {
    BACKEND_PID.get_or_init(|| Mutex::new(None))
}

fn is_listening(local_addr: SocketAddr) -> bool {
    TcpStream::connect_timeout(&local_addr, Duration::from_millis(150)).is_ok()
}

fn kill_backend_if_spawned() {
    let pid = backend_pid_cell()
        .lock()
        .ok()
        .and_then(|mut guard| guard.take());

    let Some(pid) = pid else {
        return;
    };

    if cfg!(windows) {
        // Kill the whole process tree to avoid leaving Uvicorn/Python children alive.
        let _ = Command::new("taskkill")
            .args(["/PID", &pid.to_string(), "/T", "/F"])
            .status();
    } else {
        // Best-effort on non-Windows; we only tracked the PID.
        let _ = Command::new("kill").args(["-9", &pid.to_string()]).status();
    }
}

fn log_startup_issue(message: &str) {
    // Release builds on Windows don't have a console window, so make failures discoverable.
    let mut path = std::env::temp_dir();
    path.push("nodexl-desktop-startup.log");

    if let Ok(mut file) = fs::OpenOptions::new().create(true).append(true).open(path) {
        let _ = writeln!(file, "{message}");
    }
}

fn find_backend_binary(app: &tauri::App) -> Option<PathBuf> {
    if cfg!(debug_assertions) {
        let filename = if cfg!(windows) {
            "backend.exe"
        } else {
            "backend"
        };
        return Some(
            PathBuf::from(env!("CARGO_MANIFEST_DIR"))
                .join("bin")
                .join("backend")
                .join(filename),
        );
    }

    // Bundled app: prefer backend.exe (what our runtime code historically expects).
    if cfg!(windows) {
        if let Ok(path) = app
            .path()
            .resolve("bin/backend/backend.exe", BaseDirectory::Resource)
        {
            if path.exists() {
                return Some(path);
            }
        }
    } else if let Ok(path) = app
        .path()
        .resolve("bin/backend/backend", BaseDirectory::Resource)
    {
        if path.exists() {
            return Some(path);
        }
    }

    // Fallback: scan the backend resource directory for target-suffixed binaries,
    // e.g. backend-x86_64-pc-windows-msvc.exe.
    let backend_dir = match app.path().resolve("bin/backend", BaseDirectory::Resource) {
        Ok(dir) => dir,
        Err(_) => return None,
    };

    let entries = fs::read_dir(&backend_dir).ok()?;
    for entry in entries.flatten() {
        let path = entry.path();
        if !path.is_file() {
            continue;
        }

        if cfg!(windows) {
            let name = path
                .file_name()
                .and_then(|s| s.to_str())
                .unwrap_or_default()
                .to_ascii_lowercase();

            if (name == "backend.exe" || (name.starts_with("backend-") && name.ends_with(".exe")))
                && path.exists()
            {
                return Some(path);
            }
        } else {
            if let Some(name) = path.file_name().and_then(|s| s.to_str()) {
                if name == "backend" || name.starts_with("backend-") {
                    return Some(path);
                }
            }
        }
    }

    None
}

fn main() {
    let app = tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            // If the backend is already running (e.g. started manually), don't spawn a second instance.
            // This avoids: "[Errno 10048] ... bind on address ('127.0.0.1', 8000)".
            let backend_port: u16 = 8000;
            let backend_addr =
                SocketAddr::new(IpAddr::V4(Ipv4Addr::new(127, 0, 0, 1)), backend_port);
            if is_listening(backend_addr) {
                return Ok(());
            }

            let Some(backend) = find_backend_binary(app) else {
                log_startup_issue(
                    "Backend binary not found. Expected under resources: bin/backend/*",
                );
                return Ok(());
            };

            let mut cmd = Command::new(&backend);
            if let Some(parent) = backend.parent() {
                // Helps backends that expect sibling folders/assets via relative paths.
                cmd.current_dir(parent);
            }

            // In Windows release builds, ensure the backend runs truly in the background
            // (no visible console window).
            #[cfg(windows)]
            if !cfg!(debug_assertions) {
                cmd.creation_flags(CREATE_NO_WINDOW);
                cmd.stdin(Stdio::null());
                cmd.stdout(Stdio::null());
                cmd.stderr(Stdio::null());
            }

            let child = match cmd.spawn() {
                Ok(child) => child,
                Err(err) => {
                    log_startup_issue(&format!(
                        "Failed to start backend at {}: {err}",
                        backend.display()
                    ));
                    return Ok(());
                }
            };

            if let Ok(mut guard) = backend_pid_cell().lock() {
                *guard = Some(child.id());
            }

            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error building app");

    app.run(|_app_handle, event| {
        // Also kill backend on any exit path.
        if let RunEvent::ExitRequested { .. } | RunEvent::Exit = event {
            kill_backend_if_spawned();
        }
    });
}
