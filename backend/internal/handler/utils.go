package handler

import (
	"github.com/gofiber/fiber/v3"
	"github.com/golang-jwt/jwt/v5"
)

// getUserIdFromToken extracts the user UUID from the Fiber local JWT payload
func getUserIdFromToken(c fiber.Ctx) string {
	user := c.Locals("user")
	if user == nil {
		return ""
	}
	token := user.(*jwt.Token)
	claims := token.Claims.(jwt.MapClaims)
	return claims["sub"].(string)
}
