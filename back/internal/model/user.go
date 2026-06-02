package model

import "time"

// User represents an application user.
type User struct {
	ID                 string    `json:"id"`
	Email              string    `json:"email"`
	Username           string    `json:"username,omitempty"`
	AvatarURL          string    `json:"avatar_url,omitempty"`
	PasswordHash       string    `json:"-"`
	StripeCustomerID   string    `json:"stripe_customer_id,omitempty"`
	SubscriptionStatus string    `json:"subscription_status"`
	BeltLevel          string    `json:"belt_level"`
	TechniquesStudied  int       `json:"techniques_studied"`
	CreatedAt          time.Time `json:"created_at"`
}
