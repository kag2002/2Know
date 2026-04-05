package utils

import (
	"strings"

	"backend/internal/model"

	"github.com/microcosm-cc/bluemonday"
)

// policy is the default Universal Generated Content (UGC) policy from bluemonday.
// It allows basic layout tags (b, i, strong, p, img, br) but firmly strips dangerous tags (script, object, embed).
var policy = bluemonday.UGCPolicy()

// SanitizeString provides a primitive exposure of the bluemonday engine for dynamic string washing (like LLM Prompts).
func SanitizeString(s string) string {
	return policy.Sanitize(s)
}

// SanitizeQuestion recursively neutralizes Stored XSS vectors inside Question Content and Options.
func SanitizeQuestion(q *model.Question) {
	if q == nil {
		return
	}
	q.Content = policy.Sanitize(q.Content)
	q.Explanation = policy.Sanitize(q.Explanation)
	q.Difficulty = policy.Sanitize(q.Difficulty)
	q.Folder = policy.Sanitize(q.Folder)
	for i := range q.Tags {
		q.Tags[i] = policy.Sanitize(q.Tags[i])
	}
	// TODO: Consider sanitizing nested datatypes.JSON strings if necessary, though Map sanitizer handles most endpoints.
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

// SanitizeTag strips malicious scripts from Tag representations.
func SanitizeTag(t *model.Tag) {
	if t == nil {
		return
	}
	t.Name = policy.Sanitize(t.Name)
	t.Color = policy.Sanitize(t.Color)
}

// SanitizeResult aggressively cleans all Student Answers to prevent Essay Stored XSS against Teachers.
func SanitizeResult(r *model.TestResult) {
	if r == nil || r.Answers == nil {
		return
	}
	for k, vObj := range r.Answers {
		if vStr, ok := vObj.(string); ok {
			runes := []rune(vStr)
			if len(runes) > 2000 {
				vStr = string(runes[:2000]) // Shield OOM
			}
			r.Answers[k] = policy.Sanitize(vStr)
		} else if vMap, okMap := vObj.(map[string]interface{}); okMap {
			SanitizeMap(vMap)
			r.Answers[k] = vMap
		}
	}

	// SECURITY (Phase 2 Hardening): Sanitize QuestionTimes to prevent data injection & OOM
	if r.QuestionTimes != nil {
		if len(r.QuestionTimes) > 200 {
			r.QuestionTimes = nil // More entries than any real quiz → discard entirely
		} else {
			for k, v := range r.QuestionTimes {
				if v < 0 || v > 7200 { // Cap at 2 hours per question max
					r.QuestionTimes[k] = 0
				}
			}
		}
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

// SanitizeStudent strips XSS payloads from student-submitted profile data.
func SanitizeStudent(s *model.Student) {
	if s == nil {
		return
	}
	s.FullName = policy.Sanitize(s.FullName)
	s.Email = policy.Sanitize(s.Email)
}

// SanitizeClass strips XSS payloads from class metadata to protect the dashboard.
func SanitizeClass(c *model.Class) {
	if c == nil {
		return
	}
	c.Name = policy.Sanitize(c.Name)
	c.Description = policy.Sanitize(c.Description)
}

// SanitizeExtras strips XSS payloads from Title fields across OmrBatch, Rubric, and ShareLink.
func SanitizeOmrBatch(b *model.OmrBatch) {
	if b == nil {
		return
	}
	b.Title = policy.Sanitize(b.Title)
}

func SanitizeRubric(r *model.Rubric) {
	if r == nil {
		return
	}
	r.Title = policy.Sanitize(r.Title)
	r.Subject = policy.Sanitize(r.Subject)
	r.Target = policy.Sanitize(r.Target)
}

func SanitizeShareLink(l *model.ShareLink) {
	if l == nil {
		return
	}
	l.Title = policy.Sanitize(l.Title)
}

// SanitizeMaterial strips Stored XSS payloads from Material metadata
func SanitizeMaterial(m *model.Material) {
	if m == nil {
		return
	}
	m.Title = policy.Sanitize(m.Title)
	m.Description = policy.Sanitize(m.Description)
	m.LinkURL = policy.Sanitize(m.LinkURL)

	// SECURITY: Strict URL schema enforcement to block javascript:alert(1) stored XSS
	if m.LinkURL != "" {
		lowerURL := strings.ToLower(m.LinkURL)
		if !strings.HasPrefix(lowerURL, "http://") && !strings.HasPrefix(lowerURL, "https://") {
			// If missing schema but starts with www, auto-patch for UX
			if strings.HasPrefix(lowerURL, "www.") {
				m.LinkURL = "https://" + m.LinkURL
			} else {
				// Strip dangerous URIs completely
				m.LinkURL = ""
			}
		}
	}
}
