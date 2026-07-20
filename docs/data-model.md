# Data Model

This document describes the core data structures used by the application. These models define how requests, collections, environments, and request history are stored and related.

---

# Overview

The application stores four primary entities:

- Collections
- Requests
- Environments
- History

Relationships:

```
Collection
    │
    ├── Request
    │       │
    │       └── History
    │
    └── Environment (optional)
```

---

# Collection

A Collection is a logical container used to organize multiple API requests.

Example:

```
User Service

├── Login
├── Get Users
├── Create User
└── Delete User
```

## Fields

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| name | String | Collection name |
| description | String | Optional description |
| created_at | DateTime | Creation timestamp |
| updated_at | DateTime | Last modified timestamp |

---

# Request

A Request represents a single API request saved by the user.

Each request belongs to exactly one collection.

## Fields

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique request identifier |
| collection_id | UUID | Parent collection |
| name | String | Display name |
| method | String | HTTP method |
| url | String | Endpoint URL |
| headers | JSON | Request headers |
| query_params | JSON | URL query parameters |
| body | JSON/Text | Request body |
| authentication | JSON | Authentication configuration |
| created_at | DateTime | Creation timestamp |
| updated_at | DateTime | Last modified timestamp |

---

# Environment

An Environment stores reusable variables that can be substituted into requests.

Example:

```
Development

BASE_URL=https://dev.example.com
TOKEN=abc123
```

```
Production

BASE_URL=https://api.example.com
TOKEN=xyz987
```

Variables can be referenced inside requests using placeholders.

Example:

```
{{BASE_URL}}/users
```

## Fields

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| name | String | Environment name |
| variables | JSON | Key-value variable collection |
| created_at | DateTime | Creation timestamp |
| updated_at | DateTime | Last modified timestamp |

---

# History

History stores every executed request along with its corresponding response.

This enables users to:

- Review previous requests
- Compare responses
- Re-run requests
- Analyze performance

## Fields

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique history identifier |
| request_id | UUID | Associated request |
| response | JSON | Stored response data |
| status_code | Integer | HTTP status |
| duration | Integer | Response time (ms) |
| response_size | Integer | Response size (bytes) |
| timestamp | DateTime | Execution time |

---

# Entity Relationships

```
Collection
    │
    ├──────────────┐
    │              │
Request        Environment
    │
    │
History
```

- One Collection can contain many Requests.
- One Request belongs to one Collection.
- One Request can have many History records.
- Environments are reusable across multiple requests.

---

# Storage Considerations

The data model is designed to support:

- Local-first storage
- Offline usage
- Fast search and filtering
- Future synchronization
- Versioning
- Import and export of collections
- Backup and restore

---

# Future Extensions

The following models may be added in later versions:

- Workspace
- Folder
- Certificate
- Cookie Jar
- Global Variables
- Plugin Configuration
- User Preferences
- Mock Server Definitions
- Scheduled Requests
- Test Scripts
- Pre-request Scripts

The current schema intentionally remains minimal to support the MVP while allowing future expansion without major structural changes.