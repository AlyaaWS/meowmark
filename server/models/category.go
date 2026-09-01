package models

import "gorm.io/gorm"

type Category struct {
	gorm.Model

	Name string `gorm:"size:100;not null"`

	UserID uint
	User   User

	Books []Book `gorm:"many2many:book_categories;"`
}