//go:build integration

package e2e

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"github.com/joho/godotenv"

	"github.com/N95Ryan/flip-back/internal/handler"
	authmiddleware "github.com/N95Ryan/flip-back/internal/middleware"
	"github.com/N95Ryan/flip-back/internal/repository"
	"github.com/N95Ryan/flip-back/internal/service"
	"github.com/go-chi/chi/v5"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/stripe/stripe-go/v82/webhook"
	_ "github.com/lib/pq"
)

const (
	testJWTSecret     = "e2e-test-jwt-secret"
	testWebhookSecret = "whsec_e2e_test_secret"
)

var testDB *sql.DB

func loadEnv() {
	for _, path := range []string{
		filepath.Join("..", "..", ".env"),
		filepath.Join("..", ".env"),
		".env",
	} {
		if err := godotenv.Load(path); err == nil {
			return
		}
	}
}

func TestMain(m *testing.M) {
	loadEnv()

	dsn := os.Getenv("TEST_DATABASE_URL")
	if dsn == "" {
		log.Println("TEST_DATABASE_URL not set — skipping webhook E2E tests")
		os.Exit(0)
	}

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		log.Fatalf("open test database: %v", err)
	}
	if err := db.Ping(); err != nil {
		log.Fatalf("ping test database: %v", err)
	}

	schemaPath := filepath.Join("..", "fixtures", "schema.sql")
	schema, err := os.ReadFile(schemaPath)
	if err != nil {
		log.Fatalf("read schema %s: %v", schemaPath, err)
	}
	if _, err := db.Exec(string(schema)); err != nil {
		log.Fatalf("apply schema: %v", err)
	}

	testDB = db
	code := m.Run()
	_ = testDB.Close()
	os.Exit(code)
}

func resetDB(t *testing.T) {
	t.Helper()
	if _, err := testDB.Exec(`TRUNCATE journal_entries, users CASCADE`); err != nil {
		t.Fatalf("reset database: %v", err)
	}
}

func insertTestUser(t *testing.T, email, stripeCustomerID string) string {
	t.Helper()
	id := uuid.New().String()
	_, err := testDB.Exec(`
		INSERT INTO users (id, email, password_hash, stripe_customer_id, subscription_status)
		VALUES ($1, $2, 'hash', $3, 'free')
	`, id, email, stripeCustomerID)
	if err != nil {
		t.Fatalf("insert test user: %v", err)
	}
	return id
}

func subscriptionStatus(t *testing.T, userID string) string {
	t.Helper()
	var status string
	err := testDB.QueryRow(`SELECT subscription_status FROM users WHERE id = $1`, userID).Scan(&status)
	if err != nil {
		t.Fatalf("read subscription status: %v", err)
	}
	return status
}

func testJWT(t *testing.T, userID string) string {
	t.Helper()
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": userID,
		"exp": time.Now().Add(time.Hour).Unix(),
		"iat": time.Now().Unix(),
	})
	signed, err := token.SignedString([]byte(testJWTSecret))
	if err != nil {
		t.Fatalf("sign jwt: %v", err)
	}
	return signed
}

func newTestRouter() http.Handler {
	userRepo := repository.NewUserRepository(testDB)
	journalRepo := repository.NewJournalRepository(testDB)
	billingSvc := service.NewBillingService(userRepo, testWebhookSecret)
	billingHandler := handler.NewBillingHandler(billingSvc, userRepo, nil)
	journalHandler := handler.NewJournalHandler(service.NewJournalService(journalRepo))

	r := chi.NewRouter()
	r.Post("/billing/webhook", billingHandler.HandleWebhook)
	r.Group(func(r chi.Router) {
		r.Use(authmiddleware.AuthMiddleware(testJWTSecret))
		r.Use(authmiddleware.PremiumMiddleware(userRepo))
		r.Get("/journal", journalHandler.ListEntries)
	})
	return r
}

func signedWebhookRequest(t *testing.T, payload []byte) *http.Request {
	t.Helper()
	signed := webhook.GenerateTestSignedPayload(&webhook.UnsignedPayload{
		Payload: payload,
		Secret:  testWebhookSecret,
	})
	req := httptest.NewRequest(http.MethodPost, "/billing/webhook", strings.NewReader(string(signed.Payload)))
	req.Header.Set("Stripe-Signature", signed.Header)
	return req
}

func postWebhook(t *testing.T, router http.Handler, payload []byte) *httptest.ResponseRecorder {
	t.Helper()
	w := httptest.NewRecorder()
	router.ServeHTTP(w, signedWebhookRequest(t, payload))
	return w
}

func getJournal(t *testing.T, router http.Handler, token string) *httptest.ResponseRecorder {
	t.Helper()
	req := httptest.NewRequest(http.MethodGet, "/journal", nil)
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	return w
}

func subscriptionCreatedPayload(customerID string) []byte {
	return []byte(fmt.Sprintf(`{
		"type": "customer.subscription.created",
		"data": {
			"object": {
				"id": "sub_e2e_test",
				"customer": %q,
				"status": "active"
			}
		}
	}`, customerID))
}

func subscriptionDeletedPayload(customerID string) []byte {
	return []byte(fmt.Sprintf(`{
		"type": "customer.subscription.deleted",
		"data": {
			"object": {
				"id": "sub_e2e_test",
				"customer": %q,
				"status": "canceled"
			}
		}
	}`, customerID))
}

func checkoutCompletedPayload(customerID string) []byte {
	return []byte(fmt.Sprintf(`{
		"type": "checkout.session.completed",
		"data": {
			"object": {
				"id": "cs_e2e_test",
				"mode": "payment",
				"payment_status": "paid",
				"customer": %q
			}
		}
	}`, customerID))
}
