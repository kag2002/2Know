package main

import (
	"log"
	"os"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/cors"
	"github.com/gofiber/fiber/v3/middleware/logger"
	"github.com/joho/godotenv"

	"backend/internal/config"
	"backend/internal/handler"
	"backend/internal/middleware"
	"backend/internal/model"
)

func main() {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// Connect to database
	config.ConnectDB()

	// Auto-migrate all models
	err := config.DB.AutoMigrate(
		&model.User{},
		&model.Quiz{},
		&model.Question{},
		&model.Option{},
		&model.Class{},
		&model.Student{},
		&model.TestResult{},
	)
	if err != nil {
		log.Fatalf("Failed to auto-migrate: %v", err)
	}

	app := fiber.New()

	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: []string{"http://localhost:3000"},
		AllowHeaders: []string{"Origin, Content-Type, Accept, Authorization"},
	}))

	app.Get("/api/health", func(c fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "ok",
			"message": "QuizLM API is running",
		})
	})

	// Auth routes (public)
	app.Post("/api/auth/register", handler.Register)
	app.Post("/api/auth/login", handler.Login)

	// Public test submission endpoint
	app.Post("/api/test/submit", handler.SubmitTest)

	// Protected block
	api := app.Group("/api", middleware.Protected())

	// Quiz endpoints
	api.Get("/quizzes", handler.GetQuizzes)
	api.Post("/quizzes", handler.CreateQuiz)
	api.Get("/quizzes/:id", handler.GetQuizByID)

	// Results analytics endpoints (Teacher)
	api.Get("/quizzes/:quizId/results", handler.GetQuizResults)

	// Question endpoints
	api.Get("/quizzes/:quizId/questions", handler.GetQuizQuestions)
	api.Get("/questions", handler.GetQuestions)
	api.Post("/questions", handler.CreateQuestion)
	api.Delete("/questions/:id", handler.DeleteQuestion)

	// Class & Student endpoints
	api.Get("/classes", handler.GetClasses)
	api.Post("/classes", handler.CreateClass)
	api.Get("/classes/:id", handler.GetClassByID)
	api.Post("/classes/:id/students", handler.AddStudent)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	log.Fatal(app.Listen(":" + port))
}
