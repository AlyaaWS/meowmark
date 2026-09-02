import { useEffect, useRef, useState } from "react";

import "./LibraryPage.css";
import BookPopup from "./BookPopup";

import profileImage from "../assets/profil.png";

import BottomNavbar from "./BottomNavbar";
import BackToTop from "./BackToTop";

function LibraryPage({
  userName,
  books = [],
  isLoading = false,
  onRefreshBooks,
  onHome,
  onLibrary,
  onAddBook,
  onEditBook,
  onBookDetail,
  onReadBook,
  onProfile,
}) {
  /* =====================
     REF
  ===================== */

  /*
  Ref digunakan untuk membaca posisi scroll
  pada daftar buku.

  Jadi Back to Top hanya mengembalikan
  daftar buku ke atas, bukan seluruh halaman.
  */

  const bookGridRef = useRef(null);

  /* =====================
     STATE
  ===================== */

  /* Kategori yang sedang aktif */

  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Favorite", "Fiction", "Non Fiction", "Comedy"];
  /* Isi kolom pencarian */

  const [search, setSearch] = useState("");

  const [showPopup, setShowPopup] = useState(false);

  const [selectedBook, setSelectedBook] = useState(null);


  useEffect(() => {
    if (onRefreshBooks) {
      onRefreshBooks();
    }
  }, [onRefreshBooks]);

  const handleFavorite = async (bookId) => {
    const userId = Number(localStorage.getItem("userId"));
    if (!userId) return;

    try {
      const response = await fetch(`http://localhost:8080/books/${bookId}/favorite`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: userId }),
      });

      if (!response.ok) {
        throw new Error("Failed to toggle favorite");
      }

      if (onRefreshBooks) {
        onRefreshBooks();
      }
    } catch (error) {
      console.error(error);
    }
  };

  /* =====================
     FILTER BUKU
  ===================== */

  const filteredBooks = books.filter((book) => {
    /*
      Menghapus spasi di awal/akhir,
      lalu mengubah pencarian
      menjadi huruf kecil.
      */

    const keyword = search.trim().toLowerCase();

    /*
      Cek apakah judul atau penulis
      sesuai dengan pencarian.
      */

    const matchesSearch =
      (book.title || "").toLowerCase().includes(keyword) ||
      (book.author || "").toLowerCase().includes(keyword);

    /*
      Jika kategori Favorite aktif:

      Tampilkan buku yang ID-nya
      ada di favoriteBooks.

      Jika kategori lain aktif:

      Cocokkan kategori buku.
      */

    const matchesCategory =
      activeCategory === "All"
        ? true
        : activeCategory === "Favorite"
          ? (book.is_favorite || book.isFavorite === true)
          : (book.category || "Non Fiction").trim().toLowerCase() === activeCategory.trim().toLowerCase();

    /*
      Buku ditampilkan jika sesuai
      pencarian DAN kategori.
      */

    return matchesSearch && matchesCategory;
  });

  return (
    <main className="library-page">
      {/* =====================
          HEADER
      ===================== */}

      <header className="library-header">
        {/* Judul dan profil */}

        <div className="library-title-row">
          <h1 className="library-title">{userName}'s Library</h1>

          <button
            type="button"
            className="library-profile-button"
            aria-label="Buka profil"
            onClick={onProfile}
          >
            <img
              src={profileImage}
              alt="Profil"
              className="library-profile-image"
            />
          </button>
        </div>

        {/* =====================
            KATEGORI
        ===================== */}

        <div className="category-scroll">
          {categories.map((category) => (
            <button
              type="button"
              key={category}
              className={
                activeCategory === category
                  ? "category-button active"
                  : "category-button"
              }
              onClick={() => {
                setActiveCategory(category);
              }}
            >
              {category}
            </button>
          ))}
        </div>
      </header>

      {/* =====================
          KONTEN
      ===================== */}

      <section className="library-content">
        {/* =====================
            SEARCH
        ===================== */}

        <div className="search-wrapper">
          <span className="search-icon" aria-hidden="true">
            ⌕
          </span>

          <input
            type="search"
            className="library-search"
            placeholder="Search...."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
            }}
          />
        </div>

        {/* =====================
            DAFTAR BUKU
        ===================== */}

        <div ref={bookGridRef} className="library-book-grid">
          {isLoading ? (
            <div className="empty-library">
              <p>Memuat buku, meow... 🐾</p>
            </div>
          ) : filteredBooks.length > 0 ? (
            filteredBooks.map((book) => (
              <article
                key={book.ID}
                className="library-book"
                onClick={() => {
                  setSelectedBook(book);
                  setShowPopup(true);
                }}
              >
                {/* COVER */}

                <div className="library-cover-wrapper">
                  {book.cover ? (
                    <img
                      src={book.cover}
                      alt={`Cover ${book.title}`}
                      className="library-cover"
                    />
                  ) : (
                    <div className="library-cover-placeholder">BOOK</div>
                  )}
                </div>

                {/* INFO */}

                <div className="library-book-information">
                  <h2 className="library-book-title">{book.title}</h2>

                  <p className="library-book-author">{book.author}</p>

                  <button
                    type="button"
                    className={
                      book.is_favorite === true
                        ? "favorite-button active"
                        : "favorite-button"
                    }
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();

                      console.log("FAVORITE DIKLIK:", book.ID, book.title);

                      handleFavorite(book.ID);
                    }}
                  >
                    {book.is_favorite === true ? "♥" : "♡"}
                  </button>
                </div>
              </article>
            ))
          ) : (
            <div className="empty-library">
              <p>Buku tidak ditemukan, meow 🐾</p>
            </div>
          )}
        </div>
      </section>

      {/* =====================
          BACK TO TOP
      ===================== */}

      <BackToTop scrollContainerRef={bookGridRef} />
      <BookPopup
        isOpen={showPopup}
        book={selectedBook}
        onClose={() => {
          setShowPopup(false);
        }}
        onRead={() => {
          setShowPopup(false);
          onReadBook(selectedBook);
        }}
        onDetail={() => {
          setShowPopup(false);
          onBookDetail(selectedBook);
        }}
        onEdit={() => {
          setShowPopup(false);
          onEditBook(selectedBook);
        }}
        onDelete={async () => {
          if (!selectedBook) return;
          try {
            const response = await fetch(`http://localhost:8080/books/${selectedBook.ID}`, {
              method: "DELETE",
            });
            if (!response.ok) throw new Error("Failed to delete book");
            if (onRefreshBooks) onRefreshBooks();
          } catch (error) {
            console.error(error);
          }
          setShowPopup(false);
        }}
      />

      {/* =====================
          NAVBAR
      ===================== */}

      <BottomNavbar
        activePage="library"
        onHome={onHome}
        onLibrary={onLibrary}
        onAddBook={onAddBook}
        onProfile={onProfile}
      />
    </main>
  );
}

export default LibraryPage;
