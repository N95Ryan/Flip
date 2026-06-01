package handler

import (
	"encoding/json"
	"errors"
	"io"
	"log"
	"net/http"

	authmiddleware "github.com/N95Ryan/flip-back/internal/middleware"
	"github.com/N95Ryan/flip-back/internal/service"
)

// ProfileHandler exposes HTTP endpoints for the authenticated user's profile.
type ProfileHandler struct {
	svc *service.ProfileService
}

// NewProfileHandler builds a handler backed by the profile service.
func NewProfileHandler(svc *service.ProfileService) *ProfileHandler {
	return &ProfileHandler{svc: svc}
}

type profileResponse struct {
	User any `json:"user"`
}

type patchProfileRequest struct {
	Username string `json:"username"`
}

// GetMe handles GET /users/me.
func (h *ProfileHandler) GetMe(w http.ResponseWriter, r *http.Request) {
	userID, ok := authmiddleware.UserIDFromContext(r.Context())
	if !ok {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}

	user, err := h.svc.GetMe(userID)
	if err != nil {
		h.writeProfileError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, profileResponse{User: user})
}

// PatchMe handles PATCH /users/me.
func (h *ProfileHandler) PatchMe(w http.ResponseWriter, r *http.Request) {
	userID, ok := authmiddleware.UserIDFromContext(r.Context())
	if !ok {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}

	var req patchProfileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request body"})
		return
	}

	user, err := h.svc.UpdateUsername(userID, req.Username)
	if err != nil {
		log.Printf("PATCH /users/me user=%s err=%v", userID, err)
		h.writeProfileError(w, err)
		return
	}

	log.Printf("PATCH /users/me user=%s username=%s", userID, user.Username)
	writeJSON(w, http.StatusOK, profileResponse{User: user})
}

// UploadAvatar handles POST /users/me/avatar (multipart field "file").
func (h *ProfileHandler) UploadAvatar(w http.ResponseWriter, r *http.Request) {
	userID, ok := authmiddleware.UserIDFromContext(r.Context())
	if !ok {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}

	if err := r.ParseMultipartForm(6 << 20); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid multipart form"})
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "file field is required"})
		return
	}
	defer file.Close()

	data, err := io.ReadAll(io.LimitReader(file, 5<<20+1))
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "could not read file"})
		return
	}

	contentType := header.Header.Get("Content-Type")
	if contentType == "" || contentType == "application/octet-stream" {
		contentType = http.DetectContentType(data)
	}

	user, err := h.svc.UploadAvatar(userID, data, contentType)
	if err != nil {
		h.writeProfileError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, profileResponse{User: user})
}

// DeleteAvatar handles DELETE /users/me/avatar.
func (h *ProfileHandler) DeleteAvatar(w http.ResponseWriter, r *http.Request) {
	userID, ok := authmiddleware.UserIDFromContext(r.Context())
	if !ok {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}

	user, err := h.svc.DeleteAvatar(userID)
	if err != nil {
		h.writeProfileError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, profileResponse{User: user})
}

func (h *ProfileHandler) writeProfileError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, service.ErrProfileNotFound):
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "user not found"})
	case errors.Is(err, service.ErrInvalidUsername):
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Lettres, chiffres et _ uniquement (3–30 caractères)"})
	case errors.Is(err, service.ErrUsernameTaken):
		writeJSON(w, http.StatusConflict, map[string]string{"error": "username already taken"})
	case errors.Is(err, service.ErrAvatarTooLarge):
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "avatar must be 5 MB or smaller"})
	case errors.Is(err, service.ErrAvatarInvalidType):
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "avatar must be JPEG, PNG, or WebP"})
	default:
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "could not update profile"})
	}
}
