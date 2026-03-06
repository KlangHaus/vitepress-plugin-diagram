# Sequence Diagram

Sequence diagrams show interactions between participants over time.

## Basic Messages

```mermaid
sequenceDiagram
  Alice->>Bob: Hello Bob
  Bob-->>Alice: Hi Alice
```

## Participants & Actors

```mermaid
sequenceDiagram
  participant S as Server
  actor U as User
  U->>S: GET /api/data
  S-->>U: 200 OK
```

## Arrow Types

| Syntax | Style |
|--------|-------|
| `->` | Solid, open head |
| `->>` | Solid, filled head |
| `-->` | Dotted, open head |
| `-->>` | Dotted, filled head |
| `-x` | Solid, cross |
| `--x` | Dotted, cross |

```mermaid
sequenceDiagram
  A->>B: Solid arrow
  B-->>A: Dotted arrow
  A-xB: Cross
```

## Notes

```mermaid
sequenceDiagram
  participant A
  participant B
  Note right of A: This is a note
  A->>B: Hello
  Note over A,B: Shared note
```

## Loops

```mermaid
sequenceDiagram
  Client->>Server: Request
  loop Every 5 seconds
    Server->>Client: Heartbeat
  end
```

## Alt / Else

```mermaid
sequenceDiagram
  Client->>Server: Login
  alt Valid credentials
    Server-->>Client: 200 OK
  else Invalid
    Server-->>Client: 401 Unauthorized
  end
```

## Full Example

```mermaid
sequenceDiagram
  actor User
  participant App
  participant API
  participant DB

  User->>App: Click submit
  App->>API: POST /orders
  API->>DB: INSERT order
  DB-->>API: OK
  API-->>App: 201 Created
  App-->>User: Show confirmation
```
