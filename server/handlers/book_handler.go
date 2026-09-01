package handlers

import (
	"net/http"
	"strconv"
	"fmt"

	"meowmark/models"
	"meowmark/repository"

	"github.com/gin-gonic/gin"
)

func CreateBook(c *gin.Context) {
	var book models.Book

	if err := c.ShouldBindJSON(&book); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request",
		})
		return
	}

	fmt.Printf("%+v\n", book)

	if err := repository.CreateBook(&book); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create book",
		})
		return
	}

	c.JSON(http.StatusCreated, book)
}

func GetBooks(c *gin.Context) {
	userIDParam := c.Query("userId")

	userID, err := strconv.ParseUint(userIDParam, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid userId",
		})
		return
	}

	books, err := repository.GetBooksByUserID(uint(userID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to get books",
		})
		return
	}

	c.JSON(http.StatusOK, books)
}