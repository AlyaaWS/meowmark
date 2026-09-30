package main

import (
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"meowmark/config"
	"meowmark/routes"
)

func main() {
	config.ConnectDatabase()

	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"http://localhost:3000",
			"https://meowmark.vercel.app",
		},
		AllowMethods: []string{
			"GET",
			"POST",
			"PUT",
			"DELETE",
			"OPTIONS",
			"PATCH",
		},
		AllowHeaders: []string{
			"Origin",
			"Content-Type",
			"Accept",
			"Range",
		},
		ExposeHeaders: []string{
			"Content-Length",
			"Content-Range",
			"Accept-Ranges",
		},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	router.Static("/uploads", "./uploads")

	// API routes
	routes.UserRoutes(router)
	routes.BookRoutes(router)

	// Root endpoint
	router.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"message": "MeowMark API is running",
		})
	})

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
		})
	})

	// Use PORT provided by hosting platform
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Explicitly listen on all network interfaces
	address := "0.0.0.0:" + port

	println("Starting MeowMark API on " + address + " with CORS for Vercel")

	if err := router.Run(address); err != nil {
		panic(err)
	}
}
