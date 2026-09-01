package routes

import (
	"meowmark/handlers"

	"github.com/gin-gonic/gin"
)

func UserRoutes(router *gin.Engine) {
	router.POST("/users", handlers.CreateUser)
	router.GET("/users/:id", handlers.GetUser)
}