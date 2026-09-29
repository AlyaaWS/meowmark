import { useState } from "react";
import { API_BASE_URL } from "../config";
import "./AddBookPage.css";
import BottomNavbar from "./BottomNavbar";

import profileImage from "../assets/profil.png";

function AddBookPage({
  onBack,
  onSave,
  onHome,
  onLibrary,
  onAddBook,
  onProfile,
}) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [review, setReview] = useState("");
  const [category, setCategory] = useState("Non Fiction");
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [currentPage] = useState(0);
  const [totalPage, setTotalPage] = useState(100);

  const [coverPreview, setCoverPreview] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

  const [pdfFile, setPdfFile] = useState(null);
  const [bookFileName, setBookFileName] = useState("Choose PDF");

  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCoverChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setCoverPreview(URL.createObjectURL(file));
    setCoverFile(file);
  };

  const handlePdfChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPdfFile(file);
    setBookFileName(file.name);

    try {
      const fileUrl = URL.createObjectURL(file);
      const { pdfjs } = await import("react-pdf");
      pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
      
      const loadingTask = pdfjs.getDocument(fileUrl);
      const pdf = await loadingTask.promise;
      setTotalPage(pdf.numPages);
    } catch (err) {
      console.error("Gagal membaca jumlah halaman PDF:", err);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMsg("");

    // Validasi
    if (!title.trim()) { setErrorMsg("Title wajib diisi."); return; }
    if (!author.trim()) { setErrorMsg("Author wajib diisi."); return; }
    if (!pdfFile) { setErrorMsg("PDF wajib dipilih."); return; }
    if (totalPage <= 0) { setErrorMsg("Total page harus lebih dari 0."); return; }
    if (currentPage > totalPage) { setErrorMsg("Current page tidak boleh lebih besar dari total page."); return; }

    const userId = localStorage.getItem("userId");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("author", author);
    formData.append("description", description);
    formData.append("review", review);
    formData.append("category", category);
    formData.append("current_page", String(currentPage));
    formData.append("total_page", String(totalPage));
    formData.append("reading_status", "reading");
    formData.append("is_favorite", "false");
    formData.append("user_id", String(Number(userId)));
    formData.append("pdf", pdfFile);
    if (coverFile) {
      formData.append("cover", coverFile);
    }

    setLoading(true);
    try {
      // Jangan set Content-Type — biarkan browser atur multipart boundary otomatis
      const response = await fetch(`${API_BASE_URL}/books`, {
        method: "POST",
        body: formData,
      });

      console.log("Status:", response.status);

      const contentType = response.headers.get("content-type") || "";
      let data;
      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error("Non-JSON response:", text);
        data = { error: text };
      }

      if (!response.ok) {
        console.error("Backend error:", data);
        setErrorMsg(data?.error || "Gagal menambahkan buku.");
        return;
      }

      console.log("Book created:", data);
      onSave(data);
    } catch (err) {
      console.error("Fetch error:", err);
      setErrorMsg("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="edit-page">
      <header className="edit-header">
        <button className="back-button" onClick={onBack}>
          ←
        </button>

        <h1>Add Book</h1>

        <img
          src={profileImage}
          alt="Profile"
          className="edit-profile"
          onClick={onProfile}
        />
      </header>

      <form className="edit-form" onSubmit={handleSubmit}>
        {errorMsg && (
          <div style={{ color: "red", marginBottom: "12px", fontSize: "14px" }}>
            {errorMsg}
          </div>
        )}

        <div className="form-group">
          <label>Book File</label>

          <div className="file-box">
            <span>{bookFileName}</span>

            <label className="change-button">
              Choose
              <input
                type="file"
                accept=".pdf"
                hidden
                onChange={handlePdfChange}
              />
            </label>
          </div>
        </div>

        <div className="form-group">
          <label>Cover</label>

          <label className="cover-upload">
            {coverPreview ? (
              <img src={coverPreview} alt="Cover" className="cover-preview" />
            ) : (
              <div className="cover-placeholder">+</div>
            )}

            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleCoverChange}
            />
          </label>
        </div>

        <div className="form-group">
          <label>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Author</label>
          <input value={author} onChange={(e) => setAuthor(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Review</label>
          <textarea
            rows={5}
            value={review}
            onChange={(e) => setReview(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Category</label>
          {isCustomCategory ? (
            <div style={{ display: "flex", gap: "10px" }}>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Type new category..."
                autoFocus
              />
              <button
                type="button"
                onClick={() => {
                  setIsCustomCategory(false);
                  setCategory("Non Fiction");
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--color-brown)",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <select
              value={category}
              onChange={(e) => {
                if (e.target.value === "ADD_NEW") {
                  setIsCustomCategory(true);
                  setCategory("");
                } else {
                  setCategory(e.target.value);
                }
              }}
            >
              <option value="Fiction">Fiction</option>
              <option value="Non Fiction">Non Fiction</option>
              <option value="Comedy">Comedy</option>
              <option value="Romance">Romance</option>
              <option value="Horror">Horror</option>
              <option value="ADD_NEW" style={{ fontWeight: "bold" }}>+ Tambah Kategori Baru...</option>
            </select>
          )}
        </div>



        <button type="submit" className="save-button" disabled={loading}>
          {loading ? "Saving..." : "Save Book"}
        </button>
      </form>

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

export default AddBookPage;
