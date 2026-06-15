//go:build integration

package e2e

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestWebhookE2E_SubscriptionLifecycle(t *testing.T) {
	resetDB(t)
	router := newTestRouter()

	const stripeCustomerID = "cus_e2e_lifecycle"
	userID := insertTestUser(t, "e2e-lifecycle@flip.test", stripeCustomerID)
	token := testJWT(t, userID)

	if status := subscriptionStatus(t, userID); status != "free" {
		t.Fatalf("expected initial status free, got %q", status)
	}
	if w := getJournal(t, router, token); w.Code != http.StatusForbidden {
		t.Fatalf("expected journal 403 before webhook, got %d", w.Code)
	}

	if w := postWebhook(t, router, subscriptionCreatedPayload(stripeCustomerID)); w.Code != http.StatusOK {
		t.Fatalf("subscription.created webhook: expected 200, got %d body=%s", w.Code, w.Body.String())
	}
	if status := subscriptionStatus(t, userID); status != "active" {
		t.Fatalf("expected status active after subscription.created, got %q", status)
	}
	if w := getJournal(t, router, token); w.Code != http.StatusOK {
		t.Fatalf("expected journal 200 after activation, got %d body=%s", w.Code, w.Body.String())
	}

	// Idempotent duplicate event — status stays active, journal still accessible.
	if w := postWebhook(t, router, subscriptionCreatedPayload(stripeCustomerID)); w.Code != http.StatusOK {
		t.Fatalf("duplicate subscription.created: expected 200, got %d", w.Code)
	}
	if status := subscriptionStatus(t, userID); status != "active" {
		t.Fatalf("expected status active after duplicate webhook, got %q", status)
	}
	if w := getJournal(t, router, token); w.Code != http.StatusOK {
		t.Fatalf("expected journal 200 after duplicate webhook, got %d", w.Code)
	}

	if w := postWebhook(t, router, subscriptionDeletedPayload(stripeCustomerID)); w.Code != http.StatusOK {
		t.Fatalf("subscription.deleted webhook: expected 200, got %d body=%s", w.Code, w.Body.String())
	}
	if status := subscriptionStatus(t, userID); status != "inactive" {
		t.Fatalf("expected status inactive after subscription.deleted, got %q", status)
	}
	if w := getJournal(t, router, token); w.Code != http.StatusForbidden {
		t.Fatalf("expected journal 403 after cancellation, got %d", w.Code)
	}
}

func TestWebhookE2E_CheckoutSessionCompletedLifetime(t *testing.T) {
	resetDB(t)
	router := newTestRouter()

	const stripeCustomerID = "cus_e2e_lifetime"
	userID := insertTestUser(t, "e2e-lifetime@flip.test", stripeCustomerID)
	token := testJWT(t, userID)

	if w := postWebhook(t, router, checkoutCompletedPayload(stripeCustomerID)); w.Code != http.StatusOK {
		t.Fatalf("checkout.session.completed webhook: expected 200, got %d body=%s", w.Code, w.Body.String())
	}
	if status := subscriptionStatus(t, userID); status != "active" {
		t.Fatalf("expected status active after lifetime checkout, got %q", status)
	}
	if w := getJournal(t, router, token); w.Code != http.StatusOK {
		t.Fatalf("expected journal 200 after lifetime checkout, got %d body=%s", w.Code, w.Body.String())
	}
}

func TestWebhookE2E_InvalidSignatureRejected(t *testing.T) {
	resetDB(t)
	router := newTestRouter()

	const stripeCustomerID = "cus_e2e_invalid_sig"
	userID := insertTestUser(t, "e2e-invalid@flip.test", stripeCustomerID)

	req := signedWebhookRequest(t, subscriptionCreatedPayload(stripeCustomerID))
	req.Header.Set("Stripe-Signature", "v1=invalidsignature")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected 400 for invalid signature, got %d", w.Code)
	}
	if status := subscriptionStatus(t, userID); status != "free" {
		t.Fatalf("expected DB unchanged (free), got %q", status)
	}
}
