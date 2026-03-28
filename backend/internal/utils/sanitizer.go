package utils

import (
	"backend/internal/model"

	"github.com/microcosm-cc/bluemonday"
)

// policy is the default Universal Generated Content (UGC) policy from bluemonday.
// It allows basic layout tags (b, i, strong, p, img, br) but firmly strips dangerous tags (script, object, embed).
var policy = bluemonday.UGCPolicy()

// SanitizeQuestion recursively neutralizes Stored XSS vectors inside Question Content and Options.
func SanitizeQuestion(q *model.Question) {
	if q == nil {
		return
	}
	q.Content = policy.Sanitize(q.Content)
	q.Explanation = policy.Sanitize(q.Explanation)
	for i := range q.Options {
		q.Options[i].Content = policy.Sanitize(q.Options[i].Content)
	}
}

// SanitizeQuiz strips malicious scripts from Quiz metadata to protect the Student taking it.
func SanitizeQuiz(q *model.Quiz) {
	if q == nil {
		return
	}
	q.Title = policy.Sanitize(q.Title)
	q.Description = policy.Sanitize(q.Description)
}

// SanitizeNote strips malicious scripts from Teacher notes to protect the dashboard.
func SanitizeNote(n *model.Note) {
	if n == nil {
		return
	}
	n.Content = policy.Sanitize(n.Content)
}

// SanitizeResult aggressively cleans all Student Answers to prevent Essay Stored XSS against Teachers.
func SanitizeResult(r *model.TestResult) {
	if r == nil || r.Answers == nil {
		return
	}
	for k, v := range r.Answers {
		r.Answers[k] = policy.Sanitize(v)
	}
}

// SanitizeMap recursively scrubs all strings within a dynamic map to prevent Stored XSS inside Mass-Assignment safe PATCH requests.
func SanitizeMap(m map[string]interface{}) {
	if m == nil {
		return
	}
	for k, v := range m {
		switch val := v.(type) {
		case string:
			m[k] = policy.Sanitize(val)
		case map[string]interface{}:
			SanitizeMap(val)
		case []interface{}:
			for i, item := range val {
				if str, ok := item.(string); ok {
					val[i] = policy.Sanitize(str)
				}
			}
		}
	}
}
