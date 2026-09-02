import { useEffect, useState } from "react";
import { pdfjs } from "react-pdf";

import "./FlipBook.css";

// =====================================================
// PDF.js WORKER
// =====================================================

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;


// =====================================================
// FLIP BOOK / READER
// =====================================================

function FlipBook({
  pdfUrl,
  currentPage,
  setCurrentPage,
  wakeReader,
  theme = "yellow",
  showControls = true,
  themeIcon,
  onThemeClick,
}) {

  // ===================================================
  // STATE
  // ===================================================

  const [numPages, setNumPages] = useState(null);

  const [pageText, setPageText] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(false);

  const [fontSize, setFontSize] = useState(18);


  // ===================================================
  // LOAD PDF
  // ===================================================

  useEffect(() => {

    if (!pdfUrl) {
      return;
    }

    let cancelled = false;


    const loadPDF = async () => {

      try {

        setLoading(true);
        setError(false);

        console.log("Loading PDF:", pdfUrl);


        // =============================================
        // LOAD PDF
        // =============================================

        const loadingTask = pdfjs.getDocument({
          url: pdfUrl,
        });


        const pdf = await loadingTask.promise;


        if (cancelled) {
          return;
        }


        console.log("PDF berhasil dibaca");
        console.log("Total halaman:", pdf.numPages);


        setNumPages(pdf.numPages);


        // =============================================
        // VALIDASI HALAMAN
        // =============================================

        if (
          currentPage < 1 ||
          currentPage > pdf.numPages
        ) {
          if (!cancelled) {
            setCurrentPage(1);
          }

          return;
        }


        // =============================================
        // AMBIL HALAMAN AKTIF
        // =============================================

        const page = await pdf.getPage(currentPage);


        if (cancelled) {
          return;
        }


        // =============================================
        // AMBIL TEXT CONTENT
        // =============================================

        const textContent =
          await page.getTextContent();


        if (cancelled) {
          return;
        }


        console.log(
          "Text items:",
          textContent.items.length
        );


        // =============================================
        // UBAH TEXT ITEM → PARAGRAPH
        // =============================================

        const paragraphs =
          buildParagraphs(textContent.items);


        if (cancelled) {
          return;
        }


        setPageText(paragraphs);

        setLoading(false);

      } catch (err) {

        console.error(
          "PDF gagal dibaca:",
          err
        );


        if (!cancelled) {

          setError(true);

          setLoading(false);

        }

      }

    };


    loadPDF();


    return () => {

      cancelled = true;

    };

  }, [
    pdfUrl,
    currentPage,
    setCurrentPage,
  ]);


  // ===================================================
  // NEXT PAGE
  // ===================================================

  const nextPage = () => {

    if (!numPages) {
      return;
    }


    if (currentPage >= numPages) {
      return;
    }


    setCurrentPage(
      (page) => page + 1
    );


    wakeReader?.();


    // Scroll area reader ke atas
    requestAnimationFrame(() => {

      const readingArea =
        document.querySelector(
          ".reading-area"
        );


      if (readingArea) {

        readingArea.scrollTo({
          top: 0,
          behavior: "smooth",
        });

      }

    });

  };


  // ===================================================
  // PREVIOUS PAGE
  // ===================================================

  const previousPage = () => {

    if (currentPage <= 1) {
      return;
    }


    setCurrentPage(
      (page) => page - 1
    );


    wakeReader?.();


    requestAnimationFrame(() => {

      const readingArea =
        document.querySelector(
          ".reading-area"
        );


      if (readingArea) {

        readingArea.scrollTo({
          top: 0,
          behavior: "smooth",
        });

      }

    });

  };


  // ===================================================
  // KEYBOARD NAVIGATION
  // ===================================================

  useEffect(() => {

    const handleKeyboard = (event) => {

      if (event.key === "ArrowRight") {

        nextPage();

      }


      if (event.key === "ArrowLeft") {

        previousPage();

      }

    };


    window.addEventListener(
      "keydown",
      handleKeyboard
    );


    return () => {

      window.removeEventListener(
        "keydown",
        handleKeyboard
      );

    };

  });


  // ===================================================
  // FONT SIZE
  // ===================================================

  const increaseFont = () => {

    setFontSize(
      (size) =>
        Math.min(
          size + 2,
          32
        )
    );

  };


  const decreaseFont = () => {

    setFontSize(
      (size) =>
        Math.max(
          size - 2,
          14
        )
    );

  };


  // ===================================================
  // ERROR: PDF URL
  // ===================================================

  if (!pdfUrl) {

    return (
      <div className="pdf-error">

        <p>
          PDF tidak ditemukan.
        </p>

      </div>
    );

  }


  // ===================================================
  // ERROR: LOAD PDF
  // ===================================================

  if (error) {

    return (
      <div className="pdf-error">

        <p>
          Failed to load PDF file.
        </p>

        <small>

          Pastikan PDF bisa dibuka dari:

          <br />

          {pdfUrl}

        </small>

      </div>
    );

  }


  // ===================================================
  // READER
  // ===================================================

  return (

    <div
      className={`reader-container theme-${theme}`}
    >


      {/* =================================================
          TOP HEADER
      ================================================= */}

      <header className="reader-header">

        <div className="reader-header-left">
          {themeIcon && onThemeClick && (
            <button
              type="button"
              className="reader-theme-button"
              onClick={(e) => { e.stopPropagation(); onThemeClick(e); }}
              aria-label="Ganti tema"
            >
              <img src={themeIcon} alt="Theme" className="reader-theme-icon" />
            </button>
          )}
        </div>


        <div className="reader-page-number">

          {numPages
            ? `${currentPage} / ${numPages}`
            : "..."}

        </div>


        <div className="reader-header-right">

          {/* Theme button tetap bisa dipakai
              dari parent / navbar */}

        </div>

      </header>


      {/* =================================================
          READING AREA
      ================================================= */}

      <main className="reading-area">


        {loading ? (

          <div className="reader-loading">

            <div className="loading-spinner" />

            <span>
              Loading PDF...
            </span>

          </div>

        ) : (

          <article
            className="reading-page"
            style={{
              fontSize: `${fontSize}px`,
            }}
          >


            {/* ============================================
                TEXT
            ============================================ */}

            {pageText.length === 0 ? (

              <p className="empty-text">

                Tidak ada teks yang dapat
                dibaca pada halaman ini.

              </p>

            ) : (

              pageText.map(
                (paragraph, index) => {

                  // ======================================
                  // HEADING
                  // ======================================

                  if (
                    paragraph.type ===
                    "heading"
                  ) {

                    return (

                      <h2
                        key={index}
                        className="reader-heading"
                      >

                        {paragraph.text}

                      </h2>

                    );

                  }


                  // ======================================
                  // PARAGRAPH
                  // ======================================

                  return (

                    <p
                      key={index}
                      className={
                        `reader-paragraph ${paragraph.indent
                          ? "has-indent"
                          : ""
                        }`
                      }
                    >

                      {paragraph.text}

                    </p>

                  );

                }
              )

            )}

          </article>

        )}

      </main>


      {/* =================================================
          PAGE NAVIGATION
          INI SATU-SATUNYA PANAH
      ================================================= */}

      {showControls && (
        <button
          type="button"
          className="reader-page-button reader-page-button-left"
          onClick={previousPage}
          disabled={currentPage <= 1}
          aria-label="Halaman sebelumnya"
        >
          ‹
        </button>
      )}


      {showControls && (
        <button
          type="button"
          className="reader-page-button reader-page-button-right"
          onClick={nextPage}
          disabled={
            !numPages ||
            currentPage >= numPages
          }
          aria-label="Halaman berikutnya"
        >
          ›
        </button>
      )}


      {/* =================================================
          FONT CONTROL
      ================================================= */}

      {showControls && (
        <div className="reader-controls">

          <button
            type="button"
            className="font-button"
            onClick={decreaseFont}
            disabled={fontSize <= 14}
            aria-label="Perkecil tulisan"
          >
            −
          </button>

          <span className="font-size">
            {fontSize}
          </span>

          <button
            type="button"
            className="font-button"
            onClick={increaseFont}
            disabled={fontSize >= 32}
            aria-label="Perbesar tulisan"
          >
            +
          </button>

        </div>
      )}


    </div>

  );

}


