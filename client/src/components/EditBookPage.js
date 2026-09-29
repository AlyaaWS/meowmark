import { useState } from "react";
import { API_BASE_URL } from "../config";
import "./EditBookPage.css";

import profileImage from "../assets/profil.png";

function EditBookPage({ selectedBook, onBack, onSave, onProfile}) {
  const [title, setTitle] = useState(selectedBook?.title || "");

  const [author, setAuthor] = useState(selectedBook?.author || "");

  const [description, setDescription] = useState(
    selectedBook?.description || "",
  );

  const [review, setReview] = useState(selectedBook?.review || "");

  const [category, setCategory] = useState(
    selectedBook?.category || "Non Fiction",
  );
  
  // Periksa apakah kategori awal ini adalah kategori custom yang tidak ada di list
  const predefinedCategories = ["Fiction", "Non Fiction", "Comedy", "Romance", "Horror"];
  const isInitialCustom = !predefinedCategories.includes(selectedBook?.category || "Non Fiction");
  
  const [isCustomCategory, setIsCustomCategory] = useState(isInitialCustom);

  const [currentPage] = useState(
    selectedBook?.current_page ?? selectedBook?.currentPage ?? 0,
  );

  const [totalPage, setTotalPage] = useState(
    selectedBook?.total_page ?? selectedBook?.totalPage ?? 100,
  );

  const [coverPreview, setCoverPreview] = useState(selectedBook?.cover || null);

  const [bookFileName, setBookFileName] = useState(
    selectedBook?.fileName || selectedBook?.pdf || "No PDF Selected",
  );

  const [coverFile, setCoverFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);

  const handleCoverChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setCoverPreview(URL.createObjectURL(file));
    setCoverFile(file);
  };

  const handlePdfChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setBookFileName(file.name);
    setPdfFile(file);

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

    const formData = new FormData();
    formData.append("title", title);
    formData.append("author", author);
    formData.append("description", description);
    formData.append("review", review);
    formData.append("category", category);
    formData.append("current_page", currentPage);
    formData.append("total_page", totalPage);
    formData.append("user_id", Number(localStorage.getItem("userId")));

    if (coverFile) {
      formData.append("cover", coverFile);
    } else {
      formData.append("existing_cover", selectedBook?.cover || "");
    }

    if (pdfFile) {
      formData.append("pdf", pdfFile);
    } else {
      formData.append("existing_pdf", selectedBook?.pdf || "");
    }

    try {
      const response = await fetch(`${API_BASE_URL}/books/${selectedBook.ID}`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to update book");
      }

      onSave();
    } catch (error) {
      console.error(error);
      alert("Gagal mengupdate buku!");
    }
  };

  return (
    <main className="edit-page">
      {/* HEADER */}

      <header className="edit-header">
        <button className="back-button" onClick={onBack}>
          ←
        </button>

        <h1>Edit Book</h1>

        <img src={profileImage} alt="Profile" className="edit-profile" onClick={onProfile} />
      </header>

      <form className="edit-form" onSubmit={handleSubmit}>
        {/* PDF */}

        <div className="form-group">
          <label>Book File</label>

          <div className="file-box">
            <span>{bookFileName}</span>

            <label className="change-button">
              Change
              <input
                type="file"
                accept=".pdf"
                hidden
                onChange={handlePdfChange}
              />
            </label>
          </div>
        </div>

        {/* COVER */}

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

        {/* TITLE */}

        <div className="form-group">
          <label>Title</label>

          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        {/* AUTHOR */}

        <div className="form-group">
          <label>Author</label>

          <input value={author} onChange={(e) => setAuthor(e.target.value)} />
        </div>

        {/* DESCRIPTION */}

        <div className="form-group">
          <label>Description</label>

          <textarea
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* REVIEW */}

        <div className="form-group">
          <label>Review</label>

          <textarea
            rows={5}
            value={review}
            onChange={(e) => setReview(e.target.value)}
          />
        </div>

        {/* CATEGORY */}

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



        {/* BUTTON */}

        <button type="submit" className="save-button">
          Update Book
        </button>
      </form>
    </main>
  );
}

export default EditBookPage;
