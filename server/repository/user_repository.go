package repository

import (
	"meowmark/config"
	"meowmark/models"
	"fmt"
)

func CreateUser(user *models.User) error {
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