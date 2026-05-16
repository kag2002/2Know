package utils

import (
	"bytes"
	"io"

	"github.com/ledongthuc/pdf"
)

// ExtractTextFromPDF reads a PDF from an io.ReaderAt and returns its text content
func ExtractTextFromPDF(r io.ReaderAt, size int64) (string, error) {
	reader, err := pdf.NewReader(r, size)
	if err != nil {
		return "", err
	}

	var buf bytes.Buffer
	b, err := reader.GetPlainText()
	if err != nil {
		return "", err
	}

	_, err = buf.ReadFrom(b)
	if err != nil {
		return "", err
	}

	return buf.String(), nil
}
