// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{
    net::{IpAddr, Ipv4Addr, SocketAddr, TcpStream},
    path::PathBuf,
    process::Command,
    sync::{Mutex, OnceLock},
    time::Duration,
};
use tauri::{path::BaseDirectory, Manager, RunEvent};

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

fn main() {
    let app = tauri::Builder::default()
        .setup(|app| {
            // If the backend is already running (e.g. started manually), don't spawn a second instance.
            // This avoids: "[Errno 10048] ... bind on address ('127.0.0.1', 8000)".
            let backend_port: u16 = 8000;
            let backend_addr =
                SocketAddr::new(IpAddr::V4(Ipv4Addr::new(127, 0, 0, 1)), backend_port);
            if is_listening(backend_addr) {
                return Ok(());
            }

            let backend_filename = if cfg!(windows) {
                "backend.exe"
            } else {
                "backend"
            };

            let backend: PathBuf = if cfg!(debug_assertions) {
                // `tauri dev` runs the binary from the source tree, so use the checked-in path.
                PathBuf::from(env!("CARGO_MANIFEST_DIR"))
                    .join("bin")
                    .join("backend")
                    .join(backend_filename)
            } else {
                // Bundled app: external binaries are available from the Resource directory.
                let backend_rel_path = format!("bin/backend/{backend_filename}");
                app.path()
                    .resolve(backend_rel_path, BaseDirectory::Resource)
                    .expect("backend not found")
            };

            let child = Command::new(backend)
                .spawn()
                .expect("failed to start backend");

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
