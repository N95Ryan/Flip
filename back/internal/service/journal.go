package service

import (
	"errors"
	"time"

	"github.com/N95Ryan/flip-back/internal/model"
	"github.com/N95Ryan/flip-back/internal/repository"
)

// Journal validation errors.
var (
	ErrInvalidIntensity     = errors.New("intensity must be between 1 and 5")
	ErrInvalidSessionDate   = errors.New("invalid session_date, expected YYYY-MM-DD")
	ErrFutureSessionDate    = errors.New("session_date cannot be in the future")
	ErrJournalEntryNotFound = errors.New("journal entry not found")
)

const sessionDateLayout = "2006-01-02"

// JournalService coordinates journal entry use cases.
type JournalService struct {
	repo *repository.JournalRepository
}

// NewJournalService constructs the service with the given repository.
func NewJournalService(repo *repository.JournalRepository) *JournalService {
	return &JournalService{repo: repo}
}

// ListEntries returns all entries for the user.
func (s *JournalService) ListEntries(userID string) ([]model.JournalEntry, error) {
	return s.repo.GetEntriesByUserID(userID)
}

// CreateEntry validates and persists a new entry.
func (s *JournalService) CreateEntry(userID string, entry model.JournalEntry) (*model.JournalEntry, error) {
	if err := validateEntry(entry); err != nil {
		return nil, err
	}
	return s.repo.CreateEntry(userID, entry)
}

// UpdateEntry validates and updates an existing entry.
func (s *JournalService) UpdateEntry(id, userID string, entry model.JournalEntry) (*model.JournalEntry, error) {
	if err := validateEntry(entry); err != nil {
		return nil, err
	}
	updated, err := s.repo.UpdateEntry(id, userID, entry)
	if err != nil {
		if errors.Is(err, repository.ErrJournalEntryNotFound) {
			return nil, ErrJournalEntryNotFound
		}
		return nil, err
	}
	return updated, nil
}

// DeleteEntry removes an entry owned by the user.
func (s *JournalService) DeleteEntry(id, userID string) error {
	err := s.repo.DeleteEntry(id, userID)
	if errors.Is(err, repository.ErrJournalEntryNotFound) {
		return ErrJournalEntryNotFound
	}
	return err
}

func validateEntry(entry model.JournalEntry) error {
	if entry.Intensity < 1 || entry.Intensity > 5 {
		return ErrInvalidIntensity
	}

	sessionDate, err := time.Parse(sessionDateLayout, entry.SessionDate)
	if err != nil {
		return ErrInvalidSessionDate
	}

	today := time.Now().Truncate(24 * time.Hour)
	if sessionDate.After(today) {
		return ErrFutureSessionDate
	}
	return nil
}
