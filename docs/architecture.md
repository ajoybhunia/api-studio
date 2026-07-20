# API Studio Architecture

## Overview

API Studio follows a hybrid desktop architecture.

The application consists of:

- Frontend layer
- Native backend layer
- Storage layer
- Networking layer

---

# High-Level Architecture

                     React + TypeScript
                            |
                            |
                       Tauri Bridge
                            |
                            |
                       Rust Backend
                            |
    ------------------------------------------------
    |              |              |                |
 reqwest        SQLx          keyring           tokio
    |              |              |                |
HTTP APIs      SQLite DB     Credentials      Async Tasks

---

# Frontend Responsibilities

The frontend handles:

- User interface
- Application state
- Request editor
- Response viewer
- Navigation
- User interactions

---

# Rust Backend Responsibilities

The backend handles:

- HTTP requests
- File operations
- Database access
- Security-sensitive operations
- Native integrations

---

# Communication

Frontend communicates with Rust using Tauri commands.

Example:

```
React

sendRequest()

        |

Tauri Command

        |

Rust HTTP Engine

        |

API Server
```

---

# Design Principles

## Separation of Concerns

UI logic should not contain:

- Network logic
- Database logic
- File operations

---

## Extensibility

Future features should be added without rewriting the core system.

Examples:

- Plugins
- New protocols
- Export formats
- Authentication providers