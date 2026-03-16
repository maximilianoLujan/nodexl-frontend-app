use std::{env, fs, path::PathBuf};

fn main() {
    // Tauri's `bundle.externalBin` expects per-target binaries named like:
    // `backend-<target-triple>.exe` on Windows.
    // In this repo we keep a single `backend.exe` checked in under `bin/backend/`.
    // During `tauri dev`, the build script validates the target-suffixed name exists,
    // so we create it on the fly.
    if let (Ok(manifest_dir), Ok(target)) = (env::var("CARGO_MANIFEST_DIR"), env::var("TARGET")) {
        if target.contains("windows") {
            let mut src = PathBuf::from(&manifest_dir);
            src.push("bin");
            src.push("backend");
            src.push("backend.exe");

            let mut dst = PathBuf::from(&manifest_dir);
            dst.push("bin");
            dst.push("backend");
            dst.push(format!("backend-{target}.exe"));

            if src.exists() && !dst.exists() {
                let _ = fs::copy(src, dst);
            }
        }
    }

    tauri_build::build()
}
