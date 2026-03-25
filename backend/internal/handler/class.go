package handler

import (
	"log"

	"github.com/gofiber/fiber/v3"

	"backend/internal/config"
	"backend/internal/model"
)

// CREATE Class
func CreateClass(c fiber.Ctx) error {
	var class model.Class
	if err := c.Bind().JSON(&class); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	userId := getUserIdFromToken(c)
	if userId == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	class.TeacherID = userId

	if err := config.DB.Create(&class).Error; err != nil {
		log.Printf("Error creating class: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create class"})
	}

	return c.Status(fiber.StatusCreated).JSON(class)
}

// GET Classes
func GetClasses(c fiber.Ctx) error {
	userId := getUserIdFromToken(c)
	if userId == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	var classes []model.Class
	// Preload to get student count quickly
	if err := config.DB.Preload("Students").Where("teacher_id = ?", userId).Order("created_at desc").Find(&classes).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch classes"})
	}

	// We could map this to a DTO with StudentCount, but GORM preload works structurally
	return c.JSON(classes)
}

// GET Class By ID
func GetClassByID(c fiber.Ctx) error {
	id := c.Params("id")
	userId := getUserIdFromToken(c)

	var class model.Class
	if err := config.DB.Preload("Students").Where("id = ? AND teacher_id = ?", id, userId).First(&class).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Class not found or unauthorized"})
	}

	return c.JSON(class)
}

// POST Student to Class
func AddStudent(c fiber.Ctx) error {
	classId := c.Params("id")
	userId := getUserIdFromToken(c)

	// Verify teacher owns the class
	var class model.Class
	if err := config.DB.Where("id = ? AND teacher_id = ?", classId, userId).First(&class).Error; err != nil {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Unauthorized to add student to this class"})
	}

	var student model.Student
	if err := c.Bind().JSON(&student); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	student.ClassID = classId

	if err := config.DB.Create(&student).Error; err != nil {
		log.Printf("Error adding student: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to add student"})
	}

	return c.Status(fiber.StatusCreated).JSON(student)
}
