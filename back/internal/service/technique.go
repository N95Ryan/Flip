package service

import (
	"github.com/N95Ryan/flip-back/internal/model"
	"github.com/N95Ryan/flip-back/internal/repository"
)

// TechniqueService coordinates technique use cases.
type TechniqueService struct {
	repo *repository.TechniqueRepository
}

// NewTechniqueService constructs the service with the given repository.
func NewTechniqueService(repo *repository.TechniqueRepository) *TechniqueService {
	return &TechniqueService{repo: repo}
}

// ListTechniques applies optional category and difficulty filters.
func (s *TechniqueService) ListTechniques(category, difficulty string) []model.Technique {
	return s.repo.List(category, difficulty)
}

// GetTechnique returns a single technique by id, if present.
func (s *TechniqueService) GetTechnique(id string) (model.Technique, bool) {
	return s.repo.GetByID(id)
}
