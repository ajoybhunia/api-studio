# API Studio

A modern, lightweight, Git-friendly API development platform for designing, testing, and debugging APIs.

Built with a hybrid desktop architecture: a React frontend, a Tauri bridge, and a Rust backend.

## Tech Stack

| Layer            | Technology                                     |
| ---------------- | ---------------------------------------------- |
| Frontend         | React 19 + TypeScript + Vite + Tailwind CSS v4 |
| State management | Zustand                                        |
| Routing          | React Router                                   |
| Desktop shell    | Tauri v2                                       |
| Backend          | Rust (reqwest, serde — incoming in Phase 2)    |

## Prerequisites

- [Node.js](https://nodejs.org/) (v20 or later)
- npm (bundled with Node.js)
- [Rust](https://www.rust-lang.org/) and Cargo
- SQLite (used in a later phase)

Verify your environment:

```bash
node --version      # v20+
npm --version
cargo --version     # Rust 1.70+
rustc --version
```

## Getting Started

Clone the repository and install dependencies:

```bash
git clone <repository-url> api-studio
cd api-studio
npm install
```

Start the desktop application in development mode:

```bash
npm run tauri dev
```

This launches the Vite dev server and opens the native application window.

## Available Scripts

Run from the project root:

| Command                | Description                               |
| ---------------------- | ----------------------------------------- |
| `npm run dev`          | Start the Vite dev server only (frontend) |
| `npm run build`        | Type-check and build the frontend         |
| `npm run preview`      | Preview the built frontend                |
| `npm run typecheck`    | Type-check the TypeScript code            |
| `npm run format`       | Format the codebase with Prettier         |
| `npm run format:check` | Check formatting without writing          |
| `npm run test`         | Run frontend unit tests in watch mode     |
| `npm run test:run`     | Run frontend unit tests once              |
| `npm run test:e2e`     | Run Playwright end-to-end tests           |
| `npm run tauri dev`    | Run the full desktop app in dev mode      |
| `npm run tauri build`  | Build a distributable desktop app         |

## Testing

The project uses Vitest for frontend unit tests, Playwright for end-to-end tests, and Cargo for Rust backend tests.

### Unit tests (Vitest + React Testing Library)

Located in `src/__tests__/` (mirroring the source structure):

```bash
npm run test         # watch mode
npm run test:run     # single run
```

### End-to-end tests (Playwright)

Located in `e2e/`. Tests run in a real Chromium browser against the Vite dev server, which starts automatically:

```bash
npm run test:e2e
```

> **Note:** E2E tests currently target the web frontend only. Testing Rust IPC (`invoke`) against the native window requires `tauri-driver`, planned for a later phase.

### Backend tests (Cargo)

Rust unit tests live inline via `#[cfg(test)]` in `src-tauri/src/`, and integration tests live in `src-tauri/tests/`:

```bash
cd src-tauri
cargo test
```

## Project Structure

```
api-studio/
├── src/                    # React frontend
│   ├── components/         # Layout & UI primitives
│   ├── pages/              # Route pages
│   ├── stores/             # Zustand stores
│   ├── lib/                # Utilities
│   ├── __tests__/          # Frontend unit tests
│   └── test/               # Test setup (jest-dom, mocks)
├── e2e/                    # Playwright end-to-end tests
├── src-tauri/              # Rust backend + Tauri config
│   └── src/                # Rust source (lib.rs, main.rs)
└── docs/                   # Project documentation
```

## Documentation

See the `docs/` directory for architecture, data model, API design, tech stack decisions, and the roadmap.

## License

Distributed under the MIT License. See `LICENSE`.
