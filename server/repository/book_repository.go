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
	books := make([]models.Book, 0)

	err := config.DB.
		Where("user_id = ?", userID).
		Find(&books).Error

	return books, err
}

func UpdateBook(book *models.Book) error {
	err := config.DB.Save(book).Error
	if err != nil {
		fmt.Println("GORM Error (UpdateBook):", err)
	}
	return err
}

func GetBookByID(id uint) (*models.Book, error) {
	var book models.Book
	err := config.DB.First(&book, id).Error
	return &book, err
}

func ToggleFavorite(bookID uint, userID uint) (bool, error) {
	var book models.Book
	err := config.DB.Where("id = ? AND user_id = ?", bookID, userID).First(&book).Error
	if err != nil {
		return false, err
	}

	book.IsFavorite = !book.IsFavorite
	err = config.DB.Save(&book).Error
	return book.IsFavorite, err
}

func DeleteBook(id uint) error {
	err := config.DB.Delete(&models.Book{}, id).Error
	if err != nil {
		fmt.Println("GORM Error (DeleteBook):", err)
	}
	return err
}