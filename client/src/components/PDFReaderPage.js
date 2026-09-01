import { useEffect, useState } from "react";

import "./PDFReaderPage.css";

import BottomNavbar from "./BottomNavbar";

import themeIcon from "../assets/theme.png";

import FlipBook from "./reader/FlipBook";

function PDFReaderPage({ selectedBook, onHome, onLibrary, onAddBook }) {
  /* =====================
     STATE
  ===================== */

  const [showThemeModal, setShowThemeModal] = useState(false);

  const [readerTheme, setReaderTheme] = useState("yellow");

  const [showControls, setShowControls] = useState(true);

  const totalPage = selectedBook?.total_page ?? selectedBook?.totalPage ?? 200;

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
     CONTROL
  ===================== */

  const wakeReader = () => {
    setShowControls(true);
  };

  /* =====================
     PAGE
  ===================== */

  const previousPage = (event) => {
    event.stopPropagation();

    wakeReader();

    if (currentPage > 1) {
      setCurrentPage((page) => page - 1);
    }
  };

  const nextPage = (event) => {
    event.stopPropagation();

    wakeReader();

    if (currentPage < totalPage) {
      setCurrentPage((page) => page + 1);
    }
  };

  return (
    <main className={`reader-page ${readerTheme}`} onClick={wakeReader}>
      {/* =====================
          HEADER
      ===================== */}

      {showControls && (
        <header className="reader-header">
          <button
            className="theme-button"
            onClick={(event) => {
              event.stopPropagation();

              wakeReader();

              setShowThemeModal(true);
            }}
          >
            <img src={themeIcon} alt="Theme" className="theme-icon" />
          </button>
        </header>
      )}

      {/* =====================
          PAGE NUMBER
      ===================== */}

      {showControls && (
        <div className="reader-page-number">
          {currentPage}/{totalPage}
        </div>
      )}

      {/* =====================
          PDF
      ===================== */}

      <section className="reader-content">
        {showControls && (
          <button className="reader-arrow left" onClick={previousPage}>
            ❮
          </button>
        )}

        <FlipBook
          currentPage={currentPage}
          totalPage={totalPage}
          setCurrentPage={setCurrentPage}
          wakeReader={wakeReader}
        />

        {showControls && (
          <button className="reader-arrow right" onClick={nextPage}>
            ❯
          </button>
        )}
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
              className={`theme-option ${
                readerTheme === "yellow" ? "active" : ""
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
              className={`theme-option ${
                readerTheme === "navy" ? "active" : ""
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
              className={`theme-option ${
                readerTheme === "sage" ? "active" : ""
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
