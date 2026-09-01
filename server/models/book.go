package models

import "gorm.io/gorm"

type Book struct {
	gorm.Model

	Title       string `gorm:"not null" json:"title"`
	Author      string `json:"author"`
	Description string `json:"description"`
	Review      string `json:"review"`

	CurrentPage int `json:"current_page"`
	TotalPage   int `json:"total_page"`

	ReadingStatus string `gorm:"default:'reading'" json:"reading_status"`

	IsFavorite bool `gorm:"default:false" json:"is_favorite"`

	Cover string `json:"cover"`
	PDF   string `json:"pdf"`

	UserID uint `json:"user_id"`
	User   User `json:"-"`

	Category string `json:"category"`
}