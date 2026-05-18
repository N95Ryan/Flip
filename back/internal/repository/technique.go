package repository

import "github.com/N95Ryan/flip-back/internal/model"

// TechniqueRepository provides read access to the technique catalog in memory.
type TechniqueRepository struct {
	techniques []model.Technique
}

// NewTechniqueRepository returns a repository backed by the given static slice.
func NewTechniqueRepository(techniques []model.Technique) *TechniqueRepository {
	// Copy to avoid accidental mutation from callers.
	copyData := make([]model.Technique, len(techniques))
	copy(copyData, techniques)
	return &TechniqueRepository{techniques: copyData}
}

// List returns techniques filtered by category and/or difficulty (empty values mean no filter).
func (r *TechniqueRepository) List(category, difficulty string) []model.Technique {
	var out []model.Technique
	for _, t := range r.techniques {
		if category != "" && t.Category != category {
			continue
		}
		if difficulty != "" && t.Difficulty != difficulty {
			continue
		}
		out = append(out, t)
	}
	return out
}

// GetByID returns a technique by id.
func (r *TechniqueRepository) GetByID(id string) (model.Technique, bool) {
	for _, t := range r.techniques {
		if t.ID == id {
			return t, true
		}
	}
	return model.Technique{}, false
}
