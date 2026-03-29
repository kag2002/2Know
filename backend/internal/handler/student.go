package handler

import (
	"log"

	"github.com/gofiber/fiber/v3"

	"backend/internal/model"
	"backend/internal/service"
	"backend/internal/utils"
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
	// SECURITY: IDOR Protection (Only allow access if the student belongs to a class owned by the teacher)
	student, err := h.studentService.GetStudentByID(id, teacherID)
	if err != nil {
		log.Printf("GetStudentByID Error: %v", err)
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Student not found or unauthorized"})
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

	if err := utils.ValidateStruct(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Validation failed: " + err.Error()})
	}

	// SECURITY: Strip Stored XSS payloads from Student data
	utils.SanitizeStudent(&req)

	if err := h.studentService.CreateStudent(teacherID, &req); err != nil {
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

	// SECURITY: IDOR Protection
	if err := h.studentService.DeleteStudent(studentID, teacherID); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to delete student or unauthorized"})
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

	if err := utils.ValidateStruct(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Validation failed: " + err.Error()})
	}

	// SECURITY: Strip Stored XSS payloads from Student data
	utils.SanitizeStudent(&req)

	// SECURITY: Prevent Student Robbery (Mass Assignment)
	// Force GORM to ignore structural reassignment by zeroing out ID and ClassID
	req.ID = studentID
	req.ClassID = "" 

	// SECURITY: IDOR Protection
	if err := h.studentService.UpdateStudent(studentID, teacherID, &req); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update student or unauthorized"})
	}

	return c.JSON(req)
}

