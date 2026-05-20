package handler

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/go-chi/chi/v5"

	authmiddleware "github.com/N95Ryan/flip-back/internal/middleware"
	"github.com/N95Ryan/flip-back/internal/model"
	"github.com/N95Ryan/flip-back/internal/service"
)

// JournalHandler exposes HTTP endpoints for the training journal.
type JournalHandler struct {
	svc *service.JournalService
}

// NewJournalHandler builds a handler backed by the service.
func NewJournalHandler(svc *service.JournalService) *JournalHandler {
	return &JournalHandler{svc: svc}
}

type journalListResponse struct {
	Data  []model.JournalEntry `json:"data"`
	Count int                  `json:"count"`
}

type journalSingleResponse struct {
	Data model.JournalEntry `json:"data"`
}

type journalEntryRequest struct {
	SessionDate     string `json:"session_date"`
	DurationMinutes int    `json:"duration_minutes"`
	Intensity       int    `json:"intensity"`
	Notes           string `json:"notes"`
}

func (req journalEntryRequest) toModel() model.JournalEntry {
	return model.JournalEntry{
		SessionDate:     req.SessionDate,
		DurationMinutes: req.DurationMinutes,
		Intensity:       req.Intensity,
		Notes:           req.Notes,
	}
}

// ListEntries handles GET /journal.
func (h *JournalHandler) ListEntries(w http.ResponseWriter, r *http.Request) {
	userID, ok := authmiddleware.UserIDFromContext(r.Context())
	if !ok {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}

	entries, err := h.svc.ListEntries(userID)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "could not list journal entries"})
		return
	}
	if entries == nil {
		entries = []model.JournalEntry{}
	}
	writeJSON(w, http.StatusOK, journalListResponse{Data: entries, Count: len(entries)})
}

// CreateEntry handles POST /journal.
func (h *JournalHandler) CreateEntry(w http.ResponseWriter, r *http.Request) {
	userID, ok := authmiddleware.UserIDFromContext(r.Context())
	if !ok {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}

	var req journalEntryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request body"})
		return
	}

	created, err := h.svc.CreateEntry(userID, req.toModel())
	if err != nil {
		writeJournalError(w, err)
		return
	}
	writeJSON(w, http.StatusCreated, journalSingleResponse{Data: *created})
}

// UpdateEntry handles PUT /journal/{id}.
func (h *JournalHandler) UpdateEntry(w http.ResponseWriter, r *http.Request) {
	userID, ok := authmiddleware.UserIDFromContext(r.Context())
	if !ok {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}

	var req journalEntryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request body"})
		return
	}

	id := chi.URLParam(r, "id")
	updated, err := h.svc.UpdateEntry(id, userID, req.toModel())
	if err != nil {
		writeJournalError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, journalSingleResponse{Data: *updated})
}

// DeleteEntry handles DELETE /journal/{id}.
func (h *JournalHandler) DeleteEntry(w http.ResponseWriter, r *http.Request) {
	userID, ok := authmiddleware.UserIDFromContext(r.Context())
	if !ok {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}

	id := chi.URLParam(r, "id")
	if err := h.svc.DeleteEntry(id, userID); err != nil {
		writeJournalError(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func writeJournalError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, service.ErrInvalidIntensity):
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "intensity must be between 1 and 5"})
	case errors.Is(err, service.ErrInvalidSessionDate):
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid session_date, expected YYYY-MM-DD"})
	case errors.Is(err, service.ErrFutureSessionDate):
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "session_date cannot be in the future"})
	case errors.Is(err, service.ErrJournalEntryNotFound):
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "journal entry not found"})
	default:
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "could not process journal entry"})
	}
}
