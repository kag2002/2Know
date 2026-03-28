package utils

import (
	"fmt"
	"strings"

	"github.com/go-playground/validator/v10"
)

// Global validator instance
var Validate *validator.Validate

func init() {
	Validate = validator.New()
}

// ValidateStruct validates a generic struct and returns Vietnamese error messages
func ValidateStruct(s interface{}) error {
	err := Validate.Struct(s)
	if err == nil {
		return nil
	}

	// This check is only needed for standard parsing. 
	// If it's not ValidationErrors, return generically
	validationErrs, ok := err.(validator.ValidationErrors)
	if !ok {
		return err
	}

	var errors []string
	for _, err := range validationErrs {
		field := err.Field()
		tag := err.Tag()
		param := err.Param()

		switch tag {
		case "required":
			errors = append(errors, fmt.Sprintf("Trường '%s' không được để trống.", field))
		case "min":
			errors = append(errors, fmt.Sprintf("Trường '%s' quá ngắn (Tối thiểu %s).", field, param))
		case "max":
			errors = append(errors, fmt.Sprintf("Trường '%s' vượt quá giới hạn tối đa (%s).", field, param))
		case "email":
			errors = append(errors, fmt.Sprintf("Trường '%s' không đúng định dạng email.", field))
		case "oneof":
			errors = append(errors, fmt.Sprintf("Trường '%s' phải là một trong các giá trị: %s.", field, strings.ReplaceAll(param, " ", ", ")))
		default:
			errors = append(errors, fmt.Sprintf("Trường '%s' không hợp lệ.", field))
		}
	}

	return fmt.Errorf(strings.Join(errors, " "))
}
