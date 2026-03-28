package handler

import (
	"backend/internal/model"
	"backend/internal/service"

	"github.com/gofiber/fiber/v3"
)

type MaterialHandler struct {
	materialService service.MaterialService
}

func NewMaterialHandler(s service.MaterialService) *MaterialHandler {
	return &MaterialHandler{materialService: s}
}

func (h *MaterialHandler) CreateMaterial(c fiber.Ctx) error {
	classID := c.Params("id")
	userID := c.Locals("user_id").(string)

	var req model.Material
	if err := c.Bind().Body(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
	}

	if err := h.materialService.CreateMaterial(classID, userID, &req); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(fiber.StatusCreated).JSON(req)
}

func (h *MaterialHandler) GetMaterials(c fiber.Ctx) error {
	classID := c.Params("id")
	userID := c.Locals("user_id").(string)

	materials, err := h.materialService.GetMaterialsByClass(classID, userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(materials)
}

func (h *MaterialHandler) DeleteMaterial(c fiber.Ctx) error {
	classID := c.Params("id")
	materialID := c.Params("materialId")
	userID := c.Locals("user_id").(string)

	if err := h.materialService.DeleteMaterial(materialID, classID, userID); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.SendStatus(fiber.StatusNoContent)
}
