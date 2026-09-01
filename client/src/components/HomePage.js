import { useRef } from "react";

import "./HomePage.css";

import profileImage from "../assets/profil.png";

import BottomNavbar from "./BottomNavbar";
import BackToTop from "./BackToTop";

function HomePage({ userName, onHome, onLibrary, onAddBook, onProfile }) {
  /* Ref untuk membaca scroll daftar buku */

  const bookListRef = useRef(null);

  /* Data buku sementara */

  const books = [
    {
      id: 1,
      title: "How Innovation Works",
      author: "William Br.",
      currentPage: 56,
      totalPage: 100,
      cover: null,
    },
    {
      id: 2,
      title: "Psychology of Money",
      author: "William Br.",
      currentPage: 20,
      totalPage: 100,
      cover: null,
    },
    {
      id: 3,
      title: "The Fine Print",
      author: "William Br.",
      currentPage: 89,
      totalPage: 100,
      cover: null,
    },
    {
      id: 4,
      title: "The Subtle Art",
      author: "William Br.",
      currentPage: 42,
      totalPage: 100,
      cover: null,
    },
  ];

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
          {books.map((book) => {
            const progress = (book.currentPage / book.totalPage) * 100;

            return (
              <article className="book-card" key={book.id}>
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
                    Halaman {book.currentPage}/{book.totalPage}
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
          })}
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
