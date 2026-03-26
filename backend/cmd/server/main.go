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
	"backend/internal/repository"
	"backend/internal/service"
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
		&model.Note{},
		&model.Tag{},
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

	// Initialize Repositories
	userRepo := repository.NewUserRepository(config.DB)
	statsRepo := repository.NewStatsRepository(config.DB)
	classRepo := repository.NewClassRepository(config.DB)
	quizRepo := repository.NewQuizRepository(config.DB)
	questionRepo := repository.NewQuestionRepository(config.DB)
	resultRepo := repository.NewResultRepository(config.DB)
	studentRepo := repository.NewStudentRepository(config.DB)
	noteRepo := repository.NewNoteRepository(config.DB)
	tagRepo := repository.NewTagRepository(config.DB)

	// Initialize Services
	authSvc := service.NewAuthService(userRepo, os.Getenv("JWT_SECRET"))
	statsSvc := service.NewStatsService(statsRepo)
	classSvc := service.NewClassService(classRepo)
	quizSvc := service.NewQuizService(quizRepo)
	questionSvc := service.NewQuestionService(questionRepo)
	resultSvc := service.NewResultService(resultRepo, quizRepo)
	studentSvc := service.NewStudentService(studentRepo)
	aiSvc := service.NewAIService()
	noteSvc := service.NewNoteService(noteRepo)
	tagSvc := service.NewTagService(tagRepo)

	// Initialize Handlers
	authHandler := handler.NewAuthHandler(authSvc)
	statsHandler := handler.NewStatsHandler(statsSvc)
	classHandler := handler.NewClassHandler(classSvc)
	quizHandler := handler.NewQuizHandler(quizSvc)
	questionHandler := handler.NewQuestionHandler(questionSvc)
	resultHandler := handler.NewResultHandler(resultSvc)
	studentHandler := handler.NewStudentHandler(studentSvc)
	aiHandler := handler.NewAIHandler(aiSvc)
	noteHandler := handler.NewNoteHandler(noteSvc)
	tagHandler := handler.NewTagHandler(tagSvc)

	// Auth routes (public)
	app.Post("/api/auth/register", authHandler.Register)
	app.Post("/api/auth/login", authHandler.Login)

	// Public test routes (Guest)
	app.Get("/api/test/quiz/:id", quizHandler.GetPublicQuizByID)
	app.Post("/api/test/submit", resultHandler.SubmitTest)

	// Protected block
	api := app.Group("/api", middleware.Protected())

	// Quiz endpoints
	api.Get("/quizzes", quizHandler.GetQuizzes)
	api.Post("/quizzes", quizHandler.CreateQuiz)
	api.Get("/quizzes/:id", quizHandler.GetQuizByID)

	// Results analytics endpoints (Teacher)
	api.Get("/quizzes/:quizId/results", resultHandler.GetQuizResults)

	// AI endpoints
	api.Post("/ai/generate-quiz", aiHandler.GenerateQuiz)

	// Question endpoints
	api.Get("/quizzes/:quizId/questions", questionHandler.GetQuizQuestions)
	api.Get("/questions", questionHandler.GetQuestions)
	api.Post("/questions", questionHandler.CreateQuestion)
	api.Delete("/questions/:id", questionHandler.DeleteQuestion)

	// Class & Student endpoints
	api.Get("/classes", classHandler.GetClasses)
	api.Post("/classes", classHandler.CreateClass)
	api.Get("/classes/:id", classHandler.GetClassByID)
	api.Post("/classes/:id/students", classHandler.AddStudent)

	// Global Student Directory endpoints
	api.Get("/students", studentHandler.GetStudents)
	api.Post("/students", studentHandler.CreateStudent)
	api.Delete("/students/:id", studentHandler.DeleteStudent)

	// Notes & Tags endpoints
	api.Get("/notes", noteHandler.GetNotes)
	api.Post("/notes", noteHandler.CreateNote)
	api.Delete("/notes/:id", noteHandler.DeleteNote)
	api.Patch("/notes/:id/pin", noteHandler.TogglePin)

	api.Get("/tags", tagHandler.GetTags)
	api.Post("/tags", tagHandler.CreateTag)
	api.Delete("/tags/:id", tagHandler.DeleteTag)

	// Stats/Dashboard endpoint
	api.Get("/stats/dashboard", statsHandler.GetDashboardStats)
	api.Get("/stats/export", statsHandler.ExportCSV)

	// Grading endpoints
	api.Get("/grading/pending", resultHandler.GetPendingGradings)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	log.Fatal(app.Listen(":" + port))
}
