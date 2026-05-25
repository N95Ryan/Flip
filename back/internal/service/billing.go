package service

import (
	"encoding/json"
	"fmt"

	"github.com/N95Ryan/flip-back/internal/repository"
	"github.com/stripe/stripe-go/v82"
	"github.com/stripe/stripe-go/v82/checkout/session"
	"github.com/stripe/stripe-go/v82/customer"
	"github.com/stripe/stripe-go/v82/webhook"
)

// BillingService handles Stripe checkout and webhook processing.
type BillingService struct {
	userRepo      *repository.UserRepository
	priceID       string
	webhookSecret string
}

// NewBillingService constructs a billing service.
func NewBillingService(userRepo *repository.UserRepository, priceID, webhookSecret string) *BillingService {
	return &BillingService{
		userRepo:      userRepo,
		priceID:       priceID,
		webhookSecret: webhookSecret,
	}
}

// CreateStripeCustomer creates a Stripe Customer for the given user.
func (s *BillingService) CreateStripeCustomer(userID, email string) (string, error) {
	params := &stripe.CustomerParams{
		Email:    stripe.String(email),
		Metadata: map[string]string{"user_id": userID},
	}
	c, err := customer.New(params)
	if err != nil {
		return "", fmt.Errorf("stripe create customer: %w", err)
	}
	return c.ID, nil
}

// CreateCheckoutSession creates a Stripe Checkout Session in subscription mode.
func (s *BillingService) CreateCheckoutSession(userID, customerID, successURL, cancelURL string) (string, error) {
	params := &stripe.CheckoutSessionParams{
		Customer:          stripe.String(customerID),
		ClientReferenceID: stripe.String(userID),
		Mode:              stripe.String(string(stripe.CheckoutSessionModeSubscription)),
		SuccessURL:        stripe.String(successURL),
		CancelURL:         stripe.String(cancelURL),
		LineItems: []*stripe.CheckoutSessionLineItemParams{
			{
				Price:    stripe.String(s.priceID),
				Quantity: stripe.Int64(1),
			},
		},
	}

	sess, err := session.New(params)
	if err != nil {
		return "", fmt.Errorf("create checkout session: %w", err)
	}
	return sess.URL, nil
}

// HandleWebhook verifies the Stripe signature and updates subscription status.
func (s *BillingService) HandleWebhook(payload []byte, sigHeader string) error {
	event, err := webhook.ConstructEventWithOptions(payload, sigHeader, s.webhookSecret,
		webhook.ConstructEventOptions{IgnoreAPIVersionMismatch: true},
	)
	if err != nil {
		return fmt.Errorf("construct webhook event: %w", err)
	}

	switch event.Type {
	case "customer.subscription.created":
		return s.handleSubscriptionEvent(event, "active")
	case "customer.subscription.updated":
		var sub stripe.Subscription
		if err := json.Unmarshal(event.Data.Raw, &sub); err != nil {
			return fmt.Errorf("unmarshal subscription: %w", err)
		}
		status := "inactive"
		if sub.Status == stripe.SubscriptionStatusActive {
			status = "active"
		}
		return s.updateSubscriptionFromEvent(event, status)
	case "customer.subscription.deleted":
		return s.handleSubscriptionEvent(event, "inactive")
	}

	return nil
}

func (s *BillingService) handleSubscriptionEvent(event stripe.Event, status string) error {
	return s.updateSubscriptionFromEvent(event, status)
}

func (s *BillingService) updateSubscriptionFromEvent(event stripe.Event, status string) error {
	var sub stripe.Subscription
	if err := json.Unmarshal(event.Data.Raw, &sub); err != nil {
		return fmt.Errorf("unmarshal subscription: %w", err)
	}

	customerID := ""
	if sub.Customer != nil {
		customerID = sub.Customer.ID
	}
	if customerID == "" {
		return fmt.Errorf("subscription event missing customer id")
	}

	if err := s.userRepo.UpdateSubscriptionByCustomerID(customerID, status); err != nil {
		return fmt.Errorf("update subscription status: %w", err)
	}
	return nil
}
