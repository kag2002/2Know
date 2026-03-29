package handler

import (
	"backend/internal/model"
	"backend/internal/service"
	"backend/internal/utils"

	"github.com/gofiber/fiber/v3"
)

type MaterialHandler struct {
	materialService service.MaterialService
}

func NewMaterialHandler(s service.MaterialService) *MaterialHandler {
	return &MaterialHandler{materialService: s}
}

func (h *MaterialHandler) CreateMaterial(c fiber.Ctx) error {
	userID := getUserIdFromToken(c)
	if userID == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	classID := c.Params("id")

	var req model.Material
	if err := c.Bind().Body(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
	}

	if err := utils.ValidateStruct(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Validation failed: " + err.Error()})
	}

	// SECURITY: Strip Stored XSS payloads from Material metadata
	utils.SanitizeMaterial(&req)

	if err := h.materialService.CreateMaterial(classID, userID, &req); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Không thể tạo tài liệu. Vui lòng thử lại sau."})
	}

	return c.Status(fiber.StatusCreated).JSON(req)
}

func (h *MaterialHandler) GetMaterials(c fiber.Ctx) error {
	userID := getUserIdFromToken(c)
	if userID == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	classID := c.Params("id")

	materials, err := h.materialService.GetMaterialsByClass(classID, userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Không thể tải tài liệu. Vui lòng thử lại sau."})
	}

	return c.JSON(materials)
}

func (h *MaterialHandler) DeleteMaterial(c fiber.Ctx) error {
	userID := getUserIdFromToken(c)
	if userID == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	classID := c.Params("id")
	materialID := c.Params("materialId")

	if err := h.materialService.DeleteMaterial(materialID, classID, userID); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Không thể xoá tài liệu. Vui lòng thử lại sau."})
	}

	return c.SendStatus(fiber.StatusNoContent)
}
