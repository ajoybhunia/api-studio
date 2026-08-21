# Development Guide

## Requirements

Install:

- Node.js
- Rust
- Cargo
- SQLite

---

# Running Development

Frontend:

```
npm install

npm run dev
```

Tauri:

```
npm run tauri dev
```

---

# Code Structure

```
src/

frontend code


src-tauri/

Rust backend
```

---

# Development Rules

## Code Style

Use:

- ESLint
- Prettier
- Rustfmt

---

## Git Workflow

Branches:

```
main

develop

feature/*
bugfix/*
```

---

## Commit Format

Example:

```
feat: add graphql support

fix: resolve request timeout issue

docs: update architecture
```

---

# CI/CD Pipeline

## Overview

API Studio uses GitHub Actions for continuous integration and delivery. The pipeline automatically validates code quality, runs tests, and builds the Tauri app for all platforms.

## Workflow Triggers

- **Push to `main` or `develop`**: Runs full validation + build
- **Pull requests**: Runs validation only
- **Manual dispatch**: Available via GitHub UI

## Pipeline Jobs

### 1. Validate

Runs on Ubuntu and performs:

- TypeScript type checking
- Prettier format checking
- Unit tests (Vitest)
- E2E tests (Playwright)
- Rust tests (Cargo)
- Secret scanning (trufflehog)
- Dependency auditing (npm audit + cargo audit)

### 2. Build

Runs on macOS, Linux, and Windows after validation passes:

- Builds Tauri desktop app for each platform
- Produces artifacts: .app (macOS), .deb/.AppImage (Linux), .msi (Windows)
- Artifacts retained for 30 days

### 3. Security

Runs security scans and uploads SARIF reports to GitHub Security tab.

## Running Locally

Before pushing, run these checks locally:

```bash
# Type check
npm run typecheck

# Format check
npm run format:check

# Unit tests
npm run test:run

# E2E tests
npm run test:e2e

# Rust tests
cd src-tauri && cargo test
```
