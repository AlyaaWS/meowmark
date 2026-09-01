import { useRef } from "react";

import "./HomePage.css";

import profileImage from "../assets/profil.png";

import BottomNavbar from "./BottomNavbar";
import BackToTop from "./BackToTop";

function HomePage({ userName, books = [], onHome, onLibrary, onAddBook, onProfile }) {
  /* Ref untuk membaca scroll daftar buku */

  const bookListRef = useRef(null);

  const displayBooks = books;

  return (
    <main className="home-page">
      {/* =====================
          HEADER
      ===================== */}

      <header className="home-header">
        <h1 className="home-greeting">
          Good Morning,
          <br />
          {userName}
        </h1>

        <button
          type="button"
          className="profile-button"
          aria-label="Buka profil"
          onClick={onProfile}
        >
          <img src={profileImage} alt="Profil" className="profile-image" />
        </button>
      </header>

      {/* =====================
          KONTEN
      ===================== */}

      <section className="home-content">
        {/* Judul daftar buku */}

        <div className="reading-heading">
          <h2 className="reading-label">Sedang dibaca</h2>

          <button type="button" className="view-all-button" onClick={onLibrary}>
            View all →
          </button>
        </div>

        {/* =====================
            DAFTAR BUKU
        ===================== */}

        <div ref={bookListRef} className="book-list">
          {displayBooks.length > 0 ? (
            displayBooks.map((book) => {
              const currentPg = book.current_page ?? book.currentPage ?? 0;
              const totalPg = book.total_page ?? book.totalPage ?? 100;
              const progress = totalPg > 0 ? (currentPg / totalPg) * 100 : 0;
              const bookId = book.ID || book.id;

              return (
                <article className="book-card" key={bookId}>
                  {/* Cover buku */}

                  <div className="book-cover">
                    {book.cover ? (
                      <img src={book.cover} alt={`Cover ${book.title}`} />
                    ) : (
                      <span>BOOK</span>
                    )}
                  </div>

                  {/* Informasi buku */}

                  <div className="book-information">
                    <h3 className="book-title">{book.title}</h3>

                    <p className="book-author">{book.author}</p>

                    <p className="book-page">
                      Halaman {currentPg}/{totalPg}
                    </p>

                    {/* Progress membaca */}

                    <div className="progress-track">
                      <div
                        className="progress-value"
                        style={{
                          width: `${progress}%`,
                        }}
                      />
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <div style={{ textAlign: "center", color: "#888", padding: "20px" }}>
              <p>Belum ada buku yang dibaca, meow 🐾</p>
            </div>
          )}
        </div>
      </section>

      {/* =====================
          BACK TO TOP
      ===================== */}

      <BackToTop scrollContainerRef={bookListRef} />

      {/* =====================
          NAVBAR
      ===================== */}

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

export default HomePage;
