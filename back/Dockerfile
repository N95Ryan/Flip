# syntax=docker/dockerfile:1

# --- Step 1 : build ---
FROM golang:1.25-alpine AS build
WORKDIR /src

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 go build -o /out/api ./cmd
RUN CGO_ENABLED=0 go build -o /out/migrate ./cmd/migrate

# --- Step 2 : final image ---
FROM gcr.io/distroless/static-debian12:nonroot
WORKDIR /
COPY --from=build /out/api /api
COPY --from=build /out/migrate /migrate
COPY --from=build /src/migrations /migrations

EXPOSE 8080
ENTRYPOINT ["/api"]