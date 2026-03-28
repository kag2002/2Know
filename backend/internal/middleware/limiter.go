package middleware

import (
	"encoding/json"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/limiter"
)

// GlobalLimiter apply default 100 requests per 1 minute limit for APIs
func GlobalLimiter() fiber.Handler {
	return limiter.New(limiter.Config{
		Max:        100,
		Expiration: 1 * time.Minute,
		KeyGenerator: func(c fiber.Ctx) string {
			return c.IP()
		},
		LimitReached: func(c fiber.Ctx) error {
			return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
				"error": "Quá nhiều yêu cầu. Vui lòng thử lại sau.",
			})
		},
	})
}

// AuthLimiter apply strict 5 requests per 1 minute limit for Auth APIs (Login/Register)
func AuthLimiter() fiber.Handler {
	return limiter.New(limiter.Config{
		Max:        5,
		Expiration: 1 * time.Minute,
		KeyGenerator: func(c fiber.Ctx) string {
			return c.IP()
		},
		LimitReached: func(c fiber.Ctx) error {
			return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
				"error": "Tài khoản của bạn đã thực hiện quá nhiều thao tác đăng nhập/đăng ký. Vui lòng thử lại sau 1 phút.",
			})
		},
	})
}

// AILimiter apply extremely strict 3 requests per 1 minute limit dedicated for AI operations to prevent billing exhaustion.
func AILimiter() fiber.Handler {
	return limiter.New(limiter.Config{
		Max:        3,
		Expiration: 1 * time.Minute,
		KeyGenerator: func(c fiber.Ctx) string {
			return c.IP()
		},
		LimitReached: func(c fiber.Ctx) error {
			return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
				"error": "Hệ thống AI đang xử lý quá tải thao tác từ bạn. Vui lòng đợi 1 phút để tiếp tục tạo đề.",
			})
		},
	})
}

// SubmitLimiter apply 10 requests per 1 minute limit for public test submission to prevent spam DDoS
func SubmitLimiter() fiber.Handler {
	return limiter.New(limiter.Config{
		Max:        10,
		Expiration: 1 * time.Minute,
		KeyGenerator: func(c fiber.Ctx) string {
			if len(c.Body()) > 0 {
				var payload struct {
					StudentIdentifier string `json:"student_identifier"`
				}
				if err := json.Unmarshal(c.Body(), &payload); err == nil && payload.StudentIdentifier != "" {
					return c.IP() + "_" + payload.StudentIdentifier
				}
			}
			return c.IP()
		},
		LimitReached: func(c fiber.Ctx) error {
			return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
				"error": "Bạn đã gửi quá nhiều bài nộp. Vui lòng đợi 1 phút trước khi thử lại.",
			})
		},
	})
}
