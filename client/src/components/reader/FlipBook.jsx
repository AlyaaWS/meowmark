import { useEffect, useState } from "react";
import { pdfjs } from "react-pdf";

import "./FlipBook.css";

// Worker PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

function FlipBook({
  pdfUrl,
  currentPage,
  setCurrentPage,
  wakeReader,
}) {
  const [numPages, setNumPages] = useState(null);
  const [pageText, setPageText] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [fontSize, setFontSize] = useState(18);

  /*
   * ============================
   * LOAD PDF
   * ============================
   */
  useEffect(() => {
    if (!pdfUrl) return;

    let cancelled = false;

    const loadPDF = async () => {
      try {
        setLoading(true);
        setError(false);

        console.log("Loading PDF:", pdfUrl);

        const loadingTask = pdfjs.getDocument({
          url: pdfUrl,
        });

        const pdf = await loadingTask.promise;

        if (cancelled) return;

        console.log("PDF berhasil dibaca");
        console.log("Total halaman:", pdf.numPages);

        setNumPages(pdf.numPages);

        /*
         * Ambil teks halaman yang sedang dibuka.
         */
        const page = await pdf.getPage(currentPage);

        const textContent = await page.getTextContent();

        console.log(
          "Text items:",
          textContent.items.length
        );

        if (cancelled) return;

        const paragraphs = buildParagraphs(
          textContent.items
        );

        setPageText(paragraphs);
        setLoading(false);

      } catch (err) {
        console.error("PDF gagal dibaca:", err);

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
  }, [pdfUrl, currentPage]);


  /*
   * ============================
   * NEXT PAGE
   * ============================
   */
  const nextPage = () => {
    if (!numPages) return;

    if (currentPage >= numPages) return;

    setCurrentPage((page) => page + 1);

    wakeReader?.();

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };


  /*
   * ============================
   * PREVIOUS PAGE
   * ============================
   */
  const previousPage = () => {
    if (currentPage <= 1) return;

    setCurrentPage((page) => page - 1);

    wakeReader?.();

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };


  /*
   * ============================
   * FONT SIZE
   * ============================
   */
  const increaseFont = () => {
    setFontSize((size) => Math.min(size + 2, 32));
  };

  const decreaseFont = () => {
    setFontSize((size) => Math.max(size - 2, 14));
  };


  /*
   * ============================
   * ERROR
   * ============================
   */
  if (!pdfUrl) {
    return (
      <div className="pdf-error">
        PDF tidak ditemukan.
      </div>
    );
  }


  if (error) {
    return (
      <div className="pdf-error">
        <p>Failed to load PDF file.</p>

        <small>
          Pastikan PDF bisa dibuka dari:
          <br />
          {pdfUrl}
        </small>
      </div>
    );
  }


  /*
   * ============================
   * READER
   * ============================
   */
  return (
    <div className="reader-container">

      {/* ======================
          HEADER
      ======================= */}
      <div className="reader-header">

        <button
          className="reader-header-button"
          onClick={previousPage}
          disabled={currentPage <= 1}
        >
          ‹
        </button>


        <div className="reader-page-number">
          {numPages
            ? `${currentPage} / ${numPages}`
            : "..."}
        </div>


        <button
          className="reader-header-button"
          onClick={nextPage}
          disabled={!numPages || currentPage >= numPages}
        >
          ›
        </button>

      </div>


      {/* ======================
          READING AREA
      ======================= */}
      <main className="reading-area">

        {loading ? (
          <div className="reader-loading">
            <div className="loading-spinner" />
            <span>Loading PDF...</span>
          </div>
        ) : (
          <article
            className="reading-page"
            style={{
              fontSize: `${fontSize}px`,
            }}
          >

            {pageText.length === 0 ? (
              <p className="empty-text">
                Tidak ada teks yang dapat dibaca
                pada halaman ini.
              </p>
            ) : (
              pageText.map((paragraph, index) => {

                if (paragraph.type === "heading") {
                  return (
                    <h2
                      key={index}
                      className="reader-heading"
                    >
                      {paragraph.text}
                    </h2>
                  );
                }

                return (
                  <p
                    key={index}
                    className={`reader-paragraph ${paragraph.indent
                        ? "has-indent"
                        : ""
                      }`}
                  >
                    {paragraph.text}
                  </p>
                );
              })
            )}

          </article>
        )}

      </main>


      {/* ======================
          READER CONTROLS
      ======================= */}
      <div className="reader-controls">

        <button
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
          className="font-button"
          onClick={increaseFont}
          disabled={fontSize >= 32}
          aria-label="Perbesar tulisan"
        >
          +
        </button>

      </div>

    </div>
  );
}


/*
 * =========================================================
 * PDF TEXT → PARAGRAPH
 * =========================================================
 *
 * PDF sebenarnya menyimpan text berdasarkan posisi.
 *
 * Kita kelompokkan:
 *
 * text item
 *     ↓
 * baris
 *     ↓
 * paragraf
 *
 * Jadi bukan sekadar mengambil semua text
 * lalu ditumpuk.
 */
function buildParagraphs(items) {

  if (!items || items.length === 0) {
    return [];
  }


  /*
   * Ambil hanya item yang punya text.
   */
  const validItems = items
    .filter((item) => {
      return (
        item.str &&
        item.str.trim() !== ""
      );
    })
    .map((item) => {

      const transform = item.transform || [];

      return {
        text: item.str,
        x: transform[4] || 0,
        y: transform[5] || 0,
        height: Math.abs(transform[3]) || 10,
        width: item.width || 0,
      };
    });


  if (validItems.length === 0) {
    return [];
  }


  /*
   * =================================
   * 1. KELOMPOKKAN MENJADI BARIS
   * =================================
   */
  const lines = [];

  validItems.forEach((item) => {

    /*
     * Cari baris yang posisi Y-nya dekat.
     */
    let line = lines.find((existingLine) => {

      return (
        Math.abs(
          existingLine.y - item.y
        ) < Math.max(item.height, 8)
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


  /*
   * Urutkan dari atas → bawah.
   */
  lines.sort((a, b) => b.y - a.y);


  /*
   * Urutkan text dalam setiap baris
   * dari kiri → kanan.
   */
  lines.forEach((line) => {

    line.items.sort(
      (a, b) => a.x - b.x
    );

  });


  /*
   * =================================
   * 2. GABUNGKAN ITEM MENJADI BARIS
   * =================================
   */
  const normalizedLines = lines
    .map((line) => {

      let text = "";

      line.items.forEach((item, index) => {

        const previous =
          line.items[index - 1];

        if (!previous) {
          text += item.text;
          return;
        }


        /*
         * Kalau ada jarak horizontal
         * yang cukup jauh, kasih spasi.
         */
        const previousEnd =
          previous.x + previous.width;

        const gap =
          item.x - previousEnd;


        if (
          gap > Math.max(
            previous.height * 0.15,
            2
          )
        ) {
          text += " ";
        }

        text += item.text;
      });


      return {
        text: cleanText(text),
        x: line.items[0]?.x || 0,
        y: line.y,
        height:
          line.items[0]?.height || 10,
      };

    })
    .filter((line) => line.text);


  /*
   * =================================
   * 3. KELOMPOKKAN MENJADI PARAGRAF
   * =================================
   */
  const paragraphs = [];

  let currentParagraph = null;


  normalizedLines.forEach((line, index) => {

    const previous =
      normalizedLines[index - 1];


    /*
     * Hitung jarak vertikal.
     */
    const verticalGap = previous
      ? Math.abs(previous.y - line.y)
      : 0;


    /*
     * Kalau jaraknya jauh,
     * kemungkinan paragraf baru.
     */
    const isLargeGap =
      previous &&
      verticalGap >
      previous.height * 1.8;


    /*
     * Deteksi heading.
     */
    const isHeading =
      isHeadingText(line.text);


    /*
     * Kalau heading, langsung buat
     * elemen heading sendiri.
     */
    if (isHeading) {

      if (currentParagraph) {

        paragraphs.push({
          type: "paragraph",
          text: currentParagraph.text,
          indent: currentParagraph.indent,
        });

        currentParagraph = null;
      }


      paragraphs.push({
        type: "heading",
        text: line.text,
      });

      return;
    }


    /*
     * Kalau paragraf baru.
     */
    if (
      !currentParagraph ||
      isLargeGap
    ) {

      if (currentParagraph) {

        paragraphs.push({
          type: "paragraph",
          text: currentParagraph.text,
          indent: currentParagraph.indent,
        });
      }


      currentParagraph = {
        text: line.text,
        indent: line.x > 30,
      };

      return;
    }


    /*
     * Kalau masih paragraf yang sama,
     * gabungkan dengan spasi.
     */
    currentParagraph.text +=
      " " + line.text;
  });


  /*
   * Masukkan paragraf terakhir.
   */
  if (currentParagraph) {

    paragraphs.push({
      type: "paragraph",
      text: currentParagraph.text,
      indent: currentParagraph.indent,
    });
  }


  return paragraphs;
}


/*
 * =========================================================
 * CLEAN TEXT
 * =========================================================
 */
function cleanText(text) {

  return text
    .replace(/\s+/g, " ")
    .replace(/\s+([,.!?;:])/g, "$1")
    .trim();
}


/*
 * =========================================================
 * HEADING DETECTOR
 * =========================================================
 */
function isHeadingText(text) {

  const normalized =
    text.trim();


  if (!normalized) {
    return false;
  }


  /*
   * BAB I
   * BAB II
   * BAB III
   */
  if (
    /^BAB\s+[IVXLCDM0-9]+$/i.test(
      normalized
    )
  ) {
    return true;
  }


  /*
   * CHAPTER 1
   * CHAPTER I
   */
  if (
    /^CHAPTER\s+[IVXLCDM0-9]+$/i.test(
      normalized
    )
  ) {
    return true;
  }


  /*
   * Judul sangat pendek dan
   * kemungkinan heading.
   */
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


export default FlipBook;