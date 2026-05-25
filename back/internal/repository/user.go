package repository

import (
	"database/sql"
	"errors"

	"github.com/N95Ryan/flip-back/internal/model"
	"github.com/google/uuid"
	"github.com/lib/pq"
)

// UserRepository persists users in PostgreSQL.
type UserRepository struct {
	db *sql.DB
}

// NewUserRepository returns a repository backed by the given database.
func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

// ErrEmailExists is returned when registering with a duplicate email.
var ErrEmailExists = errors.New("email already exists")

// CreateUser inserts a new user and returns the created record.
func (r *UserRepository) CreateUser(email, hashedPassword string) (*model.User, error) {
	id := uuid.New().String()

	const q = `
		INSERT INTO users (id, email, password_hash, subscription_status)
		VALUES ($1, $2, $3, 'free')
		RETURNING id, email, stripe_customer_id, subscription_status, created_at`

	var u model.User
	var stripeID sql.NullString
	err := r.db.QueryRow(q, id, email, hashedPassword).Scan(
		&u.ID,
		&u.Email,
		&stripeID,
		&u.SubscriptionStatus,
		&u.CreatedAt,
	)
	if err != nil {
		var pqErr *pq.Error
		if errors.As(err, &pqErr) && pqErr.Code == "23505" {
			return nil, ErrEmailExists
		}
		return nil, err
	}
	if stripeID.Valid {
		u.StripeCustomerID = stripeID.String
	}
	return &u, nil
}

// GetUserByEmail returns the user with the given email, or nil if not found.
func (r *UserRepository) GetUserByEmail(email string) (*model.User, error) {
	const q = `
		SELECT id, email, password_hash, stripe_customer_id, subscription_status, created_at
		FROM users
		WHERE email = $1`

	var u model.User
	var stripeID sql.NullString
	err := r.db.QueryRow(q, email).Scan(
		&u.ID,
		&u.Email,
		&u.PasswordHash,
		&stripeID,
		&u.SubscriptionStatus,
		&u.CreatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	if stripeID.Valid {
		u.StripeCustomerID = stripeID.String
	}
	return &u, nil
}

// GetSubscriptionStatus returns the subscription_status for the given user ID.
func (r *UserRepository) GetSubscriptionStatus(userID string) (string, error) {
	const q = `SELECT subscription_status FROM users WHERE id = $1`

	var status string
	err := r.db.QueryRow(q, userID).Scan(&status)
	if errors.Is(err, sql.ErrNoRows) {
		return "", nil
	}
	if err != nil {
		return "", err
	}
	return status, nil
}

// GetStripeCustomerID returns the stripe_customer_id for the given user ID.
func (r *UserRepository) GetStripeCustomerID(userID string) (string, error) {
	const q = `SELECT stripe_customer_id FROM users WHERE id = $1`

	var stripeID sql.NullString
	err := r.db.QueryRow(q, userID).Scan(&stripeID)
	if errors.Is(err, sql.ErrNoRows) {
		return "", nil
	}
	if err != nil {
		return "", err
	}
	if stripeID.Valid {
		return stripeID.String, nil
	}
	return "", nil
}

// UpdateSubscriptionByCustomerID sets subscription_status for the user with the given Stripe customer ID.
func (r *UserRepository) UpdateSubscriptionByCustomerID(stripeCustomerID, status string) error {
	const q = `UPDATE users SET subscription_status = $1 WHERE stripe_customer_id = $2`

	_, err := r.db.Exec(q, status, stripeCustomerID)
	return err
}
