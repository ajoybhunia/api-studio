# API Design

This document describes the core API architecture for the application, including the protocols that are supported, the structure of requests, and the information captured from responses.

---

# Supported Protocols

The application is designed to support multiple API protocols. The initial release (MVP) focuses on REST, while the architecture is kept flexible enough to support additional protocols in future versions.

## MVP

### REST
The first version of the application will support REST APIs. Users can create, edit, send, and manage HTTP requests using standard HTTP methods.

Supported methods include:

- GET
- POST
- PUT
- PATCH
- DELETE
- HEAD
- OPTIONS

---

## Future Support

The following protocols are planned for future releases:

### GraphQL
Support for GraphQL queries and mutations with features such as:

- Query editor
- Variables
- Operation selection
- Schema introspection

### WebSocket
Support for establishing persistent WebSocket connections, including:

- Connect/Disconnect
- Send messages
- Receive live messages
- Connection history

### gRPC
Support for gRPC services using Protocol Buffer definitions, including:

- Service discovery
- Unary requests
- Streaming requests
- Metadata handling

---

# Request Model

A request represents everything required to communicate with an API endpoint.

Each request contains the following components.

## Method

The HTTP method that defines the operation.

Examples:

- GET
- POST
- PUT
- PATCH
- DELETE

---

## URL

The complete endpoint that will receive the request.

Example:

```
https://api.example.com/users
```

---

## Headers

Key-value pairs sent with the request.

Examples:

```
Authorization: Bearer <token>
Content-Type: application/json
Accept: application/json
```

---

## Query Parameters

Optional parameters appended to the URL.

Example:

```
GET /users?page=1&limit=20
```

---

## Body

Optional payload sent with the request.

Supported body types may include:

- JSON
- Form Data
- URL Encoded
- XML
- Plain Text
- Binary

---

## Authentication

Authentication settings associated with the request.

Supported authentication methods (planned):

- None
- API Key
- Bearer Token
- Basic Authentication
- OAuth 2.0

---

# Response Model

A response contains all information returned by the server after a request is executed.

## Status Code

The HTTP status returned by the server.

Examples:

- 200 OK
- 201 Created
- 400 Bad Request
- 401 Unauthorized
- 404 Not Found
- 500 Internal Server Error

---

## Headers

Metadata returned by the server.

Example:

```
Content-Type: application/json
Cache-Control: no-cache
```

---

## Body

The actual response payload returned by the server.

This may contain:

- JSON
- XML
- HTML
- Plain Text
- Binary Data

---

## Timing

Performance metrics for the request.

Examples:

- DNS lookup
- TCP connection time
- TLS handshake
- Time to first byte (TTFB)
- Total response time

---

## Size

Information about the amount of data transferred.

Includes:

- Request size
- Response size
- Total transferred bytes

---

# Design Goals

The request and response models are designed to be:

- Protocol-independent where possible
- Easy to extend for future protocols
- Serializable for storage
- Simple to display in the user interface
- Compatible with collections, history, and environment variables