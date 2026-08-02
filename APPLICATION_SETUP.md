# Application Setup

This document records every step taken to set up the API Studio development environment, why each step is required, and the configuration changes made. Use it as a reference to reproduce the environment from scratch.

## Purpose

Unlike `README.md` (which focuses on booting the app), this document explains the **how and why** behind the toolchain, commands, and config files so a new developer can understand and replicate the setup.

## 1. Prerequisites

These system tools are required:

| Tool           | Why it's needed                                | Verify with         |
| -------------- | ---------------------------------------------- | ------------------- |
| Node.js (v20+) | Runs the React/Vite frontend toolchain         | `node --version`    |
| npm            | Installs and manages JavaScript dependencies   | `npm --version`     |
| Rust + Cargo   | Compiles the Tauri Rust backend                | `cargo --version`   |
| SQLite         | Local application database (used from Phase 3) | `sqlite3 --version` |

## 2. Scaffolding the project

### `npm create tauri-app@latest . -- --template react-ts --manager npm --yes`

Scaffolds a new Tauri v2 + React + TypeScript + Vite project.

**Why:** `create-tauri-app` generates the initial project layout, config files, and the frontend/backend split (`src/` + `src-tauri/`) so you don't hand-write boilerplate.

> **Note:** The scaffolder refuses to run in a non-empty directory. Because `docs/`, `README.md`, `LICENSE`, and `.git` already existed, the project was scaffolded into a temporary directory and the generated files were copied in, preserving the existing files.

## 3. Installing dependencies

```bash
npm install
```

**Why:** Installs the base packages declared in `package.json` (React, Tauri API, Vite, TypeScript).

### `npm install react-router-dom zustand`

**Why:** Adds client-side routing (`react-router-dom`) and global state management (`zustand`).

### `npm install -D tailwindcss @tailwindcss/vite`

**Why:** Adds Tailwind CSS v4 and its Vite plugin for styling.

### `npm install -D prettier`

**Why:** Adds Prettier for consistent code formatting (used by the `format` and `format:check` scripts).

### `npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom`

**Why:** Sets up the frontend unit-testing stack — Vitest (test runner), React Testing Library (component rendering and queries), jest-dom (extra DOM matchers), user-event (realistic interactions), and jsdom (browser-like test environment).

### `npm install -D @playwright/test`

**Why:** Adds Playwright for end-to-end testing in real browsers.

### `npx playwright install chromium`

**Why:** Downloads the Chromium browser binary that Playwright drives for E2E tests.

## 4. Configuration modifications

### `package.json`

- Renamed project from `tauri-app` to `api-studio`.
- Added scripts: `typecheck`, `format`, `format:check`, `test`, `test:run`, `test:e2e`.
- Added `react-router-dom` + `zustand` (deps) and `tailwindcss`, `@tailwindcss/vite`, `prettier`, `vitest`, `@testing-library/*`, `jsdom`, `@playwright/test` (devDeps).

### `vite.config.ts`

- Added the `tailwindcss()` Vite plugin.
- Added a `@` path alias resolving to `./src`.

**Why the `@` alias:** Lets imports use `@/components/...` instead of long relative paths.

### `tsconfig.json`

- Added `baseUrl: "."` and `paths: { "@/*": ["./src/*"] }`.

**Why:** Keeps TypeScript aware of the same `@/` alias used in Vite.

- Added test types `vitest/globals` and `@testing-library/jest-dom` so test files type-check correctly.

### `vitest.config.ts` (new)

- Vitest config: react plugin, `jsdom` environment, the `@` alias, and a jest-dom setup file.

### `playwright.config.ts` (new)

- Playwright config: `e2e/` test directory, a Chromium project, and a `webServer` that auto-starts the Vite dev server at `http://localhost:1420`.

### `src/test/setup.ts` (new)

- Imports `@testing-library/jest-dom` matchers.
- Provides `localStorage` and `matchMedia` mocks (jsdom does not implement these by default).

### `index.html`

- Changed the `<title>` to `API Studio`.

### `src/main.tsx`

- Added `import "./index.css";` so global styles load.

### `src/index.css` (new)

- Tailwind v4 entry (`@import "tailwindcss"`).
- CSS-variable theme tokens for light/dark mode.

### `src-tauri/tauri.conf.json`

- `productName` → `API Studio`.
- `identifier` → `com.ajoy.api-studio`.
- Window title → `API Studio`, larger default size (1200x800, min 800x600).

### `src-tauri/Cargo.toml`

- Package name → `api-studio`, lib name → `api_studio_lib`.

### `src-tauri/src/main.rs`

- Updated the lib reference to `api_studio_lib::run()`.

### `src-tauri/src/lib.rs`

- Added a `ping` placeholder command to verify the frontend ↔ backend IPC bridge.
- Added an inline `#[cfg(test)]` unit-test module (example tests for `ping` and `greet`).

### `.gitignore`

- Added `/dist`, `/test-results/`, and `/playwright-report/` so generated build/test output is not committed.

## 5. Verification commands

Run these to confirm the environment is healthy:

```bash
npm run typecheck   # TypeScript type checking
npm run build       # Frontend production build
npm run test:run    # Frontend unit tests
npm run test:e2e    # End-to-end tests
cd src-tauri && cargo test   # Rust backend tests
npm run tauri dev   # Launches the desktop app
```

## 6. Project structure after setup

```
api-studio/
├── src/                     # React frontend
│   ├── components/
│   │   ├── layout/          # AppShell, Sidebar, TopBar, StatusBar
│   │   └── ui/              # Reusable UI primitives (Button)
│   ├── pages/               # Route pages
│   ├── stores/              # Zustand stores (theme, request, collection, environment)
│   ├── lib/                 # Utilities (cn)
│   ├── __tests__/           # Frontend unit tests
│   ├── test/                # Test setup (setup.ts)
│   ├── App.tsx              # Router + theme init
│   ├── main.tsx
│   └── index.css
├── e2e/                     # Playwright end-to-end tests
├── src-tauri/               # Rust backend
│   └── src/                 # lib.rs, main.rs
└── docs/                    # Project documentation
```
