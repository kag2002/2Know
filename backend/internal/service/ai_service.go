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
	GenerateQuestions(prompt string, count int, difficulty, format, language string) ([]AIQuestion, error)
	GenerateQuestionsStream(prompt string, count int, difficulty, format, language string) (io.ReadCloser, error)
	RefineQuestions(originalQuestions []AIQuestion, refinePrompt string) ([]AIQuestion, error)
	ChatStream(messages []map[string]string) (io.ReadCloser, error)
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

func (s *aiService) GenerateQuestions(prompt string, count int, difficulty, format, language string) ([]AIQuestion, error) {
	apiKey := os.Getenv("OPENAI_API_KEY")
	apiBase := os.Getenv("OPENAI_API_BASE")
	if apiBase == "" {
		apiBase = "https://api.openai.com/v1"
	}
	aiModel := os.Getenv("OPENAI_MODEL")
	if aiModel == "" {
		aiModel = "gemma-4"
	}

	if count <= 0 {
		count = 10
	}
	if language == "" {
		language = "vi"
	}
	if difficulty == "auto" || difficulty == "" {
		difficulty = "bất kỳ"
	}

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
	sysPrompt := fmt.Sprintf(`Bạn là chuyên gia giáo dục của nền tảng 2Know. 
Nhiệm vụ của bạn: Tạo %d câu hỏi trắc nghiệm (%s) từ văn bản/chủ đề người dùng cung cấp.
Độ khó: %s.
Ngôn ngữ: %s.
RẤT QUAN TRỌNG: Bạn CHỈ ĐƯỢC PHÉP trả về MỘT mảng JSON nguyên gốc. KHÔNG BAO GỒM markdown.
Định dạng bắt buộc:
[
  {
    "question": "Nội dung câu hỏi?",
    "options": ["Sai 1", "Đúng", "Sai 2", "Sai 3"],
    "correctIndex": 1,
    "explanation": "Giải thích vì sao đúng."
  }
]`, count, format, difficulty, language)

	reqBody := map[string]interface{}{
		"model": aiModel, // Cost efficient fallback
		"messages": []map[string]string{
			{"role": "system", "content": sysPrompt},
			{"role": "user", "content": prompt},
		},
		"temperature": 0.5,
	}

	jsonValue, _ := json.Marshal(reqBody)
	client := &http.Client{Timeout: 600 * time.Second}

	var resp *http.Response
	var err error
	maxRetries := 2

	for attempt := 0; attempt <= maxRetries; attempt++ {
		// Re-create the request body buffer for each attempt because client.Do drains it
		req, _ := http.NewRequest("POST", apiBase+"/chat/completions", bytes.NewBuffer(jsonValue))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+apiKey)

		resp, err = client.Do(req)
		if err == nil && resp.StatusCode == http.StatusOK {
			break // Success
		}
		
		if resp != nil {
			resp.Body.Close()
		}

		if attempt < maxRetries {
			// Retry after 1s, then 2s
			time.Sleep(time.Duration(attempt+1) * time.Second)
		}
	}

	if err != nil {
		return nil, fmt.Errorf("Failed to reach OpenAI servers after retries: %v", err)
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

func (s *aiService) GenerateQuestionsStream(prompt string, count int, difficulty, format, language string) (io.ReadCloser, error) {
	apiKey := os.Getenv("OPENAI_API_KEY")
	apiBase := os.Getenv("OPENAI_API_BASE")
	if apiBase == "" {
		apiBase = "https://api.openai.com/v1"
	}
	aiModel := os.Getenv("OPENAI_MODEL")
	if aiModel == "" {
		aiModel = "gemma-4"
	}

	if count <= 0 {
		count = 10
	}
	if language == "" {
		language = "vi"
	}
	if difficulty == "auto" || difficulty == "" {
		difficulty = "bất kỳ"
	}

	sysPrompt := fmt.Sprintf(`Bạn là chuyên gia giáo dục của nền tảng 2Know. 
Nhiệm vụ của bạn: Tạo %d câu hỏi trắc nghiệm (%s) từ văn bản/chủ đề người dùng cung cấp.
Độ khó: %s.
Ngôn ngữ: %s.
RẤT QUAN TRỌNG: Bạn CHỈ ĐƯỢC PHÉP trả về MỘT mảng JSON nguyên gốc. KHÔNG BAO GỒM markdown hay chữ giải thích nào khác ngoài JSON.
Định dạng bắt buộc:
[
  {
    "question": "Nội dung câu hỏi?",
    "options": ["Sai 1", "Đúng", "Sai 2", "Sai 3"],
    "correctIndex": 1,
    "explanation": "Giải thích vì sao đúng."
  }
]`, count, format, difficulty, language)

	reqBody := map[string]interface{}{
		"model": aiModel,
		"messages": []map[string]string{
			{"role": "system", "content": sysPrompt},
			{"role": "user", "content": prompt},
		},
		"temperature": 0.5,
		"stream":      true,
	}

	jsonValue, err := json.Marshal(reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request body: %w", err)
	}

	req, err := http.NewRequest("POST", apiBase+"/chat/completions", bytes.NewBuffer(jsonValue))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	if apiKey != "" {
		req.Header.Set("Authorization", "Bearer "+apiKey)
	}

	client := &http.Client{Timeout: 600 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to make request to AI provider: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		defer resp.Body.Close()
		bodyBytes, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("AI provider returned error status %d: %s", resp.StatusCode, string(bodyBytes))
	}

	return resp.Body, nil
}

func (s *aiService) RefineQuestions(originalQuestions []AIQuestion, refinePrompt string) ([]AIQuestion, error) {
	apiKey := os.Getenv("OPENAI_API_KEY")
	apiBase := os.Getenv("OPENAI_API_BASE")
	if apiBase == "" {
		apiBase = "https://api.openai.com/v1"
	}
	aiModel := os.Getenv("OPENAI_MODEL")
	if aiModel == "" {
		aiModel = "gemma-4"
	}

	// Mock response if no API key
	if apiKey == "" {
		time.Sleep(2 * time.Second)
		if len(originalQuestions) > 0 {
			originalQuestions[0].Question += " (Đã tinh chỉnh)"
		}
		return originalQuestions, nil
	}

	origJSON, _ := json.MarshalIndent(originalQuestions, "", "  ")

	sysPrompt := `Bạn là chuyên gia giáo dục của nền tảng 2Know. 
Người dùng đã sinh ra một danh sách câu hỏi trắc nghiệm trước đó. Bây giờ, người dùng muốn CHỈNH SỬA lại danh sách đó.
RẤT QUAN TRỌNG: Bạn CHỈ ĐƯỢC PHÉP trả về MỘT mảng JSON chứa TOÀN BỘ danh sách câu hỏi.
LUẬT BẮT BUỘC: 
1. Nếu người dùng yêu cầu sửa 1 câu, bạn PHẢI trả về ĐẦY ĐỦ tất cả các câu hỏi (giữ nguyên những câu không bị sửa, chỉ thay đổi câu được yêu cầu). KHÔNG ĐƯỢC xóa bớt câu nào.
2. KHÔNG BAO GỒM markdown hay chữ giải thích nào khác ngoài JSON.
Định dạng bắt buộc:
[
  {
    "question": "Nội dung câu hỏi?",
    "options": ["Sai 1", "Đúng", "Sai 2", "Sai 3"],
    "correctIndex": 1,
    "explanation": "Giải thích vì sao đúng."
  }
]`

	userPrompt := fmt.Sprintf("Danh sách câu hỏi gốc:\n%s\n\nYêu cầu chỉnh sửa của người dùng:\n%s\n\nHãy trả về mảng JSON mới đã được cập nhật.", string(origJSON), refinePrompt)

	reqBody := map[string]interface{}{
		"model": aiModel,
		"messages": []map[string]string{
			{"role": "system", "content": sysPrompt},
			{"role": "user", "content": userPrompt},
		},
		"temperature": 0.5,
	}

	jsonValue, _ := json.Marshal(reqBody)
	client := &http.Client{Timeout: 600 * time.Second}

	var resp *http.Response
	var err error
	maxRetries := 2

	for attempt := 0; attempt <= maxRetries; attempt++ {
		req, _ := http.NewRequest("POST", apiBase+"/chat/completions", bytes.NewBuffer(jsonValue))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+apiKey)

		resp, err = client.Do(req)
		if err == nil && resp.StatusCode == http.StatusOK {
			break
		}
		if resp != nil {
			resp.Body.Close()
		}
		if attempt < maxRetries {
			time.Sleep(time.Duration(attempt+1) * time.Second)
		}
	}

	if err != nil {
		return nil, fmt.Errorf("Failed to reach OpenAI servers after retries: %v", err)
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


func (s *aiService) ChatStream(messages []map[string]string) (io.ReadCloser, error) {
	apiKey := os.Getenv("OPENAI_API_KEY")
	apiBase := os.Getenv("OPENAI_API_BASE")
	if apiBase == "" {
		apiBase = "https://api.openai.com/v1"
	}
	aiModel := os.Getenv("OPENAI_MODEL")
	if aiModel == "" {
		aiModel = "gemma-4"
	}

	reqBody := map[string]interface{}{
		"model":       aiModel,
		"messages":    messages,
		"temperature": 0.7,
		"stream":      true,
	}

	jsonValue, err := json.Marshal(reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request body: %w", err)
	}

	req, err := http.NewRequest("POST", apiBase+"/chat/completions", bytes.NewBuffer(jsonValue))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	if apiKey != "" {
		req.Header.Set("Authorization", "Bearer "+apiKey)
	}

	client := &http.Client{Timeout: 120 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to make request to AI provider: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		defer resp.Body.Close()
		bodyBytes, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("AI provider returned error status %d: %s", resp.StatusCode, string(bodyBytes))
	}

	return resp.Body, nil
}
