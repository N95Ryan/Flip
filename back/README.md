# Flip — backend API

Go REST API for the Flip judo companion app (Chi router, layered architecture).

## Run

```bash
cd back
cp .env.example .env   # optional
go mod tidy
go run cmd/main.go
```

Server listens on `PORT` (default `8080`).

## Techniques API

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/techniques` | List all (`?category=`, `?difficulty=` optional) |
| `GET` | `/techniques/{id}` | One technique by id |

List response: `{ "data": [...], "count": N }`  
Single response: `{ "data": { ... } }`  
Not found: `{ "error": "technique not found" }` with HTTP 404.
