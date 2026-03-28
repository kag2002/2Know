package middleware

import (
	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/helmet"
)

// SecurityHeaders applies helmet middleware to set basic secure headers
func SecurityHeaders() fiber.Handler {
	return helmet.New()
}
