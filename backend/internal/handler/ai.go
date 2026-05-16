package handler

import (
	"log"

	"github.com/gofiber/fiber/v3"

	"backend/internal/service"
	"backend/internal/utils"
)

type AIHandler struct {
	svc service.AIService
}

func NewAIHandler(svc service.AIService) *AIHandler {
	return &AIHandler{svc: svc}
}

func (h *AIHandler) GenerateQuiz(c fiber.Ctx) error {
	userId := getUserIdFromToken(c)
	if userId == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	var req struct {
		Prompt string `json:"prompt" validate:"required,max=1000"`
		Config struct {
			Count      int    `json:"count"`
			Difficulty string `json:"difficulty"`
			Format     string `json:"format"`
			Language   string `json:"language"`
		} `json:"config"`
	}

	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	if err := utils.ValidateStruct(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Prompt must be less than 1000 characters"})
	}

	if req.Prompt == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Prompt cannot be empty"})
	}

	questions, err := h.svc.GenerateQuestions(req.Prompt, req.Config.Count, req.Config.Difficulty, req.Config.Format, req.Config.Language)
	if err != nil {
		// SECURITY: Never expose internal AI provider errors to the client (may contain API key fragments or billing details)
		log.Printf("AI GenerateQuestions error: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "AI service is currently unavailable. Please try again later."})
	}

	// SECURITY: AI Reflection XSS Protection.
	// Strip any malicious HTML payloads embedded by the LLM (Prompt Injection defense).
	for i := range questions {
		questions[i].Question = utils.SanitizeString(questions[i].Question)
		questions[i].Explanation = utils.SanitizeString(questions[i].Explanation)
		for j := range questions[i].Options {
			questions[i].Options[j] = utils.SanitizeString(questions[i].Options[j])
		}
	}

	return c.JSON(fiber.Map{
		"questions": questions,
	})
}

func (h *AIHandler) GenerateQuizStream(c fiber.Ctx) error {
	userId := getUserIdFromToken(c)
	if userId == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	var req struct {
		Prompt string `json:"prompt" validate:"required,max=1000"`
		Config struct {
			Count      int    `json:"count"`
			Difficulty string `json:"difficulty"`
			Format     string `json:"format"`
			Language   string `json:"language"`
		} `json:"config"`
	}

	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	if err := utils.ValidateStruct(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Prompt must be less than 1000 characters"})
	}

	if req.Prompt == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Prompt cannot be empty"})
	}

	streamBody, err := h.svc.GenerateQuestionsStream(req.Prompt, req.Config.Count, req.Config.Difficulty, req.Config.Format, req.Config.Language)
	if err != nil {
		log.Printf("AI GenerateQuestionsStream error: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "AI service is currently unavailable. Please try again later."})
	}

	c.Set("Content-Type", "text/event-stream")
	c.Set("Cache-Control", "no-cache")
	c.Set("Connection", "keep-alive")

	return c.SendStream(streamBody)
}

func (h *AIHandler) RefineQuiz(c fiber.Ctx) error {
	userId := getUserIdFromToken(c)
	if userId == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	var req struct {
		OriginalQuestions []service.AIQuestion `json:"original_questions" validate:"required,min=1"`
		RefinePrompt      string               `json:"refine_prompt" validate:"required,max=1000"`
	}

	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	if req.RefinePrompt == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Refine prompt cannot be empty"})
	}

	questions, err := h.svc.RefineQuestions(req.OriginalQuestions, req.RefinePrompt)
	if err != nil {
		log.Printf("AI RefineQuestions error: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "AI service is currently unavailable. Please try again later."})
	}

	for i := range questions {
		questions[i].Question = utils.SanitizeString(questions[i].Question)
		questions[i].Explanation = utils.SanitizeString(questions[i].Explanation)
		for j := range questions[i].Options {
			questions[i].Options[j] = utils.SanitizeString(questions[i].Options[j])
		}
	}

	return c.JSON(fiber.Map{
		"questions": questions,
	})
}

func (h *AIHandler) Chat(c fiber.Ctx) error {
	userId := getUserIdFromToken(c)
	if userId == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	var req struct {
		Messages []map[string]string `json:"messages" validate:"required"`
	}

	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	if len(req.Messages) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Messages cannot be empty"})
	}

	streamBody, err := h.svc.ChatStream(req.Messages)
	if err != nil {
		log.Printf("AI ChatStream error: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "AI service is currently unavailable."})
	}

	c.Set("Content-Type", "text/event-stream")
	c.Set("Cache-Control", "no-cache")
	c.Set("Connection", "keep-alive")

	return c.SendStream(streamBody)
}

func (h *AIHandler) UploadPDF(c fiber.Ctx) error {
	userId := getUserIdFromToken(c)
	if userId == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	file, err := c.FormFile("file")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "File upload required"})
	}

	if file.Size > 5*1024*1024 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "File exceeds 5MB limit"})
	}

	f, err := file.Open()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to open file"})
	}
	defer f.Close()

	text, err := utils.ExtractTextFromPDF(f, file.Size)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to extract text from PDF"})
	}

	if len(text) > 5000 {
		text = text[:5000] + "\n\n... (Văn bản đã được cắt bớt do quá dài)"
	}

	return c.JSON(fiber.Map{
		"text": text,
	})
}
