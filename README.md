# API Studio

A modern, lightweight, Git-friendly API development platform for designing, testing, and debugging APIs.

## Quick Start

```bash
git clone https://github.com/ajoybhunia/api-studio.git
cd api-studio
npm install
npm run tauri dev
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19 + TypeScript + Vite 7 + Tailwind CSS 4 |
| State | Zustand 5 |
| Desktop | Tauri v2 |
| Backend | Rust (reqwest, serde, tokio) |
| Testing | Vitest + Playwright + Cargo test |

## Documentation

See the [Wiki](https://github.com/ajoybhunia/api-studio/wiki) for full documentation:

- [[Development-Setup]] — Prerequisites, install, run
- [[Architecture]] — Tech stack, data flow, entity model
- [[Testing]] — Unit, E2E, and Rust test details
- [[Contributing]] — PR workflow, code style, branch naming
- [[CI-CD]] — Pipeline overview, required checks
- [[Issue-Style-Guide]] — How to write APIS issues

## Platforms

| Platform | Installer |
|----------|-----------|
| macOS | `.dmg` (Apple Silicon + Intel) |
| Linux | `.deb` + `.AppImage` |
| Windows | `.msi` + `.exe` (NSIS) |

## License

MIT License
