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

  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 50;


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
        // AMBIL TEXT CONTENT DAN GAMBAR
        // =============================================

        const textContent = await page.getTextContent();
        
        const viewport = page.getViewport({ scale: 1.0 });
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        const images = [];
        const origDrawImage = ctx.drawImage;
        let currentTransform = new DOMMatrix();
        let stack = [];
        
        ctx.save = function() { stack.push(new DOMMatrix(currentTransform)); CanvasRenderingContext2D.prototype.save.call(this); };
        ctx.restore = function() { currentTransform = stack.pop() || new DOMMatrix(); CanvasRenderingContext2D.prototype.restore.call(this); };
        ctx.transform = function(a,b,c,d,e,f) { currentTransform.multiplySelf(new DOMMatrix([a,b,c,d,e,f])); CanvasRenderingContext2D.prototype.transform.apply(this, arguments); };
        ctx.setTransform = function(a,b,c,d,e,f) { currentTransform = new DOMMatrix([a,b,c,d,e,f]); CanvasRenderingContext2D.prototype.setTransform.apply(this, arguments); };
        
        ctx.drawImage = function(img, ...args) {
          if (img.width > 0 && img.height > 0) {
             const yPosCanvas = currentTransform.f;
             // Ubah koordinat Canvas Y (dari atas) ke PDF Y (dari bawah) agar cocok dengan textContent.items
             const yPosPdf = viewport.viewBox[3] - (yPosCanvas / viewport.scale);
             
             // Convert ke data URL
             const tmpCanvas = document.createElement("canvas");
             tmpCanvas.width = img.width;
             tmpCanvas.height = img.height;
             tmpCanvas.getContext("2d").drawImage(img, 0, 0);
             
             images.push({
               str: '',
               type: 'image',
               src: tmpCanvas.toDataURL(),
               width: img.width,
               height: img.height,
               transform: [1, 0, 0, 1, currentTransform.e, yPosPdf]
             });
          }
          origDrawImage.apply(this, [img, ...args]);
        };
        
        // Render ke canvas hanya untuk mengekstrak gambar
        await page.render({ canvasContext: ctx, viewport }).promise;

        if (cancelled) {
          return;
        }

        const allItems = [...textContent.items, ...images];

        // =============================================
        // UBAH TEXT ITEM & GAMBAR → PARAGRAPH
        // =============================================

        const paragraphs = buildParagraphs(allItems);


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
  // SWIPE GESTURES
  // ===================================================

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      nextPage();
    }
    if (isRightSwipe) {
      previousPage();
    }
  };

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
            ? (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const inputPage = parseInt(e.target.elements.pageInput.value, 10);
                  if (!isNaN(inputPage) && inputPage >= 1 && inputPage <= numPages) {
                    setCurrentPage(inputPage);
                  }
                }}
                style={{ display: "inline-flex", alignItems: "center" }}
              >
                <input 
                  name="pageInput"
                  type="number"
                  min={1}
                  max={numPages}
                  defaultValue={currentPage}
                  key={currentPage} // so it updates when page changes via arrows
                  style={{
                    width: "50px",
                    textAlign: "center",
                    background: "transparent",
                    border: "1px solid currentColor",
                    borderRadius: "4px",
                    padding: "2px",
                    color: "inherit",
                    fontSize: "inherit"
                  }}
                  title="Tekan Enter untuk pindah halaman"
                />
                <span style={{ marginLeft: "5px" }}>/ {numPages}</span>
              </form>
            )
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

      <main 
        className="reading-area"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >


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
              pageText.map((paragraph, index) => {
                if (paragraph.type === "heading") {
                  return (
                    <h2 key={index} className="reader-heading">
                      {paragraph.text}
                    </h2>
                  );
                }

                if (paragraph.type === "image") {
                  return (
                    <img 
                      key={index} 
                      src={paragraph.src} 
                      alt="PDF Content"
                      style={{ maxWidth: '100%', height: 'auto', display: 'block', margin: '20px auto' }}
                    />
                  );
                }

                return (
                  <p 
                    key={index}
                    className={`reader-paragraph ${paragraph.indent ? "has-indent" : ""}`}
                  >
                    {paragraph.text}
                  </p>
                );
              })
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
        item.type === "image" || (item.str && item.str.trim() !== "")
      );
    })
    .map((item) => {
      const transform = item.transform || [];
      return {
        type: item.type || "text",
        src: item.src || null,
        text: item.str || "",
        x: transform[4] || 0,
        y: transform[5] || 0,
        height: Math.abs(transform[3]) || item.height || 10,
        width: item.width || 0,
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

  const groupedByY = {};

  validItems.forEach((item) => {
    const yKey = Math.round(item.y / 5) * 5; 
    if (!groupedByY[yKey]) groupedByY[yKey] = { y: yKey, items: [] };
    groupedByY[yKey].items.push(item);
  });


  // ===================================================
  // 2. KELOMPOKKAN ITEM MENJADI BARIS & IMAGE
  // ===================================================

  const sortedLines = Object.values(groupedByY).sort((a, b) => b.y - a.y);
  const normalizedLines = [];

  sortedLines.forEach((line) => {
    const lineItems = line.items.sort((a, b) => a.x - b.x);
    let currentText = "";
    let firstTextX = 0;
    let firstTextHeight = 10;

    lineItems.forEach((item, index) => {
      if (item.type === "image") {
        if (currentText.trim().length > 0) {
          normalizedLines.push({ type: "text", text: cleanText(currentText), x: firstTextX, y: line.y, height: firstTextHeight });
          currentText = "";
        }
        normalizedLines.push({ type: "image", src: item.src, y: item.y });
      } else {
        const previous = lineItems[index - 1];
        if (currentText.length === 0) {
          firstTextX = item.x;
          firstTextHeight = item.height;
        } else if (previous && item.x - (previous.x + previous.width) > Math.max(previous.height * 0.15, 2)) {
          currentText += " ";
        }
        currentText += item.text;
      }
    });

    if (currentText.trim().length > 0) {
      normalizedLines.push({ type: "text", text: cleanText(currentText), x: firstTextX, y: line.y, height: firstTextHeight });
    }
  });

  // ===================================================
  // 3. KELOMPOKKAN MENJADI PARAGRAF
  // ===================================================

  const paragraphs = [];
  let currentParagraph = null;

  // Cari margin kiri (min X) untuk menentukan indentasi relatif
  const textLines = normalizedLines.filter(l => l.type !== "image");
  let minX = 0;
  if (textLines.length > 0) {
    minX = Math.min(...textLines.map(l => l.x));
  }

  normalizedLines.forEach((line, index) => {
    if (line.type === "image") {
      if (currentParagraph) {
        paragraphs.push({ type: "paragraph", text: currentParagraph.text, indent: currentParagraph.indent });
        currentParagraph = null;
      }
      paragraphs.push({ type: "image", src: line.src });
      return;
    }

    const previous = normalizedLines[index - 1];
    const verticalGap = previous && previous.type !== "image" ? Math.abs(previous.y - line.y) : 0;
    const isLargeGap = previous && previous.type !== "image" && verticalGap > previous.height * 1.8;
    const isHeading = isHeadingText(line.text);

    if (isHeading) {
      if (currentParagraph) {
        paragraphs.push({ type: "paragraph", text: currentParagraph.text, indent: currentParagraph.indent });
        currentParagraph = null;
      }
      paragraphs.push({ type: "heading", text: line.text });
      return;
    }

    const isIndented = line.x > minX + 15; // 15px threshold for indent

    if (!currentParagraph || isLargeGap || isIndented) {
      if (currentParagraph) {
        paragraphs.push({ type: "paragraph", text: currentParagraph.text, indent: currentParagraph.indent });
      }
      currentParagraph = { text: line.text, indent: isIndented };
      return;
    }

    currentParagraph.text += " " + line.text;
  });

  if (currentParagraph) {
    paragraphs.push({ type: "paragraph", text: currentParagraph.text, indent: currentParagraph.indent });
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