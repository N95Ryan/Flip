package middleware

import (
	"net/http"

	"github.com/N95Ryan/flip-back/internal/repository"
)

// PremiumMiddleware ensures the authenticated user has an active subscription.
func PremiumMiddleware(userRepo *repository.UserRepository) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			userID, ok := UserIDFromContext(r.Context())
			if !ok || userID == "" {
				writeError(w, http.StatusUnauthorized, "unauthorized")
				return
			}

			status, err := userRepo.GetSubscriptionStatus(userID)
			if err != nil {
				writeError(w, http.StatusInternalServerError, "could not verify subscription")
				return
			}
			if status != "active" {
				writeError(w, http.StatusForbidden, "premium subscription required")
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}
