package routes

import (
	"meowmark/handlers"

	"github.com/gin-gonic/gin"
)

func BookRoutes(router *gin.Engine) {
	router.POST("/books", handlers.CreateBook)
	router.GET("/books", handlers.GetBooks)
	router.PUT("/books/:id", handlers.UpdateBook)
	router.PATCH("/books/:id/favorite", handlers.ToggleFavorite)
	router.DELETE("/books/:id", handlers.DeleteBook)
}