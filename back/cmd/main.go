package main

import (
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/joho/godotenv"

	"github.com/N95Ryan/flip-back/data"
	"github.com/N95Ryan/flip-back/internal/handler"
	"github.com/N95Ryan/flip-back/internal/repository"
	"github.com/N95Ryan/flip-back/internal/service"
)

func main() {
	_ = godotenv.Load()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	repo := repository.NewTechniqueRepository(data.Techniques)
	svc := service.NewTechniqueService(repo)
	h := handler.NewTechniqueHandler(svc)

	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"Accept", "Content-Type", "Authorization"},
	}))

	r.Get("/techniques", h.ListTechniques)
	r.Get("/techniques/{id}", h.GetTechnique)

	log.Printf("Server running on port %s", port)
	if err := http.ListenAndServe("0.0.0.0:"+port, r); err != nil {
		log.Fatal(err)
	}
}