// =====================================================
// PDF TEXT → PARAGRAPH
// =====================================================
//
// PDF sebenarnya menyimpan text berdasarkan posisi.
//
// Kita kelompokkan:
//
// text item
//      ↓
// baris
//      ↓
// paragraf
//
// Jadi bukan sekadar mengambil semua text
// lalu ditumpuk.
// =====================================================

function buildParagraphs(items) {

  if (
    !items ||
    items.length === 0
  ) {

    return [];

  }


  // ===================================================
  // AMBIL TEXT ITEM YANG VALID
  // ===================================================

  const validItems = items

    .filter((item) => {

      return (
        item.str &&
        item.str.trim() !== ""
      );

    })

    .map((item) => {

      const transform =
        item.transform || [];


      return {

        text: item.str,

        x:
          transform[4] || 0,

        y:
          transform[5] || 0,

        height:
          Math.abs(
            transform[3]
          ) || 10,

        width:
          item.width || 0,

      };

    });


  if (
    validItems.length === 0
  ) {

    return [];

  }


  // ===================================================
  // 1. KELOMPOKKAN MENJADI BARIS
  // ===================================================

  const lines = [];


  validItems.forEach((item) => {

    let line =
      lines.find((existingLine) => {

        return (
          Math.abs(
            existingLine.y -
            item.y
          ) <
          Math.max(
            item.height,
            8
          )
        );

      });


    if (!line) {

      line = {

        y: item.y,

        items: [],

      };


      lines.push(line);

    }


    line.items.push(item);

  });


  // ===================================================
  // URUTKAN ATAS → BAWAH
  // ===================================================

  lines.sort(
    (a, b) =>
      b.y - a.y
  );


  // ===================================================
  // URUTKAN ITEM KIRI → KANAN
  // ===================================================

  lines.forEach((line) => {

    line.items.sort(
      (a, b) =>
        a.x - b.x
    );

  });


  // ===================================================
  // 2. GABUNGKAN ITEM MENJADI BARIS
  // ===================================================

  const normalizedLines =
    lines

      .map((line) => {

        let text = "";


        line.items.forEach(
          (item, index) => {

            const previous =
              line.items[
              index - 1
              ];


            // Item pertama
            if (!previous) {

              text += item.text;

              return;

            }


            // =========================================
            // HITUNG JARAK HORIZONTAL
            // =========================================

            const previousEnd =
              previous.x +
              previous.width;


            const gap =
              item.x -
              previousEnd;


            // =========================================
            // KALAU ADA GAP,
            // TAMBAHKAN SPASI
            // =========================================

            if (
              gap >
              Math.max(
                previous.height *
                0.15,
                2
              )
            ) {

              text += " ";

            }


            text += item.text;

          }
        );


        return {

          text:
            cleanText(text),

          x:
            line.items[0]?.x ||
            0,

          y:
            line.y,

          height:
            line.items[0]?.height ||
            10,

        };

      })

      .filter(
        (line) =>
          line.text
      );


  // ===================================================
  // 3. KELOMPOKKAN MENJADI PARAGRAF
  // ===================================================

  const paragraphs = [];


  let currentParagraph =
    null;


  normalizedLines.forEach(
    (line, index) => {

      const previous =
        normalizedLines[
        index - 1
        ];


      // ===============================================
      // JARAK VERTIKAL
      // ===============================================

      const verticalGap =
        previous
          ? Math.abs(
            previous.y -
            line.y
          )
          : 0;


      // ===============================================
      // GAP BESAR = PARAGRAF BARU
      // ===============================================

      const isLargeGap =
        previous &&
        verticalGap >
        previous.height *
        1.8;


      // ===============================================
      // DETEKSI HEADING
      // ===============================================

      const isHeading =
        isHeadingText(
          line.text
        );


      // ===============================================
      // HEADING
      // ===============================================

      if (isHeading) {

        if (currentParagraph) {

          paragraphs.push({

            type:
              "paragraph",

            text:
              currentParagraph.text,

            indent:
              currentParagraph.indent,

          });


          currentParagraph =
            null;

        }


        paragraphs.push({

          type:
            "heading",

          text:
            line.text,

        });


        return;

      }


      // ===============================================
      // PARAGRAF BARU
      // ===============================================

      if (
        !currentParagraph ||
        isLargeGap
      ) {

        if (currentParagraph) {

          paragraphs.push({

            type:
              "paragraph",

            text:
              currentParagraph.text,

            indent:
              currentParagraph.indent,

          });

        }


        currentParagraph = {

          text:
            line.text,

          // Deteksi apakah awal baris
          // lebih menjorok dibanding
          // margin normal PDF.
          indent:
            line.x > 30,

        };


        return;

      }


      // ===============================================
      // LANJUTAN PARAGRAF
      // ===============================================

      currentParagraph.text +=
        " " +
        line.text;

    }
  );


  // ===================================================
  // PARAGRAF TERAKHIR
  // ===================================================

  if (currentParagraph) {

    paragraphs.push({

      type:
        "paragraph",

      text:
        currentParagraph.text,

      indent:
        currentParagraph.indent,

    });

  }


  return paragraphs;

}


