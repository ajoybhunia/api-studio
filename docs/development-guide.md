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
