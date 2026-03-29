package middleware

import (
	"fmt"
	"os"
	"strings"

	"github.com/gofiber/fiber/v3"
	"github.com/golang-jwt/jwt/v5"
)

// Protected ensures that a valid JWT token is provided
func Protected() fiber.Handler {
	return func(c fiber.Ctx) error {
		secret := os.Getenv("JWT_SECRET")
		if secret == "" {
			secret = "super_secret_jwt_key_please_change_in_prod"
		}

		authHeader := c.Get("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			// Fallback to checking cookies
			cookieToken := c.Cookies("2know_token")
			if cookieToken == "" {
				return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
					"error": "Missing or invalid token",
				})
			}
			authHeader = "Bearer " + cookieToken
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")

		// Parse the token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return []byte(secret), nil
		})

		if err != nil || !token.Valid {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Unauthorized or expired token",
			})
		}

		// Store user data (the claims) in locals for the next handlers
		c.Locals("user", token)

		// SECURITY: Extract and store userID directly for consistent access across all handlers
		if claims, ok := token.Claims.(jwt.MapClaims); ok {
			if sub, exists := claims["sub"].(string); exists {
				c.Locals("userID", sub)
			}
		}

		// Go to next middleware
		return c.Next()
	}
}
