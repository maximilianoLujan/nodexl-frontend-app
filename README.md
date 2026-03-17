# NodeXL Desktop (Tauri + Astro)

Este repo contiene el frontend (Astro + React) y la app desktop (Tauri v2). El instalador de Windows se genera con NSIS (un `.exe`).

## Requisitos

- Node.js 20+
- Rust toolchain estable (MSVC en Windows)
- Windows (para generar el instalador `.exe` con NSIS)

En Windows, asegurate de tener instalado **Microsoft Visual C++ Build Tools** (lo más fácil es instalar _Visual Studio Build Tools_ con el workload de _Desktop development with C++_).

## Estructura esperada del backend

Para el build desktop, el backend debe estar en:

`src-tauri/bin/backend/`

con al menos:

- `backend.exe`
- `_internal/` (carpeta requerida por el backend)

Ejemplo:

`src-tauri/bin/backend/backend.exe`

`src-tauri/bin/backend/_internal/...`

## Instalar dependencias

```bash
npm ci
```

## Build del instalador `.exe` (Windows)

Este comando genera el instalador NSIS (más rápido que bundlear todo):

```bash
npm run tauri -- build --bundles nsis
```

### Salida

El instalador queda en:

`src-tauri/target/release/bundle/nsis/*.exe`

Ejemplo:

`src-tauri/target/release/bundle/nsis/nodexl-desktop_0.1.0_x64-setup.exe`

## Notas de ejecución

- En release, el backend se ejecuta en segundo plano (sin ventana de consola).
- Si el backend no puede iniciarse en una instalación release, se registra un log en:
  - `%TEMP%\\nodexl-desktop-startup.log`

## CI (GitHub Actions)

El workflow de desktop descarga el backend como artifact, lo coloca bajo `src-tauri/bin/backend`, buildea el instalador NSIS y lo sube como artifact (y como asset de Release cuando el push es un tag `v*`).
