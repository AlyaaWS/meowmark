package routes

import (
	"meowmark/handlers"

	"github.com/gin-gonic/gin"
)

func BookRoutes(router *gin.Engine) {
	router.POST("/books", handlers.CreateBook)
	router.GET("/books", handlers.GetBooks)
}