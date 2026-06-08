package repository

import (
	"database/sql"
	"fmt"

	"github.com/N95Ryan/flip-back/internal/model"
	"github.com/lib/pq"
)

// TechniqueRepository provides read access to the technique catalog in PostgreSQL.
type TechniqueRepository struct {
	db *sql.DB
}

// NewTechniqueRepository returns a repository backed by the given database.
func NewTechniqueRepository(db *sql.DB) *TechniqueRepository {
	return &TechniqueRepository{db: db}
}

// ListTechniques returns techniques optionally filtered by category.
func (r *TechniqueRepository) ListTechniques(category string) ([]model.Technique, error) {
	var (
		rows *sql.Rows
		err  error
	)
	if category == "" {
		rows, err = r.db.Query(`
			SELECT id, name, category, subcategory, description, difficulty, tags
			FROM techniques
			ORDER BY category, name`)
	} else {
		rows, err = r.db.Query(`
			SELECT id, name, category, subcategory, description, difficulty, tags
			FROM techniques
			WHERE category = $1
			ORDER BY name`, category)
	}
	if err != nil {
		return nil, fmt.Errorf("list techniques: %w", err)
	}
	defer rows.Close()

	var techniques []model.Technique
	for rows.Next() {
		var t model.Technique
		if err := rows.Scan(
			&t.ID,
			&t.Name,
			&t.Category,
			&t.Subcategory,
			&t.Description,
			&t.Difficulty,
			pq.Array(&t.Tags),
		); err != nil {
			return nil, fmt.Errorf("scan technique: %w", err)
		}
		techniques = append(techniques, t)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("list techniques rows: %w", err)
	}
	return techniques, nil
}

// GetTechniqueByID returns a technique by id, or nil if not found.
func (r *TechniqueRepository) GetTechniqueByID(id string) (*model.Technique, error) {
	const q = `
		SELECT id, name, category, subcategory, description, difficulty, tags
		FROM techniques
		WHERE id = $1`

	var t model.Technique
	err := r.db.QueryRow(q, id).Scan(
		&t.ID,
		&t.Name,
		&t.Category,
		&t.Subcategory,
		&t.Description,
		&t.Difficulty,
		pq.Array(&t.Tags),
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("get technique by id: %w", err)
	}
	return &t, nil
}

// List returns techniques filtered by category and/or difficulty (empty values mean no filter).
func (r *TechniqueRepository) List(category, difficulty string) []model.Technique {
	items, err := r.ListTechniques(category)
	if err != nil {
		return nil
	}
	if difficulty == "" {
		return items
	}
	var out []model.Technique
	for _, t := range items {
		if t.Difficulty == difficulty {
			out = append(out, t)
		}
	}
	return out
}

// GetByID returns a technique by id.
func (r *TechniqueRepository) GetByID(id string) (model.Technique, bool) {
	t, err := r.GetTechniqueByID(id)
	if err != nil || t == nil {
		return model.Technique{}, false
	}
	return *t, true
}
