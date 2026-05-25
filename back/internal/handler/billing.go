package handler

import (
	"io"
	"log"
	"net/http"

	authmiddleware "github.com/N95Ryan/flip-back/internal/middleware"
	"github.com/N95Ryan/flip-back/internal/repository"
	"github.com/N95Ryan/flip-back/internal/service"
)

const (
	checkoutSuccessURL = "https://flip-back-m624.onrender.com/success"
	checkoutCancelURL  = "https://flip-back-m624.onrender.com/cancel"
)

// BillingHandler exposes HTTP endpoints for Stripe billing.
type BillingHandler struct {
	billingSvc *service.BillingService
	userRepo   *repository.UserRepository
}

// NewBillingHandler builds a handler backed by the billing service.
func NewBillingHandler(billingSvc *service.BillingService, userRepo *repository.UserRepository) *BillingHandler {
	return &BillingHandler{
		billingSvc: billingSvc,
		userRepo:   userRepo,
	}
}

type checkoutResponse struct {
	URL string `json:"url"`
}

// CreateCheckout handles POST /billing/checkout.
func (h *BillingHandler) CreateCheckout(w http.ResponseWriter, r *http.Request) {
	userID, ok := authmiddleware.UserIDFromContext(r.Context())
	if !ok || userID == "" {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}

	customerID, err := h.userRepo.GetStripeCustomerID(userID)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "could not retrieve billing customer"})
		return
	}
	if customerID == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "no stripe customer linked to account"})
		return
	}

	url, err := h.billingSvc.CreateCheckoutSession(userID, customerID, checkoutSuccessURL, checkoutCancelURL)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "could not create checkout session"})
		return
	}

	writeJSON(w, http.StatusOK, checkoutResponse{URL: url})
}

// HandleWebhook handles POST /billing/webhook.
func (h *BillingHandler) HandleWebhook(w http.ResponseWriter, r *http.Request) {
	payload, err := io.ReadAll(r.Body)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "could not read request body"})
		return
	}

	sigHeader := r.Header.Get("Stripe-Signature")

	if err := h.billingSvc.HandleWebhook(payload, sigHeader); err != nil {
		log.Printf("webhook error: %v", err) // ajoute cette ligne
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}

	w.WriteHeader(http.StatusOK)
}
