package db

import (
	"database/sql"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strings"
)

// ApplyMigrations runs idempotent SQL files from migrationsDir (e.g. "migrations").
// If onlyFiles is non-empty, only those basenames are applied (e.g. "003_user_profile.sql").
func ApplyMigrations(db *sql.DB, migrationsDir string, onlyFiles ...string) {
	entries, err := os.ReadDir(migrationsDir)
	if err != nil {
		log.Printf("WARNING: migrations dir %q: %v", migrationsDir, err)
		return
	}

	want := make(map[string]bool, len(onlyFiles))
	for _, name := range onlyFiles {
		want[name] = true
	}

	var files []string
	for _, e := range entries {
		if e.IsDir() || !strings.HasSuffix(e.Name(), ".sql") {
			continue
		}
		if len(onlyFiles) > 0 && !want[e.Name()] {
			continue
		}
		files = append(files, e.Name())
	}
	sort.Strings(files)

	for _, name := range files {
		path := filepath.Join(migrationsDir, name)
		body, err := os.ReadFile(path)
		if err != nil {
			log.Printf("WARNING: read migration %s: %v", name, err)
			continue
		}
		if _, err := db.Exec(string(body)); err != nil {
			log.Printf("WARNING: migration %s: %v", name, err)
			continue
		}
		log.Printf("migration applied: %s", name)
	}
}
