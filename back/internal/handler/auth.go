package handler

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"

	"github.com/N95Ryan/flip-back/internal/service"
)

// AuthHandler exposes HTTP endpoints for authentication.
type AuthHandler struct {
	svc *service.AuthService
}

// NewAuthHandler builds a handler backed by the auth service.
func NewAuthHandler(svc *service.AuthService) *AuthHandler {
	return &AuthHandler{svc: svc}
}

type authRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type authResponse struct {
	User  any    `json:"user"`
	Token string `json:"token"`
}

// Register handles POST /auth/register.
func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req authRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request body"})
		return
	}

	user, token, err := h.svc.Register(req.Email, req.Password)
	if err != nil {
		switch {
		case errors.Is(err, service.ErrInvalidInput):
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "email and password (min 8 characters) are required"})
		case errors.Is(err, service.ErrEmailExists):
			writeJSON(w, http.StatusConflict, map[string]string{"error": "email already registered"})
		case errors.Is(err, service.ErrSchemaOutdated):
			writeJSON(w, http.StatusServiceUnavailable, map[string]string{"error": "database needs migration — redeploy backend or run migrations on Neon"})
		default:
			log.Printf("register failed for %q: %v", req.Email, err)
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "could not register user"})
		}
		return
	}

	writeJSON(w, http.StatusCreated, authResponse{User: user, Token: token})
}

// Login handles POST /auth/login.
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req authRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request body"})
		return
	}

	user, token, err := h.svc.Login(req.Email, req.Password)
	if err != nil {
		switch {
		case errors.Is(err, service.ErrInvalidInput):
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "email and password are required"})
		case errors.Is(err, service.ErrInvalidCredentials):
			writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "invalid email or password"})
		case errors.Is(err, service.ErrSchemaOutdated):
			writeJSON(w, http.StatusServiceUnavailable, map[string]string{"error": "database needs migration — redeploy backend or run migrations on Neon"})
		default:
			log.Printf("login failed for %q: %v", req.Email, err)
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "could not log in"})
		}
		return
	}

	writeJSON(w, http.StatusOK, authResponse{User: user, Token: token})
}
