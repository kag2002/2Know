package handler

import (
	"github.com/gofiber/fiber/v3"

	"backend/internal/model"
	"backend/internal/service"
)

type TagHandler struct {
	svc service.TagService
}

func NewTagHandler(svc service.TagService) *TagHandler {
	return &TagHandler{svc: svc}
}

func (h *TagHandler) GetTags(c fiber.Ctx) error {
	userId := getUserIdFromToken(c)
	if userId == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	tags, err := h.svc.GetTags(userId)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch tags"})
	}

	return c.JSON(tags)
}

func (h *TagHandler) CreateTag(c fiber.Ctx) error {
	userId := getUserIdFromToken(c)
	if userId == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	tag := new(model.Tag)
	if err := c.Bind().JSON(tag); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	tag.UserID = userId

	if err := h.svc.CreateTag(tag); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create tag"})
	}

	return c.Status(fiber.StatusCreated).JSON(tag)
}

func (h *TagHandler) DeleteTag(c fiber.Ctx) error {
	userId := getUserIdFromToken(c)
	if userId == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	id := c.Params("id")
	if err := h.svc.DeleteTag(id, userId); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to delete tag"})
	}

	return c.SendStatus(fiber.StatusNoContent)
}
