package handlers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"meowmark/models"
	"meowmark/repository"

	"github.com/gin-gonic/gin"
)

func CreateBook(c *gin.Context) {
	var book models.Book

	// Ambil data text dari form
	book.Title = c.PostForm("title")
	book.Author = c.PostForm("author")
	book.Description = c.PostForm("description")
	book.Review = c.PostForm("review")
	book.Category = c.PostForm("category")
	book.ReadingStatus = c.PostForm("reading_status")

	// Convert angka
	currentPage, err := strconv.Atoi(c.PostForm("current_page"))
	if err != nil {
		currentPage = 0
	}

	totalPage, err := strconv.Atoi(c.PostForm("total_page"))
	if err != nil {
		totalPage = 0
	}

	userID, err := strconv.ParseUint(c.PostForm("user_id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid user_id",
		})
		return
	}

	book.CurrentPage = currentPage
	book.TotalPage = totalPage
	book.UserID = uint(userID)

	// =========================
	// UPLOAD PDF
	// =========================

	file, err := c.FormFile("pdf")

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "PDF file is required",
		})
		return
	}

	// Pastikan folder uploads tersedia
	uploadDir := "uploads"

	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create upload directory",
		})
		return
	}

	// Buat nama file unik (sanitize: ganti spasi dengan underscore)
	sanitizedPDF := sanitizeFilename(file.Filename)
	pdfFileName := fmt.Sprintf(
		"%d_%s",
		time.Now().UnixNano(),
		sanitizedPDF,
	)

	pdfFilePath := filepath.Join(uploadDir, pdfFileName)

	// Simpan file
	if err := c.SaveUploadedFile(file, pdfFilePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to save PDF: " + err.Error(),
		})
		return
	}

	// Simpan path PDF ke database
	book.PDF = "/" + filepath.ToSlash(pdfFilePath)

	// =========================
	// UPLOAD COVER (opsional)
	// =========================

	coverFile, coverErr := c.FormFile("cover")
	if coverErr == nil && coverFile != nil {
		sanitizedCover := sanitizeFilename(coverFile.Filename)
		coverFileName := fmt.Sprintf(
			"%d_%s",
			time.Now().UnixNano(),
			sanitizedCover,
		)
		coverFilePath := filepath.Join(uploadDir, coverFileName)

		if err := c.SaveUploadedFile(coverFile, coverFilePath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to save cover image: " + err.Error(),
			})
			return
		}
		book.Cover = "/" + filepath.ToSlash(coverFilePath)
	}

	// =========================
	// SAVE DATABASE
	// =========================

	if err := repository.CreateBook(&book); err != nil {
		// Kalau database gagal, hapus file yang tadi sudah di-upload
		os.Remove(pdfFilePath)
		if book.Cover != "" {
			coverPath := "." + book.Cover
			os.Remove(coverPath)
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create book",
		})
		return
	}

	c.JSON(http.StatusCreated, book)
}

// sanitizeFilename mengganti spasi dan karakter bermasalah dengan underscore
func sanitizeFilename(name string) string {
	result := make([]byte, len(name))
	for i := 0; i < len(name); i++ {
		c := name[i]
		if c == ' ' || c == '(' || c == ')' || c == '#' || c == '?' || c == '&' || c == '%' {
			result[i] = '_'
		} else {
			result[i] = c
		}
	}
	return string(result)
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

func UpdateBook(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid book ID"})
		return
	}

	// Cek apakah konten berupa JSON (dari request lama/klien lain) atau multipart
	contentType := c.GetHeader("Content-Type")

	var updatedBook models.Book

	if contentType == "application/json" {
		if err := c.ShouldBindJSON(&updatedBook); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON request"})
			return
		}
		updatedBook.ID = uint(id)
		if err := repository.UpdateBook(&updatedBook); err != nil {
			fmt.Println("GORM Update Error:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update book", "details": err.Error()})
			return
		}
		c.JSON(http.StatusOK, updatedBook)
		return
	}

	// Handle multipart/form-data
	updatedBook.Title = c.PostForm("title")
	updatedBook.Author = c.PostForm("author")
	updatedBook.Description = c.PostForm("description")
	updatedBook.Review = c.PostForm("review")
	updatedBook.Category = c.PostForm("category")
	
	if cp, err := strconv.Atoi(c.PostForm("current_page")); err == nil {
		updatedBook.CurrentPage = cp
	}
	if tp, err := strconv.Atoi(c.PostForm("total_page")); err == nil {
		updatedBook.TotalPage = tp
	}
	
	userID, _ := strconv.ParseUint(c.PostForm("user_id"), 10, 64)
	updatedBook.UserID = uint(userID)
	updatedBook.ID = uint(id)

	uploadDir := "uploads"
	os.MkdirAll(uploadDir, 0755)

	// Update PDF if new file provided
	if pdfFile, err := c.FormFile("pdf"); err == nil && pdfFile != nil {
		pdfFileName := fmt.Sprintf("%d_%s", time.Now().UnixNano(), sanitizeFilename(pdfFile.Filename))
		pdfFilePath := filepath.Join(uploadDir, pdfFileName)
		if err := c.SaveUploadedFile(pdfFile, pdfFilePath); err == nil {
			updatedBook.PDF = "/" + filepath.ToSlash(pdfFilePath)
		}
	} else {
		updatedBook.PDF = c.PostForm("existing_pdf")
	}

	// Update Cover if new file provided
	if coverFile, err := c.FormFile("cover"); err == nil && coverFile != nil {
		coverFileName := fmt.Sprintf("%d_%s", time.Now().UnixNano(), sanitizeFilename(coverFile.Filename))
		coverFilePath := filepath.Join(uploadDir, coverFileName)
		if err := c.SaveUploadedFile(coverFile, coverFilePath); err == nil {
			updatedBook.Cover = "/" + filepath.ToSlash(coverFilePath)
		}
	} else {
		updatedBook.Cover = c.PostForm("existing_cover")
	}

	if err := repository.UpdateBook(&updatedBook); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update book"})
		return
	}

	c.JSON(http.StatusOK, updatedBook)
}

func ToggleFavorite(c *gin.Context) {
	idParam := c.Param("id")
	bookID, err := strconv.ParseUint(idParam, 10, 64)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid book ID",
		})
		return
	}

	var req struct {
		UserID uint `json:"user_id"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request",
			"detail": err.Error(),
		})
		return
	}

	fmt.Printf("Toggle Favorite - BookID: %d, UserID: %d\n", bookID, req.UserID)

	if req.UserID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "user_id is required",
		})
		return
	}

	isFavorite, err := repository.ToggleFavorite(uint(bookID), req.UserID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to toggle favorite",
			"detail": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":     "Favorite toggled",
		"is_favorite": isFavorite,
	})
}

func DeleteBook(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid book ID"})
		return
	}

	if err := repository.DeleteBook(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete book"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Book deleted successfully"})
}