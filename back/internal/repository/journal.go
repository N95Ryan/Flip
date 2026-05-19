package repository

import (
	"database/sql"
	"errors"

	"github.com/N95Ryan/flip-back/internal/model"
	"github.com/google/uuid"
)

// ErrJournalEntryNotFound is returned when no entry matches id and user_id.
var ErrJournalEntryNotFound = errors.New("journal entry not found")

// JournalRepository persists journal entries in PostgreSQL.
type JournalRepository struct {
	db *sql.DB
}

// NewJournalRepository returns a repository backed by the given database.
func NewJournalRepository(db *sql.DB) *JournalRepository {
	return &JournalRepository{db: db}
}

// GetEntriesByUserID returns all journal entries for the given user.
func (r *JournalRepository) GetEntriesByUserID(userID string) ([]model.JournalEntry, error) {
	const q = `
		SELECT id, user_id, session_date::text, duration_minutes, intensity, COALESCE(notes, ''), created_at
		FROM journal_entries
		WHERE user_id = $1
		ORDER BY session_date DESC, created_at DESC`

	rows, err := r.db.Query(q, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var entries []model.JournalEntry
	for rows.Next() {
		var e model.JournalEntry
		if err := rows.Scan(
			&e.ID,
			&e.UserID,
			&e.SessionDate,
			&e.DurationMinutes,
			&e.Intensity,
			&e.Notes,
			&e.CreatedAt,
		); err != nil {
			return nil, err
		}
		entries = append(entries, e)
	}
	return entries, rows.Err()
}

// CreateEntry inserts a new journal entry for the user.
func (r *JournalRepository) CreateEntry(userID string, entry model.JournalEntry) (*model.JournalEntry, error) {
	id := uuid.New().String()

	const q = `
		INSERT INTO journal_entries (id, user_id, session_date, duration_minutes, intensity, notes)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, user_id, session_date::text, duration_minutes, intensity, COALESCE(notes, ''), created_at`

	var created model.JournalEntry
	err := r.db.QueryRow(q, id, userID, entry.SessionDate, entry.DurationMinutes, entry.Intensity, entry.Notes).Scan(
		&created.ID,
		&created.UserID,
		&created.SessionDate,
		&created.DurationMinutes,
		&created.Intensity,
		&created.Notes,
		&created.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &created, nil
}

// UpdateEntry updates an entry owned by the user.
func (r *JournalRepository) UpdateEntry(id, userID string, entry model.JournalEntry) (*model.JournalEntry, error) {
	const q = `
		UPDATE journal_entries
		SET session_date = $1, duration_minutes = $2, intensity = $3, notes = $4
		WHERE id = $5 AND user_id = $6
		RETURNING id, user_id, session_date::text, duration_minutes, intensity, COALESCE(notes, ''), created_at`

	var updated model.JournalEntry
	err := r.db.QueryRow(q,
		entry.SessionDate,
		entry.DurationMinutes,
		entry.Intensity,
		entry.Notes,
		id,
		userID,
	).Scan(
		&updated.ID,
		&updated.UserID,
		&updated.SessionDate,
		&updated.DurationMinutes,
		&updated.Intensity,
		&updated.Notes,
		&updated.CreatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrJournalEntryNotFound
	}
	if err != nil {
		return nil, err
	}
	return &updated, nil
}

// DeleteEntry removes an entry owned by the user.
func (r *JournalRepository) DeleteEntry(id, userID string) error {
	const q = `DELETE FROM journal_entries WHERE id = $1 AND user_id = $2`

	res, err := r.db.Exec(q, id, userID)
	if err != nil {
		return err
	}
	n, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if n == 0 {
		return ErrJournalEntryNotFound
	}
	return nil
}
