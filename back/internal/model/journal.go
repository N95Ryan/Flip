package model

import "time"

// JournalEntry represents a training session log.
type JournalEntry struct {
	ID              string    `json:"id"`
	UserID          string    `json:"user_id"`
	SessionDate     string    `json:"session_date"`
	DurationMinutes int       `json:"duration_minutes"`
	Intensity       int       `json:"intensity"`
	Notes           string    `json:"notes"`
	CreatedAt       time.Time `json:"created_at"`
}
