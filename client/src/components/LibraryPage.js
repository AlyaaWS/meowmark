import { useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "../config";
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

  const [customCategories, setCustomCategories] = useState(() => {
    const saved = localStorage.getItem("customCategories");
    return saved ? JSON.parse(saved) : [];
  });

  const dynamicCategories = Array.from(new Set(books.map(b => b.category).filter(Boolean)));
  const combinedCategories = Array.from(new Set([...dynamicCategories, ...customCategories]));
  const categories = ["All", "Favorite", ...combinedCategories];
  /* Isi kolom pencarian */

  const [search, setSearch] = useState("");

  const [showPopup, setShowPopup] = useState(false);
  const [showCategoryPopup, setShowCategoryPopup] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState("");

  const [selectedBook, setSelectedBook] = useState(null);


  useEffect(() => {
    if (onRefreshBooks) {
      onRefreshBooks();
    }
  }, [onRefreshBooks]);

  // Encode path agar spasi & karakter khusus di nama file tidak merusak URL
  const buildFileUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http") || path.startsWith("blob:") || path.startsWith("data:")) return path;
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    const parts = cleanPath.split("/");
    const encodedParts = parts.map((part) => encodeURIComponent(part));
    return `${API_BASE_URL}${encodedParts.join("/")}`;
  };

  const handleFavorite = async (bookId) => {
    const userId = Number(localStorage.getItem("userId"));
    if (!userId) return;

    try {
      const response = await fetch(`${API_BASE_URL}/books/${bookId}/favorite`, {
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
              {customCategories.includes(category) && (
                <span
                  style={{
                    marginLeft: "8px",
                    fontWeight: "bold",
                    color: "var(--color-brown)",
                    cursor: "pointer"
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    const updatedCustom = customCategories.filter(c => c !== category);
                    setCustomCategories(updatedCustom);
                    localStorage.setItem("customCategories", JSON.stringify(updatedCustom));
                    if (activeCategory === category) {
                      setActiveCategory("All");
                    }
                  }}
                >
                  &times;
                </span>
              )}
            </button>
          ))}
          <button
            type="button"
            className="category-button"
            onClick={() => setShowCategoryPopup(true)}
          >
            +
          </button>
        </div>
      </header>

      {/* MODAL TAMBAH KATEGORI */}
      {showCategoryPopup && (
        <div className="category-modal-overlay">
          <div className="category-modal-content">
            <h3 className="category-modal-title">Tambah Kategori Baru</h3>
            <input
              type="text"
              className="category-modal-input"
              value={newCategoryInput}
              onChange={(e) => setNewCategoryInput(e.target.value)}
              placeholder="Contoh: Manga, Resep..."
              autoFocus
            />
            <div className="category-modal-actions">
              <button
                className="category-modal-btn cancel"
                onClick={() => {
                  setShowCategoryPopup(false);
                  setNewCategoryInput("");
                }}
              >
                Batal
              </button>
              <button
                className="category-modal-btn add"
                onClick={() => {
                  if (newCategoryInput.trim() !== "") {
                    const trimmed = newCategoryInput.trim();
                    if (!categories.includes(trimmed)) {
                      const updatedCustom = [...customCategories, trimmed];
                      setCustomCategories(updatedCustom);
                      localStorage.setItem("customCategories", JSON.stringify(updatedCustom));
                      setActiveCategory(trimmed);
                    }
                  }
                  setShowCategoryPopup(false);
                  setNewCategoryInput("");
                }}
              >
                Tambah
              </button>
            </div>
          </div>
        </div>
      )}

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
                      src={buildFileUrl(book.cover)}
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
            const response = await fetch(`${API_BASE_URL}/books/${selectedBook.ID}`, {
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
