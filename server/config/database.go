package config

import (
	"fmt"
	"log"
	"os"

	"meowmark/models"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDatabase() {

	err := godotenv.Load()

	if err != nil {
		log.Fatal("Error loading .env file")
	}

	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=%s",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_SSLMODE"),
	)

	database, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})

	if err != nil {
		log.Fatal("Failed to connect database")
	}

	DB = database

	err = DB.AutoMigrate(
	&models.User{},
	&models.Book{},
	&models.Category{},
	&models.BookCategory{},
)

if err != nil {
	log.Fatal(err)
}

fmt.Println("Database Connected!")
fmt.Println("Migration Success!")
}