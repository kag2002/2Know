package service

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"
)

type AIService interface {
	GenerateQuestions(prompt string) ([]AIQuestion, error)
}

type aiService struct{}

func NewAIService() AIService {
	return &aiService{}
}

type AIQuestion struct {
	Question     string   `json:"question"`
	Options      []string `json:"options"`
	CorrectIndex int      `json:"correctIndex"`
	Explanation  string   `json:"explanation"`
}

func (s *aiService) GenerateQuestions(prompt string) ([]AIQuestion, error) {
	apiKey := os.Getenv("OPENAI_API_KEY")

	// If no API Key is provided, fallback to standard mock responses
	if apiKey == "" {
		time.Sleep(2 * time.Second)
		return []AIQuestion{
			{
				Question:     "Theo định dạng sinh tự động của 2Know AI, khái niệm nào đại diện cho tính mô đun hóa?",
				Options:      []string{"Nguyên khối (Monolithic)", "Vi dịch vụ (Microservices)", "Phân tán tĩnh", "Bất biến cục bộ"},
				CorrectIndex: 1,
				Explanation:  "Microservices chia ứng dụng thành các dịch vụ nhỏ để dễ dàng triển khai.",
			},
			{
				Question:     "Câu hỏi mô phỏng 2: API Gateway đóng vai trò gì?",
				Options:      []string{"Phân định tuyến giao tiếp giữa Client và Microservices", "Lưu trữ dữ liệu tĩnh", "Quản trị cơ sở dữ liệu vật lý", "Biên dịch mã nguồn frontend"},
				CorrectIndex: 0,
				Explanation:  "API Gateway là lớp trung gian giúp Frontend giao tiếp tập trung với nhiều dịch vụ nền."},
		}, nil
	}

	// 1. Construct the LLM Request
	sysPrompt := `Bạn là chuyên gia giáo dục của nền tảng 2Know. 
Nhiệm vụ của bạn: Tạo câu hỏi trắc nghiệm từ văn bản/chủ đề người dùng cung cấp.
RẤT QUAN TRỌNG: Bạn CHỈ ĐƯỢC PHÉP trả về MỘT mảng JSON nguyên gốc. KHÔNG BAO GỒM markdown.
Định dạng bắt buộc:
[
  {
    "question": "Nội dung câu hỏi?",
    "options": ["Sai 1", "Đúng", "Sai 2", "Sai 3"],
    "correctIndex": 1,
    "explanation": "Giải thích vì sao đúng."
  }
]`

	reqBody := map[string]interface{}{
		"model": "gpt-4o-mini", // Cost efficient fallback
		"messages": []map[string]string{
			{"role": "system", "content": sysPrompt},
			{"role": "user", "content": prompt},
		},
		"temperature": 0.5,
	}

	jsonValue, _ := json.Marshal(reqBody)
	req, _ := http.NewRequest("POST", "https://api.openai.com/v1/chat/completions", bytes.NewBuffer(jsonValue))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+apiKey)

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, errors.New("Failed to reach OpenAI servers")
	}
	defer resp.Body.Close()

	bodyBytes, _ := io.ReadAll(resp.Body)
	
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("OpenAI Error: %s", string(bodyBytes))
	}

	var oaiResp struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
	}

	if err := json.Unmarshal(bodyBytes, &oaiResp); err != nil {
		return nil, errors.New("Failed to decode OpenAI root schema")
	}

	if len(oaiResp.Choices) == 0 {
		return nil, errors.New("OpenAI returned no choices")
	}

	rawContent := oaiResp.Choices[0].Message.Content
	// Clean up potential markdown formatting (```json ... ```)
	rawContent = strings.TrimPrefix(rawContent, "```json")
	rawContent = strings.TrimPrefix(rawContent, "```")
	rawContent = strings.TrimSuffix(rawContent, "```")
	rawContent = strings.TrimSpace(rawContent)

	var questions []AIQuestion
	if err := json.Unmarshal([]byte(rawContent), &questions); err != nil {
		return nil, errors.New("Failed to decode the JSON array strictly: " + rawContent)
	}

	return questions, nil
}
