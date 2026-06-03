// Command migrate applies SQL files in back/migrations/ to DATABASE_URL.
// Usage: go run ./cmd/migrate (from back/)
package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

func main() {
	_ = godotenv.Load()

	only := os.Args[1:]
	if len(only) > 0 && only[0] == "--" {
		only = only[1:]
	}

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL is required")
	}

	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatalf("database ping failed: %v", err)
	}

	migrationsDir := filepath.Join("migrations")
	entries, err := os.ReadDir(migrationsDir)
	if err != nil {
		log.Fatalf("read migrations: %v", err)
	}

	var files []string
	for _, e := range entries {
		if e.IsDir() || !strings.HasSuffix(e.Name(), ".sql") {
			continue
		}
		files = append(files, e.Name())
	}
	sort.Strings(files)

	if len(only) > 0 {
		want := make(map[string]bool, len(only))
		for _, o := range only {
			want[o] = true
		}
		var filtered []string
		for _, name := range files {
			if want[name] {
				filtered = append(filtered, name)
			}
		}
		files = filtered
		if len(files) == 0 {
			log.Fatalf("no migration files matched: %v", only)
		}
	}

	for _, name := range files {
		path := filepath.Join(migrationsDir, name)
		body, err := os.ReadFile(path)
		if err != nil {
			log.Fatalf("read %s: %v", name, err)
		}
		log.Printf("applying %s", name)
		if _, err := db.Exec(string(body)); err != nil {
			// 001 assumes an existing users table (legacy Supabase); skip if not created yet.
			if name == "001_users_password_hash.sql" && strings.Contains(err.Error(), `relation "users" does not exist`) {
				log.Printf("skip %s: users table not present", name)
				continue
			}
			log.Fatalf("apply %s: %v", name, err)
		}
	}

	fmt.Println("migrations applied successfully")
}
