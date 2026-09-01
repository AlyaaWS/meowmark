import { useState } from "react";

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

  const [currentPage, setCurrentPage] = useState(
    selectedBook?.current_page ?? selectedBook?.currentPage ?? 0,
  );

  const [totalPage, setTotalPage] = useState(
    selectedBook?.total_page ?? selectedBook?.totalPage ?? 100,
  );

  const [coverPreview, setCoverPreview] = useState(selectedBook?.cover || null);

  const [bookFileName, setBookFileName] = useState(
    selectedBook?.fileName || selectedBook?.pdf || "No PDF Selected",
  );

  const handleCoverChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setCoverPreview(URL.createObjectURL(file));
  };

  const handlePdfChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setBookFileName(file.name);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const updatedData = {
      title,
      author,
      description,
      review,
      category,
      current_page: currentPage,
      total_page: totalPage,
      pdf: bookFileName,
      cover: coverPreview,
      user_id: Number(localStorage.getItem("userId"))
    };

    try {
      const response = await fetch(`http://localhost:8080/books/${selectedBook.ID}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
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

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>Fiction</option>

            <option>Non Fiction</option>

            <option>Comedy</option>

            <option>Romance</option>

            <option>Horror</option>
          </select>
        </div>

        {/* PAGE */}

        <div className="page-row">
          <div className="form-group">
            <label>Current Page</label>

            <input
              type="number"
              value={currentPage}
              onChange={(e) => setCurrentPage(Number(e.target.value))}
            />
          </div>

          <div className="form-group">
            <label>Total Page</label>

            <input
              type="number"
              value={totalPage}
              onChange={(e) => setTotalPage(Number(e.target.value))}
            />
          </div>
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
