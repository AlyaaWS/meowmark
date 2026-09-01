import { useState } from "react";

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

  const [currentPage, setCurrentPage] = useState(0);

  const [totalPage, setTotalPage] = useState(100);

  const [coverPreview, setCoverPreview] = useState(null);
  const [coverBase64, setCoverBase64] = useState("");

  const [bookFileName, setBookFileName] = useState("Choose PDF");

  const handleCoverChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setCoverPreview(URL.createObjectURL(file));

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setCoverBase64(reader.result);
    };
  };

  const handlePdfChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setBookFileName(file.name);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    console.log("HANDLE SUBMIT JALAN");

    const userId = localStorage.getItem("userId");

    console.log("UserID:", userId);

    const response = await fetch("http://localhost:8080/books", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        author,
        description,
        review,
        current_page: currentPage,
        total_page: totalPage,
        reading_status: "reading",
        is_favorite: false,
        user_id: Number(userId),
        category,
        cover: coverBase64,
      }),
    });

    console.log("Status:", response.status);

    const book = await response.json();

    console.log(book);

    if (!response.ok) {
      alert("Gagal menambahkan buku");
      return;
    }

    onSave(book);
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

        <button type="submit" className="save-button">
          Save Book
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
