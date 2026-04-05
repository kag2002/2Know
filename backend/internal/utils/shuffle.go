package utils

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"time"

	"gorm.io/datatypes"
	"backend/internal/model"
)

type Option struct {
	Text      string `json:"text"`
	IsCorrect bool   `json:"isCorrect"`
}

type QuestionMetadata struct {
	Options []Option `json:"options"`
}

type ExamVersion struct {
	ExamCode  string            `json:"exam_code"`
	Questions []model.Question  `json:"questions"`
	AnswerKey map[string]string `json:"answer_key"` // Map from QuestionID -> Correct Option Label (A, B, C, D)
}

// GenerateOMRVersions shuffles question order and option order to generate multiple unique exam tests
func GenerateOMRVersions(quiz *model.Quiz, numVersions int) ([]ExamVersion, error) {
	if len(quiz.Questions) == 0 {
		return nil, fmt.Errorf("quiz has no questions to shuffle")
	}

	rng := rand.New(rand.NewSource(time.Now().UnixNano()))
	versions := make([]ExamVersion, 0, numVersions)
	baseCode := 101

	labels := []string{"A", "B", "C", "D", "E", "F", "G", "H"}

	for i := 0; i < numVersions; i++ {
		examCode := fmt.Sprintf("%d", baseCode+i)

		// Clone questions to avoid mutating the original underlying array
		clonedQuestions := make([]model.Question, len(quiz.Questions))
		copy(clonedQuestions, quiz.Questions)

		// Shuffle question order
		rng.Shuffle(len(clonedQuestions), func(a, b int) {
			clonedQuestions[a], clonedQuestions[b] = clonedQuestions[b], clonedQuestions[a]
		})

		answerKey := make(map[string]string)

		for qIdx := range clonedQuestions {
			q := clonedQuestions[qIdx]
			
			if q.Type == "multiple_choice" || q.Type == "Trắc nghiệm" {
				var meta QuestionMetadata
				if len(q.Metadata) > 0 {
					if err := json.Unmarshal(q.Metadata, &meta); err == nil && len(meta.Options) > 0 {
						// Clone Options specifically
						clonedOptions := make([]Option, len(meta.Options))
						copy(clonedOptions, meta.Options)

						// Shuffle options
						rng.Shuffle(len(clonedOptions), func(a, b int) {
							clonedOptions[a], clonedOptions[b] = clonedOptions[b], clonedOptions[a]
						})

						meta.Options = clonedOptions

						// Re-pack metadata securely
						newMetaBytes, _ := json.Marshal(meta)
						clonedQuestions[qIdx].Metadata = datatypes.JSON(newMetaBytes)

						// Store correct answer label mapped to the original Q.ID
						for optIdx, opt := range meta.Options {
							if opt.IsCorrect {
								if optIdx < len(labels) {
									answerKey[q.ID] = labels[optIdx]
								}
								break
							}
						}
					}
				}
			} else if q.Type == "true_false" {
				var meta QuestionMetadata
				if len(q.Metadata) > 0 {
					if err := json.Unmarshal(q.Metadata, &meta); err == nil {
						for optIdx, opt := range meta.Options {
							if opt.IsCorrect && optIdx < len(labels) {
								answerKey[q.ID] = labels[optIdx]
								break
							}
						}
					}
				}
			}
		}

		versions = append(versions, ExamVersion{
			ExamCode:  examCode,
			Questions: clonedQuestions,
			AnswerKey: answerKey,
		})
	}

	return versions, nil
}
