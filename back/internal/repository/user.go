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

// ErrUsernameExists is returned when updating to a duplicate username.
var ErrUsernameExists = errors.New("username already exists")

const userSelectCols = `
	id, email, username, avatar_url, password_hash,
	stripe_customer_id, subscription_status, created_at`

func scanUser(row interface {
	Scan(dest ...any) error
}, includePassword bool) (*model.User, error) {
	var u model.User
	var username, avatarURL, stripeID sql.NullString
	var passwordHash string

	dest := []any{
		&u.ID,
		&u.Email,
		&username,
		&avatarURL,
		&passwordHash,
		&stripeID,
		&u.SubscriptionStatus,
		&u.CreatedAt,
	}
	if err := row.Scan(dest...); err != nil {
		return nil, err
	}
	if includePassword {
		u.PasswordHash = passwordHash
	}
	if username.Valid {
		u.Username = username.String
	}
	if avatarURL.Valid {
		u.AvatarURL = avatarURL.String
	}
	if stripeID.Valid {
		u.StripeCustomerID = stripeID.String
	}
	return &u, nil
}

// CreateUser inserts a new user and returns the created record.
func (r *UserRepository) CreateUser(email, hashedPassword string) (*model.User, error) {
	id := uuid.New().String()

	const q = `
		INSERT INTO users (id, email, password_hash, subscription_status)
		VALUES ($1, $2, $3, 'free')
		RETURNING ` + userSelectCols

	row := r.db.QueryRow(q, id, email, hashedPassword)
	u, err := scanUser(row, false)
	if err != nil {
		var pqErr *pq.Error
		if errors.As(err, &pqErr) && pqErr.Code == "23505" {
			return nil, ErrEmailExists
		}
		return nil, err
	}
	return u, nil
}

// GetUserByEmail returns the user with the given email, or nil if not found.
func (r *UserRepository) GetUserByEmail(email string) (*model.User, error) {
	const q = `SELECT ` + userSelectCols + ` FROM users WHERE email = $1`

	row := r.db.QueryRow(q, email)
	u, err := scanUser(row, true)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return u, nil
}

// GetUserByID returns the user with the given ID, or nil if not found.
func (r *UserRepository) GetUserByID(id string) (*model.User, error) {
	const q = `SELECT ` + userSelectCols + ` FROM users WHERE id = $1`

	row := r.db.QueryRow(q, id)
	u, err := scanUser(row, false)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return u, nil
}

// UpdateUsername sets username for the given user.
func (r *UserRepository) UpdateUsername(userID, username string) (*model.User, error) {
	const q = `UPDATE users SET username = $2 WHERE id = $1 RETURNING ` + userSelectCols

	row := r.db.QueryRow(q, userID, username)
	u, err := scanUser(row, false)
	if err != nil {
		var pqErr *pq.Error
		if errors.As(err, &pqErr) && pqErr.Code == "23505" {
			return nil, ErrUsernameExists
		}
		return nil, err
	}
	return u, nil
}

// UpdateProfile updates avatar_url for the given user.
// Pass a non-nil empty string for avatarURL to clear it.
func (r *UserRepository) UpdateProfile(userID string, username, avatarURL *string) (*model.User, error) {
	if username != nil {
		return r.UpdateUsername(userID, *username)
	}
	if avatarURL == nil {
		return r.GetUserByID(userID)
	}

	var avatarVal sql.NullString
	if *avatarURL == "" {
		avatarVal = sql.NullString{}
	} else {
		avatarVal = sql.NullString{String: *avatarURL, Valid: true}
	}

	const q = `UPDATE users SET avatar_url = $2 WHERE id = $1 RETURNING ` + userSelectCols

	row := r.db.QueryRow(q, userID, avatarVal)
	return scanUser(row, false)
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

// UpdateStripeCustomerID sets stripe_customer_id for the given user.
func (r *UserRepository) UpdateStripeCustomerID(userID, stripeCustomerID string) error {
	const q = `UPDATE users SET stripe_customer_id = $1 WHERE id = $2`
	_, err := r.db.Exec(q, stripeCustomerID, userID)
	return err
}

// UpdateSubscriptionByCustomerID sets subscription_status for the user with the given Stripe customer ID.
func (r *UserRepository) UpdateSubscriptionByCustomerID(stripeCustomerID, status string) error {
	const q = `UPDATE users SET subscription_status = $1 WHERE stripe_customer_id = $2`

	_, err := r.db.Exec(q, status, stripeCustomerID)
	return err
}
