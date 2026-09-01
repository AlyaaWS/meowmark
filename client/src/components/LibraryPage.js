import { useEffect, useRef, useState } from "react";

import "./LibraryPage.css";
import BookPopup from "./BookPopup";

import profileImage from "../assets/profil.png";

import BottomNavbar from "./BottomNavbar";
import BackToTop from "./BackToTop";

function LibraryPage({
  userName,
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

  const [favoriteBooks, setFavoriteBooks] = useState([]);

  const [books, setBooks] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const userId = localStorage.getItem("userId");

        console.log("UserID:", userId);

        const response = await fetch(
          `http://localhost:8080/books?userId=${userId}`,
          { cache: "no-store" }
        );

        console.log("Status:", response.status);

        const data = await response.json();

        console.log("DATA DARI BACKEND:", data);

        setBooks(data || []);
      } catch (error) {
        console.error(error);
      }
    };

    fetchBooks();
  }, []);

  const handleFavorite = (bookId) => {
    setFavoriteBooks((currentFavorites) => {
      /*
        Cek apakah ID buku sudah ada
        di dalam daftar Favorite.
        */

      const isAlreadyFavorite = currentFavorites.includes(bookId);

      /*
        Kalau sudah menjadi Favorite,
        hapus ID buku itu saja.
        */

      if (isAlreadyFavorite) {
        return currentFavorites.filter((id) => id !== bookId);
      }

      /*
        Kalau belum Favorite:

        ...currentFavorites
        mempertahankan semua ID lama.

        bookId
        menambahkan ID baru.
        */

      return [...currentFavorites, bookId];
    });
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
          ? favoriteBooks.includes(book.ID)
          : book.category === activeCategory;

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
          {filteredBooks.map((book) => (
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
                    favoriteBooks.includes(book.ID)
                      ? "favorite-button active"
                      : "favorite-button"
                  }
                  aria-label={
                    favoriteBooks.includes(book.ID)
                      ? `Hapus ${book.title} dari Favorite`
                      : `Tambahkan ${book.title} ke Favorite`
                  }
                  onClick={(event) => {
                    event.stopPropagation();

                    handleFavorite(book.ID);
                  }}
                >
                  {favoriteBooks.includes(book.ID) ? "♥" : "♡"}
                </button>
              </div>
            </article>
          ))}

          {/* =====================
              HASIL KOSONG
          ===================== */}

          {filteredBooks.length === 0 && (
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
          onReadBook();
        }}
        onDetail={() => {
          setShowPopup(false);
          onBookDetail(selectedBook);
        }}
        onEdit={() => {
          setShowPopup(false);
          onEditBook(selectedBook);
        }}
        onDelete={() => {
          console.log("Delete Book");
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
