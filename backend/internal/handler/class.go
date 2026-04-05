package handler

import (
	"log"

	"github.com/gofiber/fiber/v3"

	"backend/internal/model"
	"backend/internal/service"
	"backend/internal/utils"
)

type ClassHandler struct {
	svc service.ClassService
}

func NewClassHandler(svc service.ClassService) *ClassHandler {
	return &ClassHandler{svc: svc}
}

// CREATE Class
func (h *ClassHandler) CreateClass(c fiber.Ctx) error {
	var class model.Class
	if err := c.Bind().JSON(&class); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	if err := utils.ValidateStruct(&class); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Validation failed: " + err.Error()})
	}

	// SECURITY: Strip Stored XSS payloads from Class metadata
	utils.SanitizeClass(&class)

	userId := getUserIdFromToken(c)
	if userId == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	if err := h.svc.CreateClass(userId, &class); err != nil {
		log.Printf("Error creating class: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create class"})
	}

	return c.Status(fiber.StatusCreated).JSON(class)
}

// GET Classes
func (h *ClassHandler) GetClasses(c fiber.Ctx) error {
	userId := getUserIdFromToken(c)
	if userId == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	classes, err := h.svc.GetClasses(userId)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch classes"})
	}

	return c.JSON(classes)
}

// GET Class By ID
func (h *ClassHandler) GetClassByID(c fiber.Ctx) error {
	id := c.Params("id")
	userId := getUserIdFromToken(c)

	class, err := h.svc.GetClassByID(id, userId)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Class not found or unauthorized"})
	}

	return c.JSON(class)
}

// POST Student to Class
func (h *ClassHandler) AddStudent(c fiber.Ctx) error {
	classId := c.Params("id")
	userId := getUserIdFromToken(c)

	var student model.Student
	if err := c.Bind().JSON(&student); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	if err := utils.ValidateStruct(&student); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Validation failed: " + err.Error()})
	}

	if err := h.svc.AddStudent(classId, userId, &student); err != nil {
		log.Printf("Error adding student: %v", err)
		// Usually a 403 or 404 from verify ownership, sending 400 for simplicity here
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Failed to add student, unauthorized or invalid class"})
	}

	return c.Status(fiber.StatusCreated).JSON(student)
}

// DELETE Class
func (h *ClassHandler) DeleteClass(c fiber.Ctx) error {
	id := c.Params("id")
	userId := getUserIdFromToken(c)
	if userId == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}
	if err := h.svc.DeleteClass(id, userId); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to delete class"})
	}
	return c.JSON(fiber.Map{"message": "Class deleted"})
}

// UPDATE Class
func (h *ClassHandler) UpdateClass(c fiber.Ctx) error {
	id := c.Params("id")
	userId := getUserIdFromToken(c)
	if userId == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	var class model.Class
	if err := c.Bind().JSON(&class); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	if err := utils.ValidateStruct(&class); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Validation failed: " + err.Error()})
	}

	// SECURITY: Strip Stored XSS payloads from Class metadata
	utils.SanitizeClass(&class)

	// SECURITY: Prevent Mass Assignment Vulnerability (Object Hijacking)
	class.ID = id
	class.TeacherID = userId

	if err := h.svc.UpdateClass(userId, &class); err != nil {
		log.Printf("Error updating class: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update class"})
	}

	return c.JSON(class)
}

// GetClassAnalytics returns per-student performance data for the Analytics tab
func (h *ClassHandler) GetClassAnalytics(c fiber.Ctx) error {
	id := c.Params("id")
	userId := getUserIdFromToken(c)
	if userId == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	analytics, err := h.svc.GetClassAnalytics(id, userId)
	if err != nil {
		log.Printf("Error fetching class analytics: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to load analytics"})
	}

	return c.JSON(analytics)
}
