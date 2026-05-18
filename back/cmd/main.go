package main

import (
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
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
	r.Get("/techniques", h.ListTechniques)
	r.Get("/techniques/{id}", h.GetTechnique)

	log.Printf("Server running on port %s", port)
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatal(err)
	}
}
