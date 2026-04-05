package utils

import (
	"encoding/json"
	"log"

	"gorm.io/datatypes"
)

// ScrubMetadataAnswers strips out all cheat-vectors (correct_pairs, is_correct, blanks_answers)
// from the polymorphic Metadata JSONB before it is sent to the public client.
func ScrubMetadataAnswers(metadata datatypes.JSON) datatypes.JSON {
	if len(metadata) == 0 {
		return metadata
	}

	var data map[string]interface{}
	if err := json.Unmarshal(metadata, &data); err != nil {
		log.Printf("Failed to unmarshal metadata for scrubbing: %v", err)
		return metadata
	}

	// Remove common answer keys used across the platform's question types
	delete(data, "correct_pairs")
	delete(data, "blanks_answers")
	delete(data, "correct_options")
	delete(data, "is_correct")

	// If there are nested options array, scrub them too
	if options, ok := data["options"].([]interface{}); ok {
		for _, opt := range options {
			if optMap, ok2 := opt.(map[string]interface{}); ok2 {
				delete(optMap, "is_correct")
			}
		}
	}

	safeMetadata, err := json.Marshal(data)
	if err != nil {
		log.Printf("Failed to marshal scrubbed metadata: %v", err)
		// SECURITY: If we fail to re-marshal, return empty JSON to be safe
		return datatypes.JSON(`{}`)
	}

	return datatypes.JSON(safeMetadata)
}
