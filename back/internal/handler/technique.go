package handler

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"

	"github.com/N95Ryan/flip-back/internal/model"
	"github.com/N95Ryan/flip-back/internal/service"
)

// TechniqueHandler exposes HTTP endpoints for techniques.
type TechniqueHandler struct {
	svc *service.TechniqueService
}

// NewTechniqueHandler builds a handler backed by the service.
func NewTechniqueHandler(svc *service.TechniqueService) *TechniqueHandler {
	return &TechniqueHandler{svc: svc}
}

type listResponse struct {
	Data  []model.Technique `json:"data"`
	Count int               `json:"count"`
}

type singleResponse struct {
	Data model.Technique `json:"data"`
}

// ListTechniques handles GET /techniques with optional ?category= and ?difficulty=.
func (h *TechniqueHandler) ListTechniques(w http.ResponseWriter, r *http.Request) {
	category := r.URL.Query().Get("category")
	difficulty := r.URL.Query().Get("difficulty")

	items := h.svc.ListTechniques(category, difficulty)
	writeJSON(w, http.StatusOK, listResponse{Data: items, Count: len(items)})
}

// GetTechnique handles GET /techniques/{id}.
func (h *TechniqueHandler) GetTechnique(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	t, ok := h.svc.GetTechnique(id)
	if !ok {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "technique not found"})
		return
	}
	writeJSON(w, http.StatusOK, singleResponse{Data: t})
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}
