package main

import (
	"time"

    "github.com/gin-contrib/cors"
	"meowmark/config"
	"meowmark/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	config.ConnectDatabase()

	router := gin.Default()
	router.Use(cors.New(cors.Config{
    AllowOrigins: []string{"http://localhost:3000"},
    AllowMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
    AllowHeaders: []string{"Origin", "Content-Type", "Accept"},
    AllowCredentials: true,
    MaxAge: 12 * time.Hour,
}))

	routes.UserRoutes(router)
	routes.BookRoutes(router)

	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
		})
	})

	router.Run(":8080")
}