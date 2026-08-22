# Development Guide

## Requirements

Install:

- Node.js 22 LTS
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

feature/*
bugfix/*
```

---

## Pre-commit Hooks

Install Git hooks to run quality checks automatically:

```bash
# Install gitleaks (if not installed)
brew install gitleaks

# Run setup script
./setup.sh
```

This configures Git to use hooks in `.githooks/`. Four hooks are available:

| Hook | Trigger | Checks |
|------|---------|--------|
| **pre-commit** | `git commit` | Gitleaks + Prettier + Typecheck + Unit + Rust |
| **pre-merge-commit** | `git merge` | Gitleaks + Prettier + Typecheck (fast) |
| **pre-push** | `git push` | Gitleaks + Prettier + Typecheck + Unit + Rust |
| **pre-rebase** | `git rebase` | Prevents rebasing main, warns about destructive ops |

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

API Studio uses GitHub Actions for continuous integration and delivery. The pipeline is split into two workflows for optimal developer experience:

| Workflow | File | Trigger | Purpose |
|----------|------|---------|---------|
| **Quality Gates** | `quality-gates.api-studio.yml` | Pull requests | Fast validation (~2-3 min) |
| **CICD Pipeline** | `CICD.api-studio.yml` | Push to main | Full validation + builds (~10-15 min) |

Each workflow uses **separate jobs** for each task, enabling parallel execution and individual status checks.

## Quality Gates (Pull Requests)

Runs on every pull request to `main`. Three parallel jobs:

| Job | Purpose |
|-----|---------|
| **Type Check** | TypeScript type checking |
| **Format Check** | Prettier format checking |
| **Unit Tests** | Vitest unit tests |

## CICD Pipeline (Push to Main)

Runs on every push to `main`. Full validation and builds with separate jobs:

### Validation Jobs (parallel)

| Job | Purpose |
|-----|---------|
| **Type Check** | TypeScript type checking |
| **Format Check** | Prettier format checking |
| **Unit Tests** | Vitest unit tests |
| **E2E Tests** | Playwright end-to-end tests |
| **Rust Tests** | Cargo tests (with Linux dependencies) |
| **Security Scan** | Trufflehog secret scanning |
| **Dependency Audit** | npm audit + cargo audit |

### Build Jobs (after validation)

| Job | Platform | Artifacts |
|-----|----------|-----------|
| **Build (macOS)** | macOS-latest | .app, .dmg |
| **Build (Linux)** | ubuntu-latest | .deb, .AppImage |
| **Build (Windows)** | windows-latest | .msi, .exe |

Artifacts retained for 30 days.

**Secret scanning layers:**

| Layer | Tool | Purpose |
|-------|------|---------|
| **Local (pre-commit)** | gitleaks | Fast, pattern-based scanning before commit |
| **CI (GitHub Actions)** | trufflehog | Verified scans against live APIs |

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
