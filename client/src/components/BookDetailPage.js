import { useState } from "react";

import "./BookDetailPage.css";
import profileImage from "../assets/profil.png";
import BottomNavbar from "./BottomNavbar";
import editIcon from "../assets/edit.png";

function BookDetailPage({
  selectedBook,
  books,
  setSelectedBook,
  onHome,
  onLibrary,
  onAddBook,
  onProfile,
}) {
  const [rating, setRating] = useState(selectedBook?.rating || 4);

  const [review, setReview] = useState(selectedBook?.review || "");

  const [isEditing, setIsEditing] = useState(false);

  const [showToast, setShowToast] = useState(false);

  const renderStars = () => {
    return [...Array(5)].map((_, index) => {
      const value = index + 1;

      return (
        <span
          key={value}
          className={value <= rating ? "star active" : "star"}
          onClick={() => {
            setRating(value);
          }}
        >
          ★
        </span>
      );
    });
  };

  const handlePrevious = () => {
    if (!books || !selectedBook) return;
    const currentIndex = books.findIndex((b) => b.ID === selectedBook.ID);
    if (currentIndex > 0) {
      setSelectedBook(books[currentIndex - 1]);
      setRating(books[currentIndex - 1].rating || 4);
      setReview(books[currentIndex - 1].review || "");
    }
  };

  const handleNext = () => {
    if (!books || !selectedBook) return;
    const currentIndex = books.findIndex((b) => b.ID === selectedBook.ID);
    if (currentIndex < books.length - 1) {
      setSelectedBook(books[currentIndex + 1]);
      setRating(books[currentIndex + 1].rating || 4);
      setReview(books[currentIndex + 1].review || "");
    }
  };

  const handleReviewBlur = () => {
    setIsEditing(false);

    setShowToast(true);

    setTimeout(() => {
      setShowToast(false);
    }, 1500);
  };

  const handleReviewChange = (e) => {
    setReview(e.target.value);

    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  return (
    <main className="detail-page">
      <header className="detail-header">
        <h1 className="detail-title">
          Book
          <span> Details</span>
        </h1>

        <button className="detail-profile-button">
          <img
            src={profileImage}
            alt="Profil"
            className="detail-profile-image"
            onClick={onProfile}
          />
        </button>
      </header>

      <section className="detail-cover-section">
        <div className="detail-cover-wrapper">
          {selectedBook?.cover ? (
            <img
              src={selectedBook.cover}
              alt={selectedBook.title}
              className="detail-cover"
            />
          ) : (
            <div className="detail-cover-placeholder">BOOK</div>
          )}
        </div>
      </section>

      <section className="detail-card">
        <div className="detail-stars">{renderStars()}</div>

        <div className="detail-book-row">
          <button className="detail-arrow" onClick={handlePrevious}>
            ❮
          </button>

          <div className="detail-book-center">
            <h2 className="detail-book-title">{selectedBook?.title}</h2>

            <p className="detail-author">{selectedBook?.author}</p>
          </div>

          <button className="detail-arrow" onClick={handleNext}>
            ❯
          </button>
        </div>

        <p className="detail-description">
          {selectedBook?.description ||
            "A practical book that explains how psychology shapes our financial decisions. It offers timeless lessons on building wealth, avoiding common mistakes, and developing healthier habits."}
        </p>

        <div className="review-section">
          {isEditing ? (
            <textarea
              className="review-input"
              value={review}
              autoFocus
              placeholder="Write your review..."
              rows={5}
              onChange={handleReviewChange}
              onBlur={handleReviewBlur}
            />
          ) : (
            <div className="review-box">
              {review || "Belum ada review, meow 🐾"}
            </div>
          )}
        </div>
      </section>

      {!isEditing && (
        <button
          className="detail-edit-review"
          onClick={() => {
            setIsEditing(true);
          }}
        >
          <img src={editIcon} alt="Edit" className="detail-edit-icon" />
        </button>
      )}

      {showToast && <div className="toast">🐾 Purrfect! Review updated.</div>}

      <BottomNavbar
        activePage="home"
        onHome={onHome}
        onLibrary={onLibrary}
        onAddBook={onAddBook}
        onProfile={onProfile}
      />
    </main>
  );
}

export default BookDetailPage;
