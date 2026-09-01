package repository

import (
	"meowmark/config"
	"meowmark/models"
	"fmt"
	"strings"
)

func CreateUser(user *models.User) error {
	trimmedName := strings.TrimSpace(user.Name)
	var existingUser models.User
	err := config.DB.Where("LOWER(TRIM(name)) = LOWER(TRIM(?))", trimmedName).First(&existingUser).Error
	if err == nil && existingUser.ID > 0 {
		*user = existingUser
		return nil
	}

	user.Name = trimmedName
	return config.DB.Create(user).Error
}

func GetUserByID(id uint) (*models.User, error) {
	var user models.User

	result := config.DB.First(&user, id)

	fmt.Println("Rows:", result.RowsAffected)
	fmt.Println("Error:", result.Error)
	fmt.Printf("User: %+v\n", user)

	if result.Error != nil {
		return nil, result.Error
	}

	return &user, nil
}