package config

import (
	"fmt"
	"log"
	"os"

	"backend/internal/model"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func ConnectDB() {
	host := os.Getenv("DB_HOST")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbname := os.Getenv("DB_NAME")
	port := os.Getenv("DB_PORT")
	sslmode := os.Getenv("DB_SSLMODE")

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=%s",
		host, user, password, dbname, port, sslmode)

	// SECURITY: Use Warn level to prevent raw SQL (containing PII) from leaking to stdout in Production
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Warn),
	})

	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Ensure uuid-ossp extension exists before migrating tables
	if err := db.Exec(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`).Error; err != nil {
		log.Fatal("Failed to create extension uuid-ossp:", err)
	}

	err = db.AutoMigrate(
		&model.User{},
		&model.Quiz{},
		&model.Question{},
		&model.QuizQuestion{},
		&model.Class{},
		&model.Student{},
		&model.TestResult{},
		&model.Note{},
		&model.Tag{},
		&model.Rubric{},
		&model.ShareLink{},
		&model.OmrBatch{},
		&model.Material{},
	)
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	sqlDB, err := db.DB()
	if err == nil {
		sqlDB.SetMaxIdleConns(10)
		sqlDB.SetMaxOpenConns(100)
		sqlDB.SetConnMaxLifetime(time.Hour)
		log.Println("Database connection pool configured: MaxOpen=100, MaxIdle=10")
	}

	DB = db
	log.Println("Connected to PostgreSQL successfully")
}
