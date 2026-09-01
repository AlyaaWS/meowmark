package repository

import (
	"fmt"

	"meowmark/config"
	"meowmark/models"
)

func CreateBook(book *models.Book) error {
	err := config.DB.Create(book).Error

	if err != nil {
		fmt.Println("GORM Error:", err)
	}

	return err
}

func GetBooksByUserID(userID uint) ([]models.Book, error) {
	var books []models.Book

	err := config.DB.
		Where("user_id = ?", userID).
		Find(&books).Error

	return books, err
}