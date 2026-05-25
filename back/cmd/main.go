package main



import (

	"database/sql"

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

	"github.com/stripe/stripe-go/v82"

)



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

		log.Fatal(err)

	}

	defer db.Close()



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

	r := chi.NewRouter()

	r.Use(chimiddleware.Logger)

	r.Use(cors.Handler(cors.Options{

		AllowedOrigins: []string{"*"},

		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},

		AllowedHeaders: []string{"Accept", "Content-Type", "Authorization"},

	}))



	r.Post("/auth/register", authHandler.Register)

	r.Post("/auth/login", authHandler.Login)



	r.Get("/techniques", techniqueHandler.ListTechniques)

	r.Get("/techniques/{id}", techniqueHandler.GetTechnique)



	r.Group(func(r chi.Router) {
		r.Use(authmiddleware.AuthMiddleware(jwtSecret))
		r.Post("/billing/checkout", billingHandler.CreateCheckout)
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

