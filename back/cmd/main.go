package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"

	chimiddleware "github.com/go-chi/chi/v5/middleware"

	"github.com/go-chi/cors"

	"github.com/joho/godotenv"

	_ "github.com/lib/pq"

	"github.com/N95Ryan/flip-back/data"

	"github.com/N95Ryan/flip-back/internal/handler"

	authmiddleware "github.com/N95Ryan/flip-back/internal/middleware"

	"github.com/N95Ryan/flip-back/internal/repository"

	"github.com/N95Ryan/flip-back/internal/service"
	"github.com/N95Ryan/flip-back/internal/storage"

	"github.com/stripe/stripe-go/v82"
)

func initAvatarStore(port string) (service.AvatarStorage, string, error) {
	if bucket := os.Getenv("S3_BUCKET"); bucket != "" {
		store, err := storage.NewS3AvatarStore(storage.S3Config{
			Endpoint:        os.Getenv("S3_ENDPOINT"),
			Region:          envOrDefault("S3_REGION", "auto"),
			Bucket:          bucket,
			AccessKeyID:     os.Getenv("S3_ACCESS_KEY_ID"),
			SecretAccessKey: os.Getenv("S3_SECRET_ACCESS_KEY"),
			PublicBaseURL:   os.Getenv("S3_PUBLIC_BASE_URL"),
		})
		if err != nil {
			return nil, "", err
		}
		return store, "", nil
	}

	dir := envOrDefault("AVATAR_UPLOAD_DIR", "./uploads/avatars")
	publicBase := os.Getenv("AVATAR_PUBLIC_BASE_URL")
	if publicBase == "" {
		publicBase = fmt.Sprintf("http://localhost:%s", port)
	}
	store, err := storage.NewLocalAvatarStore(dir, publicBase)
	if err != nil {
		return nil, "", err
	}
	return store, dir, nil
}

func envOrDefault(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func main() {

	_ = godotenv.Load()

	port := os.Getenv("PORT")

	if port == "" {

		port = "8080"

	}

	jwtSecret := os.Getenv("JWT_SECRET")

	if jwtSecret == "" {

		log.Fatal("JWT_SECRET is required")

	}

	stripeKey := os.Getenv("STRIPE_SECRET_KEY")
	if stripeKey == "" {
		log.Fatal("STRIPE_SECRET_KEY is required")
	}
	stripe.Key = stripeKey

	stripePriceID := os.Getenv("STRIPE_PRICE_ID")
	if stripePriceID == "" {
		log.Fatal("STRIPE_PRICE_ID is required")
	}

	stripeWebhookSecret := os.Getenv("STRIPE_WEBHOOK_SECRET")

	dbURL := os.Getenv("DATABASE_URL")

	if dbURL == "" {

		log.Fatal("DATABASE_URL is required")

	}

	db, err := sql.Open("postgres", dbURL)

	if err != nil {

		log.Fatal(err)

	}

	if err := db.Ping(); err != nil {
		log.Printf("WARNING: database ping failed: %v", err)
	}

	techniqueRepo := repository.NewTechniqueRepository(data.Techniques)

	techniqueSvc := service.NewTechniqueService(techniqueRepo)

	techniqueHandler := handler.NewTechniqueHandler(techniqueSvc)

	userRepo := repository.NewUserRepository(db)

	billingSvc := service.NewBillingService(userRepo, stripePriceID, stripeWebhookSecret)
	billingHandler := handler.NewBillingHandler(billingSvc, userRepo)

	authSvc := service.NewAuthService(userRepo, jwtSecret, billingSvc)
	authHandler := handler.NewAuthHandler(authSvc)

	journalRepo := repository.NewJournalRepository(db)
	journalSvc := service.NewJournalService(journalRepo)
	journalHandler := handler.NewJournalHandler(journalSvc)

	avatarStore, avatarDir, err := initAvatarStore(port)
	if err != nil {
		log.Fatal(err)
	}
	if os.Getenv("RENDER") != "" && os.Getenv("S3_BUCKET") == "" {
		log.Printf("WARNING: RENDER deploy without S3_BUCKET — avatar uploads use ephemeral disk; set S3_* env for production photos")
	}
	profileSvc := service.NewProfileService(userRepo, avatarStore)
	profileHandler := handler.NewProfileHandler(profileSvc)

	r := chi.NewRouter()

	r.Use(chimiddleware.Logger)

	r.Use(cors.Handler(cors.Options{

		AllowedOrigins: []string{"*"},

		AllowedMethods: []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},

		AllowedHeaders: []string{"Accept", "Content-Type", "Authorization"},
	}))

	r.Post("/auth/register", authHandler.Register)

	r.Post("/auth/login", authHandler.Login)

	r.Get("/techniques", techniqueHandler.ListTechniques)

	r.Get("/techniques/{id}", techniqueHandler.GetTechnique)

	if avatarDir != "" {
		r.Handle("/avatars/*", http.StripPrefix("/avatars/", http.FileServer(http.Dir(avatarDir))))
	}

	r.Group(func(r chi.Router) {
		r.Use(authmiddleware.AuthMiddleware(jwtSecret))
		r.Post("/billing/checkout", billingHandler.CreateCheckout)
		r.Get("/users/me", profileHandler.GetMe)
		r.Patch("/users/me", profileHandler.PatchMe)
		r.Post("/users/me/avatar", profileHandler.UploadAvatar)
		r.Delete("/users/me/avatar", profileHandler.DeleteAvatar)
	})

	r.Post("/billing/webhook", billingHandler.HandleWebhook)

	r.Group(func(r chi.Router) {
		r.Use(authmiddleware.AuthMiddleware(jwtSecret))
		r.Use(authmiddleware.PremiumMiddleware(userRepo))
		r.Get("/journal", journalHandler.ListEntries)
		r.Post("/journal", journalHandler.CreateEntry)
		r.Put("/journal/{id}", journalHandler.UpdateEntry)
		r.Delete("/journal/{id}", journalHandler.DeleteEntry)
	})

	log.Printf("Server running on port %s", port)

	if err := http.ListenAndServe("0.0.0.0:"+port, r); err != nil {

		log.Fatal(err)

	}

}
