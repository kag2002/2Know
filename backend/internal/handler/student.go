package handler

import (
	"log"

	"github.com/gofiber/fiber/v3"

	"backend/internal/model"
	"backend/internal/service"
)

type StudentHandler struct {
	studentService service.StudentService
}

func NewStudentHandler(studentService service.StudentService) *StudentHandler {
	return &StudentHandler{studentService}
}

// GetStudents returns all students across all classes for the currently authenticated teacher
func (h *StudentHandler) GetStudents(c fiber.Ctx) error {
	teacherID := getUserIdFromToken(c)
	if teacherID == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	students, err := h.studentService.GetStudentsByTeacherID(teacherID)
	if err != nil {
		log.Printf("GetStudents Error: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch students"})
	}

	return c.JSON(students)
}

// GetStudentByID returns details for a single student
func (h *StudentHandler) GetStudentByID(c fiber.Ctx) error {
	teacherID := getUserIdFromToken(c)
	if teacherID == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	id := c.Params("id")
	student, err := h.studentService.GetStudentByID(id)
	if err != nil {
		log.Printf("GetStudentByID Error: %v", err)
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Student not found"})
	}

	return c.JSON(student)
}

// CreateStudent allows the teacher to manually register a student to a class
func (h *StudentHandler) CreateStudent(c fiber.Ctx) error {
	// Security check: Make sure they are authenticated
	teacherID := getUserIdFromToken(c)
	if teacherID == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	var req model.Student
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input data"})
	}

	if err := h.studentService.CreateStudent(&req); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create student"})
	}

	return c.Status(fiber.StatusCreated).JSON(req)
}

// DeleteStudent allows the teacher to remove a student from the system
func (h *StudentHandler) DeleteStudent(c fiber.Ctx) error {
	teacherID := getUserIdFromToken(c)
	if teacherID == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	studentID := c.Params("id")
	if studentID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Student ID is required"})
	}

	if err := h.studentService.DeleteStudent(studentID); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to delete student"})
	}

	return c.JSON(fiber.Map{"message": "Student successfully deleted"})
}

// UpdateStudent allows the teacher to update student properties like email or name
func (h *StudentHandler) UpdateStudent(c fiber.Ctx) error {
	teacherID := getUserIdFromToken(c)
	if teacherID == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	studentID := c.Params("id")
	if studentID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Student ID is required"})
	}

	var req model.Student
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input data"})
	}

	if err := h.studentService.UpdateStudent(studentID, &req); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update student"})
	}

	return c.JSON(req)
}

