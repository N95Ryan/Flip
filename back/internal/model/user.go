package model

import "time"

// User represents an application user.
type User struct {
	ID                 string    `json:"id"`
	Email              string    `json:"email"`
	PasswordHash       string    `json:"-"`
	StripeCustomerID   string    `json:"stripe_customer_id,omitempty"`
	SubscriptionStatus string    `json:"subscription_status"`
	CreatedAt          time.Time `json:"created_at"`
}
