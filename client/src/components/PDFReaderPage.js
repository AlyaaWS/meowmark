import { useEffect, useState } from "react";
import { API_BASE_URL } from "../config";
import "./PDFReaderPage.css";

import BottomNavbar from "./BottomNavbar";

import themeIcon from "../assets/theme.png";

import FlipBook from "./reader/FlipBook";

function PDFReaderPage({ selectedBook, onHome, onLibrary, onAddBook, onUpdateProgress }) {
  /* =====================
     STATE
  ===================== */

  const [showThemeModal, setShowThemeModal] = useState(false);

  const [readerTheme, setReaderTheme] = useState("yellow");

  const [showControls, setShowControls] = useState(true);



  const [currentPage, setCurrentPage] = useState(
    selectedBook?.current_page ?? selectedBook?.currentPage ?? 1
  );

  /* =====================
     AUTO HIDE
  ===================== */

  useEffect(() => {
    if (!showControls) return;

    const timer = setTimeout(() => {
      setShowControls(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [showControls]);

  /* =====================
     SYNC PROGRESS
  ===================== */

  useEffect(() => {
    if (!selectedBook) return;

    const initialPage = selectedBook?.current_page ?? selectedBook?.currentPage ?? 1;
    if (currentPage === initialPage) return;

    const timer = setTimeout(async () => {
      try {
        const bookId = selectedBook.ID || selectedBook.id;
        if (!bookId) return;

        const updatedData = { 
          ...selectedBook, 
          current_page: currentPage,
          user_id: Number(localStorage.getItem("userId")) || selectedBook.user_id
        };
        
        await fetch(`${API_BASE_URL}/books/${bookId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedData),
        });

        if (onUpdateProgress) {
          onUpdateProgress(bookId, currentPage);
        }
      } catch (err) {
        console.error("Gagal sinkronisasi progress:", err);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [currentPage, selectedBook, onUpdateProgress]);

  /* =====================
     CONTROL
  ===================== */

  const wakeReader = () => {
    setShowControls(true);
  };

  console.log("SELECTED BOOK:", selectedBook);
  console.log("PDF PATH:", selectedBook?.pdf);

  // Encode PDF URL agar spasi & karakter khusus tidak merusak URL
  const buildFileUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http") || path.startsWith("blob:") || path.startsWith("data:")) return path;
    // path contoh: /uploads/1234567890_namafile.pdf
    const parts = path.split("/");
    const encodedParts = parts.map((part) => encodeURIComponent(part));
    return `${API_BASE_URL}${encodedParts.join("/")}`;
  };

  const pdfUrl = buildFileUrl(selectedBook?.pdf);

  console.log("PDF URL:", pdfUrl);


  const cycleTheme = (event) => {
    event.stopPropagation();
    wakeReader();
    setShowThemeModal(true);
  };

  return (
    <main className={`reader-page ${readerTheme}`} onClick={wakeReader}>
      {/* =====================
          PDF
      ===================== */}

      <section className="reader-content">
        <FlipBook
          pdfUrl={pdfUrl}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          wakeReader={wakeReader}
          theme={readerTheme}
          showControls={showControls}
          themeIcon={themeIcon}
          onThemeClick={cycleTheme}
        />
      </section>

      {/* =====================
          THEME MODAL
      ===================== */}

      {showThemeModal && (
        <div
          className="theme-overlay"
          onClick={() => {
            setShowThemeModal(false);
            wakeReader();
          }}
        >
          <div
            className="theme-modal"
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <h2 className="theme-title">
              Choose the
              <br />
              background color
            </h2>

            <button
              className={`theme-option ${readerTheme === "yellow" ? "active" : ""
                }`}
              onClick={() => {
                setReaderTheme("yellow");
                setShowThemeModal(false);
                wakeReader();
              }}
            >
              Yellow
            </button>

            <button
              className={`theme-option ${readerTheme === "navy" ? "active" : ""
                }`}
              onClick={() => {
                setReaderTheme("navy");
                setShowThemeModal(false);
                wakeReader();
              }}
            >
              Navy
            </button>

            <button
              className={`theme-option ${readerTheme === "sage" ? "active" : ""
                }`}
              onClick={() => {
                setReaderTheme("sage");
                setShowThemeModal(false);
                wakeReader();
              }}
            >
              Sage
            </button>
          </div>
        </div>
      )}

      {/* =====================
          NAVBAR
      ===================== */}

      {showControls && (
        <BottomNavbar
          activePage="library"
          onHome={onHome}
          onLibrary={onLibrary}
          onAddBook={onAddBook}
        />
      )}
    </main>
  );
}

export default PDFReaderPage;