// =====================================================
// CLEAN TEXT
// =====================================================

function cleanText(text) {

  return text

    // Gabungkan whitespace
    .replace(
      /\s+/g,
      " "
    )

    // Hilangkan spasi sebelum tanda baca
    .replace(
      /\s+([,.!?;:])/g,
      "$1"
    )

    .trim();

}


// =====================================================
// HEADING DETECTOR
// =====================================================

function isHeadingText(text) {

  const normalized =
    text.trim();


  if (!normalized) {

    return false;

  }


  // ===================================================
  // BAB I
  // BAB II
  // BAB III
  // ===================================================

  if (
    /^BAB\s+[IVXLCDM0-9]+$/i.test(
      normalized
    )
  ) {

    return true;

  }


  // ===================================================
  // CHAPTER 1
  // CHAPTER I
  // ===================================================

  if (
    /^CHAPTER\s+[IVXLCDM0-9]+$/i.test(
      normalized
    )
  ) {

    return true;

  }


  // ===================================================
  // JUDUL PENDEK
  // ===================================================

  if (
    normalized.length < 60 &&
    /^[A-Z0-9\s\-–—:.]+$/.test(
      normalized
    ) &&
    normalized.length > 3
  ) {

    return true;

  }


  return false;

}


// =====================================================
// EXPORT
// =====================================================

export default FlipBook;