package main

import (
	"log"
	"os"
	"strings"
	"time"

	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/cors"
	"github.com/gofiber/fiber/v3/middleware/logger"
	"github.com/gofiber/fiber/v3/middleware/recover"
	"github.com/joho/godotenv"

	"backend/internal/config"
	"backend/internal/handler"
	"backend/internal/middleware"
	"backend/internal/repository"
	"backend/internal/service"
)

func main() {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// Connect to database (AutoMigrate runs inside config.ConnectDB)
	config.ConnectDB()

	app := fiber.New(fiber.Config{
		BodyLimit:    5 * 1024 * 1024, // Limit request body to 5MB to prevent spam/OOM
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  120 * time.Second,
		ErrorHandler: func(c fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			if e, ok := err.(*fiber.Error); ok {
				code = e.Code
			}
			if code == fiber.StatusRequestEntityTooLarge {
				return c.Status(code).JSON(fiber.Map{
					"error": "Dữ liệu tải lên quá lớn (Vượt mức 5MB). Vui lòng kiểm tra lại.",
				})
			}
			// SECURITY: Never leak Go internal error details to clients
			log.Printf("[ErrorHandler] code=%d err=%v", code, err)
			return c.Status(code).JSON(fiber.Map{
				"error": "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.",
			})
		},
	})

	// SECURITY: Recover from panics to prevent total server crash
	app.Use(recover.New())
	app.Use(logger.New())
	app.Use(middleware.SecurityHeaders())
	app.Use(middleware.GlobalLimiter())
	app.Use(cors.New(cors.Config{
		AllowOrigins: getCorsOrigins(),
		AllowHeaders: []string{"Origin, Content-Type, Accept, Authorization"},
	}))

	app.Get("/api/health", func(c fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "ok",
			"message": "2Know API is running",
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
	materialRepo := repository.NewMaterialRepository(config.DB)
	noteRepo := repository.NewNoteRepository(config.DB)
	tagRepo := repository.NewTagRepository(config.DB)
	omrRepo := repository.NewOmrBatchRepository(config.DB)
	rubricRepo := repository.NewRubricRepository(config.DB)
	shareLinkRepo := repository.NewShareLinkRepository(config.DB)

	// Initialize Services
	authSvc := service.NewAuthService(userRepo, os.Getenv("JWT_SECRET"))
	statsSvc := service.NewStatsService(statsRepo)
	classSvc := service.NewClassService(classRepo)
	quizSvc := service.NewQuizService(quizRepo)
	questionSvc := service.NewQuestionService(questionRepo)
	resultSvc := service.NewResultService(resultRepo, quizRepo, classRepo)
	studentSvc := service.NewStudentService(studentRepo, classRepo)
	materialSvc := service.NewMaterialService(materialRepo, classRepo)
	aiSvc := service.NewAIService()
	noteSvc := service.NewNoteService(noteRepo)
	tagSvc := service.NewTagService(tagRepo)
	omrSvc := service.NewOmrBatchService(omrRepo, quizRepo)
	rubricSvc := service.NewRubricService(rubricRepo)
	shareLinkSvc := service.NewShareLinkService(shareLinkRepo)

	// Seed Demo Account natively (suppress duplicate log by checking first)
	if _, _, err := authSvc.Login("demo@2know.edu.vn", "demo123"); err != nil {
		authSvc.Register("demo@2know.edu.vn", "demo123", "Giáo viên Demo")
	}

	// Initialize Gamification Websocket Hub
	leaderboardHub := handler.NewLeaderboardHub(resultSvc)
	go leaderboardHub.PollLeaderboard()

	// Initialize Handlers
	authHandler := handler.NewAuthHandler(authSvc)
	statsHandler := handler.NewStatsHandler(statsSvc)
	classHandler := handler.NewClassHandler(classSvc)
	quizHandler := handler.NewQuizHandler(quizSvc)
	questionHandler := handler.NewQuestionHandler(questionSvc)
	resultHandler := handler.NewResultHandler(resultSvc, leaderboardHub)
	studentHandler := handler.NewStudentHandler(studentSvc)
	materialHandler := handler.NewMaterialHandler(materialSvc)
	aiHandler := handler.NewAIHandler(aiSvc)
	noteHandler := handler.NewNoteHandler(noteSvc)
	tagHandler := handler.NewTagHandler(tagSvc)
	omrHandler := handler.NewOmrBatchHandler(omrSvc)
	rubricHandler := handler.NewRubricHandler(rubricSvc)
	shareLinkHandler := handler.NewShareLinkHandler(shareLinkSvc)

	// Auth routes (public)
	app.Post("/api/auth/register", middleware.AuthLimiter(), authHandler.Register)
	app.Post("/api/auth/login", middleware.AuthLimiter(), authHandler.Login)

	// Public test routes (Guest)
	app.Get("/api/test/quiz/:id", quizHandler.GetPublicQuizByID)
	app.Get("/api/test/quiz/:id/metadata", quizHandler.GetPublicQuizMetadata)
	app.Post("/api/test/submit", middleware.SubmitLimiter(), resultHandler.SubmitTest)

	// Protected block
	api := app.Group("/api", middleware.Protected(config.DB))

	// Quiz endpoints
	api.Get("/quizzes", quizHandler.GetQuizzes)
	api.Post("/quizzes", quizHandler.CreateQuiz)
	api.Get("/quizzes/stats", quizHandler.GetQuizStats) // MUST be before /quizzes/:id
	api.Get("/quizzes/:id", quizHandler.GetQuizByID)
	api.Patch("/quizzes/:id", quizHandler.UpdateQuiz)
	api.Delete("/quizzes/:id", quizHandler.DeleteQuiz)

	// Results analytics endpoints (Teacher)
	api.Get("/quizzes/:quizId/results", resultHandler.GetQuizResults)

	// AI endpoints
	api.Post("/ai/generate-quiz", middleware.AILimiter(), aiHandler.GenerateQuiz)

	// Question endpoints
	api.Get("/quizzes/:quizId/questions", questionHandler.GetQuizQuestions)
	api.Get("/questions", questionHandler.GetQuestions)
	api.Post("/questions", questionHandler.CreateQuestion)
	api.Post("/questions/batch", questionHandler.BatchCreateQuestions)
	api.Patch("/questions/:id", questionHandler.UpdateQuestion)
	api.Delete("/questions/:id", questionHandler.DeleteQuestion)

	// Class & Student endpoints
	api.Get("/classes", classHandler.GetClasses)
	api.Post("/classes", classHandler.CreateClass)
	api.Get("/classes/:id", classHandler.GetClassByID)
	api.Get("/classes/:id/gradebook", resultHandler.GetClassGradebook)
	api.Get("/classes/:id/analytics", classHandler.GetClassAnalytics)
	api.Patch("/classes/:id", classHandler.UpdateClass)
	api.Delete("/classes/:id", classHandler.DeleteClass)
	api.Post("/classes/:id/students", classHandler.AddStudent)
	api.Post("/classes/:id/materials", materialHandler.CreateMaterial)
	api.Get("/classes/:id/materials", materialHandler.GetMaterials)
	api.Delete("/classes/:id/materials/:materialId", materialHandler.DeleteMaterial)

	// Global Student Directory endpoints
	api.Get("/students", studentHandler.GetStudents)
	api.Get("/students/:id", studentHandler.GetStudentByID)
	api.Get("/students/:id/history", resultHandler.GetStudentHistory)
	api.Get("/students/:id/mastery", resultHandler.GetStudentMastery)
	api.Post("/students", studentHandler.CreateStudent)
	api.Patch("/students/:id", studentHandler.UpdateStudent)
	api.Delete("/students/:id", studentHandler.DeleteStudent)

	// Notes & Tags endpoints
	api.Get("/notes", noteHandler.GetNotes)
	api.Post("/notes", noteHandler.CreateNote)
	api.Delete("/notes/:id", noteHandler.DeleteNote)
	api.Patch("/notes/:id/pin", noteHandler.TogglePin)
	api.Patch("/notes/:id", noteHandler.UpdateNote)

	api.Get("/tags", tagHandler.GetTags)
	api.Post("/tags", tagHandler.CreateTag)
	api.Patch("/tags/:id", tagHandler.UpdateTag)
	api.Delete("/tags/:id", tagHandler.DeleteTag)

	// Stats/Dashboard endpoint
	api.Get("/stats/dashboard", statsHandler.GetDashboardStats)
	api.Get("/stats/export", statsHandler.ExportCSV)

	// Grading & Results endpoints
	api.Get("/grading/pending", resultHandler.GetPendingGradings)
	api.Post("/grading/:id", resultHandler.GradeSubmission)
	api.Get("/quizzes/:quizId/analytics/questions", resultHandler.GetQuestionAnalytics)

	// User Profile endpoints
	userHandler := handler.NewUserHandler(userRepo)
	api.Get("/users/me", userHandler.GetProfile)
	api.Patch("/users/me", userHandler.UpdateProfile)
	api.Patch("/users/me/password", userHandler.ChangePassword)

	// OMR Batch endpoints
	api.Get("/omr/batches", omrHandler.GetBatches)
	api.Post("/omr/batches", omrHandler.CreateBatch)
	api.Patch("/omr/batches/:id", omrHandler.UpdateBatch)
	api.Delete("/omr/batches/:id", omrHandler.DeleteBatch)
	api.Post("/omr/batches/:id/generate", omrHandler.GenerateVersions)

	// Rubric endpoints
	api.Get("/rubrics", rubricHandler.GetRubrics)
	api.Post("/rubrics", rubricHandler.CreateRubric)
	api.Patch("/rubrics/:id", rubricHandler.UpdateRubric)
	api.Delete("/rubrics/:id", rubricHandler.DeleteRubric)

	// Share Link endpoints
	api.Get("/shares", shareLinkHandler.GetLinks)
	api.Post("/shares", shareLinkHandler.CreateLink)
	api.Patch("/shares/:id", shareLinkHandler.UpdateLink)
	api.Delete("/shares/:id", shareLinkHandler.DeleteLink)

	// Live Websocket endpoints (Exempt from JWT Auth Header requirement since browsers block it on WS)
	ws := app.Group("/ws", handler.WebsocketUpgrade)
	ws.Get("/live/:id", websocket.New(leaderboardHub.ServeLeaderboard))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	log.Fatal(app.Listen(":" + port))
}

// getCorsOrigins returns allowed CORS origins from env (comma-separated) with localhost fallback
func getCorsOrigins() []string {
	origin := os.Getenv("CORS_ORIGIN")
	if origin != "" {
		origins := strings.Split(origin, ",")
		// Always include localhost for local dev
		return append(origins, "http://localhost:3000")
	}
	return []string{"http://localhost:3000"}
}
