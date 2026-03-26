package handler

import (
	"github.com/gofiber/fiber/v3"

	"backend/internal/model"
	"backend/internal/service"
)

type NoteHandler struct {
	svc service.NoteService
}

func NewNoteHandler(svc service.NoteService) *NoteHandler {
	return &NoteHandler{svc: svc}
}

func (h *NoteHandler) GetNotes(c fiber.Ctx) error {
	userId := getUserIdFromToken(c)
	if userId == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	notes, err := h.svc.GetNotes(userId)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch notes"})
	}

	return c.JSON(notes)
}

func (h *NoteHandler) CreateNote(c fiber.Ctx) error {
	userId := getUserIdFromToken(c)
	if userId == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	note := new(model.Note)
	if err := c.Bind().JSON(note); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	note.UserID = userId

	if err := h.svc.CreateNote(note); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create note"})
	}

	return c.Status(fiber.StatusCreated).JSON(note)
}

func (h *NoteHandler) DeleteNote(c fiber.Ctx) error {
	userId := getUserIdFromToken(c)
	if userId == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	id := c.Params("id")
	if err := h.svc.DeleteNote(id, userId); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to delete note"})
	}

	return c.SendStatus(fiber.StatusNoContent)
}

func (h *NoteHandler) TogglePin(c fiber.Ctx) error {
	userId := getUserIdFromToken(c)
	if userId == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	id := c.Params("id")
	if err := h.svc.TogglePin(id, userId); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to toggle pin note"})
	}

	return c.SendStatus(fiber.StatusOK)
}
