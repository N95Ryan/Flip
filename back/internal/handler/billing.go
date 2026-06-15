package handler

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"

	authmiddleware "github.com/N95Ryan/flip-back/internal/middleware"
	"github.com/N95Ryan/flip-back/internal/repository"
	"github.com/N95Ryan/flip-back/internal/service"
)

const (
	checkoutSuccessURL = "flip://success"
	checkoutCancelURL  = "flip://cancel"
)

// BillingHandler exposes HTTP endpoints for Stripe billing.
type BillingHandler struct {
	billingSvc  *service.BillingService
	userRepo    *repository.UserRepository
	planPrices  map[string]string
}

// NewBillingHandler builds a handler backed by the billing service.
func NewBillingHandler(billingSvc *service.BillingService, userRepo *repository.UserRepository, planPrices map[string]string) *BillingHandler {
	return &BillingHandler{
		billingSvc: billingSvc,
		userRepo:   userRepo,
		planPrices: planPrices,
	}
}

type checkoutRequest struct {
	PriceID string `json:"price_id"`
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
		log.Printf("checkout: get stripe customer: %v", err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "could not retrieve billing customer"})
		return
	}
	if customerID == "" {
		user, err := h.userRepo.GetUserByID(userID)
		if err != nil || user == nil {
			log.Printf("checkout: get user %s: %v", userID, err)
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "could not retrieve user"})
			return
		}
		customerID, err = h.billingSvc.CreateStripeCustomer(userID, user.Email)
		if err != nil {
			log.Printf("checkout: create stripe customer: %v", err)
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": fmt.Sprintf("could not create billing customer: %v", err)})
			return
		}
		if err := h.userRepo.UpdateStripeCustomerID(userID, customerID); err != nil {
			log.Printf("checkout: link stripe customer: %v", err)
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "could not link billing customer"})
			return
		}
	}

	var req checkoutRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.PriceID == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request body"})
		return
	}

	stripePriceID, ok := h.planPrices[req.PriceID]
	if !ok {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid price_id"})
		return
	}

	mode := service.CheckoutModeSubscription
	if req.PriceID == "lifetime" {
		mode = service.CheckoutModePayment
	}

	url, err := h.billingSvc.CreateCheckoutSession(userID, customerID, stripePriceID, checkoutSuccessURL, checkoutCancelURL, mode)
	if err != nil {
		log.Printf("checkout: create session (plan=%s price=%s mode=%s): %v", req.PriceID, stripePriceID, mode, err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": fmt.Sprintf("could not create checkout session: %v", err)})
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
		log.Printf("webhook error: %v", err)
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}

	w.WriteHeader(http.StatusOK)
}
