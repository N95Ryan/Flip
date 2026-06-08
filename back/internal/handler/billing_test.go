package handler

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/N95Ryan/flip-back/internal/service"
	"github.com/stripe/stripe-go/v82/webhook"
)

func TestHandleWebhook_InvalidSignature(t *testing.T) {
	billingSvc := service.NewBillingService(nil, "whsec_test_secret")
	h := NewBillingHandler(billingSvc, nil, nil)

	body := strings.NewReader(`{"type":"customer.subscription.created"}`)
	req := httptest.NewRequest("POST", "/billing/webhook", body)
	req.Header.Set("Stripe-Signature", "v1=fakesignature")

	w := httptest.NewRecorder()
	h.HandleWebhook(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("expected %d, got %d", http.StatusBadRequest, w.Code)
	}
}

func TestHandleWebhook_UnknownEvent(t *testing.T) {
	secret := "whsec_test_secret"
	billingSvc := service.NewBillingService(nil, secret)
	h := NewBillingHandler(billingSvc, nil, nil)

	payload := []byte(`{"type":"charge.succeeded"}`)
	signedPayload := webhook.GenerateTestSignedPayload(&webhook.UnsignedPayload{
		Payload: payload,
		Secret:  secret,
	})

	req := httptest.NewRequest("POST", "/billing/webhook", strings.NewReader(string(signedPayload.Payload)))
	req.Header.Set("Stripe-Signature", signedPayload.Header)

	w := httptest.NewRecorder()
	h.HandleWebhook(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected %d, got %d", http.StatusOK, w.Code)
	}
}

type mockUserRepo struct {
	updatedCustomerID string
	updatedStatus     string
}

func (m *mockUserRepo) UpdateSubscriptionByCustomerID(customerID, status string) error {
	m.updatedCustomerID = customerID
	m.updatedStatus = status
	return nil
}

func (m *mockUserRepo) GetStripeCustomerID(userID string) (string, error) {
	return "cus_test123", nil
}

func (m *mockUserRepo) UpdateStripeCustomerID(userID, stripeCustomerID string) error {
	return nil
}

func TestHandleWebhook_SubscriptionCreated(t *testing.T) {
	secret := "whsec_test_secret"
	repo := &mockUserRepo{}
	billingSvc := service.NewBillingService(repo, secret)
	h := NewBillingHandler(billingSvc, nil, nil)

	payload := []byte(`{
		"type": "customer.subscription.created",
		"data": {
			"object": {
				"id": "sub_test123",
				"customer": "cus_test123",
				"status": "active"
			}
		}
	}`)
	signedPayload := webhook.GenerateTestSignedPayload(&webhook.UnsignedPayload{
		Payload: payload,
		Secret:  secret,
	})

	req := httptest.NewRequest("POST", "/billing/webhook", strings.NewReader(string(signedPayload.Payload)))
	req.Header.Set("Stripe-Signature", signedPayload.Header)

	w := httptest.NewRecorder()
	h.HandleWebhook(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected %d, got %d", http.StatusOK, w.Code)
	}
	if repo.updatedStatus != "active" {
		t.Errorf("expected status 'active', got '%s'", repo.updatedStatus)
	}
	if repo.updatedCustomerID != "cus_test123" {
		t.Errorf("expected customerID 'cus_test123', got '%s'", repo.updatedCustomerID)
	}
}

func TestHandleWebhook_SubscriptionDeleted(t *testing.T) {
	secret := "whsec_test_secret"
	repo := &mockUserRepo{}
	billingSvc := service.NewBillingService(repo, secret)
	h := NewBillingHandler(billingSvc, nil, nil)

	payload := []byte(`{
		"type": "customer.subscription.deleted",
		"data": {
			"object": {
				"id": "sub_test123",
				"customer": "cus_test123",
				"status": "canceled"
			}
		}
	}`)
	signedPayload := webhook.GenerateTestSignedPayload(&webhook.UnsignedPayload{
		Payload: payload,
		Secret:  secret,
	})

	req := httptest.NewRequest("POST", "/billing/webhook", strings.NewReader(string(signedPayload.Payload)))
	req.Header.Set("Stripe-Signature", signedPayload.Header)

	w := httptest.NewRecorder()
	h.HandleWebhook(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected %d, got %d", http.StatusOK, w.Code)
	}
	if repo.updatedStatus != "inactive" {
		t.Errorf("expected status 'inactive', got '%s'", repo.updatedStatus)
	}
	if repo.updatedCustomerID != "cus_test123" {
		t.Errorf("expected customerID 'cus_test123', got '%s'", repo.updatedCustomerID)
	}
}
