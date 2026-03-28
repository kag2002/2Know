package utils

import (
	"github.com/go-playground/validator/v10"
)

// Global validator instance
var Validate *validator.Validate

func init() {
	Validate = validator.New()
}

// ValidateStruct validates a generic struct using go-playground/validator
func ValidateStruct(s interface{}) error {
	return Validate.Struct(s)
}
