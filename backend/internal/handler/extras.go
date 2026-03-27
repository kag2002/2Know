package handler

import (
	"fmt"
	"math/rand"
	"time"

	"github.com/gofiber/fiber/v3"

	"backend/internal/model"
	"backend/internal/service"
)

// ==================== OMR Batch Handler ====================

type OmrBatchHandler struct {
	svc service.OmrBatchService
}

func NewOmrBatchHandler(svc service.OmrBatchService) *OmrBatchHandler {
	return &OmrBatchHandler{svc: svc}
}

func (h *OmrBatchHandler) GetBatches(c fiber.Ctx) error {
	userID, _ := c.Locals("userID").(string)
	batches, err := h.svc.GetBatches(userID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to get batches"})
	}
	return c.JSON(batches)
}

func (h *OmrBatchHandler) CreateBatch(c fiber.Ctx) error {
	userID, _ := c.Locals("userID").(string)
	var batch model.OmrBatch
	if err := c.Bind().JSON(&batch); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}
	batch.UserID = userID
	if err := h.svc.CreateBatch(&batch); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create batch"})
	}
	return c.Status(201).JSON(batch)
}

func (h *OmrBatchHandler) UpdateBatch(c fiber.Ctx) error {
	userID, _ := c.Locals("userID").(string)
	id := c.Params("id")
	var batch model.OmrBatch
	if err := c.Bind().JSON(&batch); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}
	
	if err := h.svc.UpdateBatch(id, userID, &batch); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update batch"})
	}
	return c.JSON(batch)
}

func (h *OmrBatchHandler) DeleteBatch(c fiber.Ctx) error {
	userID, _ := c.Locals("userID").(string)
	id := c.Params("id")
	if err := h.svc.DeleteBatch(id, userID); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete batch"})
	}
	return c.JSON(fiber.Map{"message": "Batch deleted"})
}

// ==================== Rubric Handler ====================

type RubricHandler struct {
	svc service.RubricService
}

func NewRubricHandler(svc service.RubricService) *RubricHandler {
	return &RubricHandler{svc: svc}
}

func (h *RubricHandler) GetRubrics(c fiber.Ctx) error {
	userID, _ := c.Locals("userID").(string)
	rubrics, err := h.svc.GetRubrics(userID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to get rubrics"})
	}
	return c.JSON(rubrics)
}

func (h *RubricHandler) CreateRubric(c fiber.Ctx) error {
	userID, _ := c.Locals("userID").(string)
	var rubric model.Rubric
	if err := c.Bind().JSON(&rubric); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}
	rubric.UserID = userID
	if err := h.svc.CreateRubric(&rubric); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create rubric"})
	}
	return c.Status(201).JSON(rubric)
}

func (h *RubricHandler) UpdateRubric(c fiber.Ctx) error {
	userID, _ := c.Locals("userID").(string)
	id := c.Params("id")
	var rubric model.Rubric
	if err := c.Bind().JSON(&rubric); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}
	
	if err := h.svc.UpdateRubric(id, userID, &rubric); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update rubric"})
	}
	return c.JSON(rubric)
}

func (h *RubricHandler) DeleteRubric(c fiber.Ctx) error {
	userID, _ := c.Locals("userID").(string)
	id := c.Params("id")
	if err := h.svc.DeleteRubric(id, userID); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete rubric"})
	}
	return c.JSON(fiber.Map{"message": "Rubric deleted"})
}

// ==================== ShareLink Handler ====================

type ShareLinkHandler struct {
	svc service.ShareLinkService
}

func NewShareLinkHandler(svc service.ShareLinkService) *ShareLinkHandler {
	return &ShareLinkHandler{svc: svc}
}

func (h *ShareLinkHandler) GetLinks(c fiber.Ctx) error {
	userID, _ := c.Locals("userID").(string)
	links, err := h.svc.GetLinks(userID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to get share links"})
	}
	return c.JSON(links)
}

func (h *ShareLinkHandler) CreateLink(c fiber.Ctx) error {
	userID, _ := c.Locals("userID").(string)
	var link model.ShareLink
	if err := c.Bind().JSON(&link); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}
	link.UserID = userID
	if link.ShareCode == "" {
		link.ShareCode = fmt.Sprintf("2K-%04d", rand.Intn(10000))
	}
	if link.URL == "" {
		link.URL = fmt.Sprintf("http://localhost:3000/test/%s", link.QuizID)
	}
	if err := h.svc.CreateLink(&link); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create share link"})
	}
	return c.Status(201).JSON(link)
}

func (h *ShareLinkHandler) UpdateLink(c fiber.Ctx) error {
	userID, _ := c.Locals("userID").(string)
	id := c.Params("id")
	var link model.ShareLink
	if err := c.Bind().JSON(&link); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}
	
	if err := h.svc.UpdateLink(id, userID, &link); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update share link"})
	}
	return c.JSON(link)
}

func (h *ShareLinkHandler) DeleteLink(c fiber.Ctx) error {
	userID, _ := c.Locals("userID").(string)
	id := c.Params("id")
	if err := h.svc.DeleteLink(id, userID); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete link"})
	}
	return c.JSON(fiber.Map{"message": "Share link deleted"})
}

func init() {
	rand.Seed(time.Now().UnixNano())
}
