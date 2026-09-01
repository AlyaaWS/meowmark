import { useState } from "react";

import heroLogo from "../assets/hero_logo.png";
import "./NamePage.css";

function NamePage({ onSave }) {
  const [name, setName] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const handleSave = async () => {
    if (name.trim() === "") {
      setShowPopup(true);
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Gagal membuat user");
      }

      const user = await response.json();

      console.log("Response:", user);

      localStorage.setItem("userId", String(user.ID));

      console.log("Sesudah setItem:", localStorage.getItem("userId"));

      onSave(user);
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat menyimpan user.");
    }
  };

  return (
    <main className="name-page">
      <section className="name-content">
        {/* Judul dan deskripsi */}

        <header className="name-header">
          <h1 className="name-title">
            Selamat Datang
            <br />
            di MeowMark!
          </h1>

          <p className="name-description">
            simpan buku favoritmu, lacak progres
            <br />
            favoritmu, dan nikmati setiap
            <br />
            halaman, meow
          </p>
        </header>

        {/* Gambar */}

        <div className="name-hero">
          <img
            src={heroLogo}
            alt="Kucing sedang membaca buku"
            className="name-image"
          />
        </div>

        {/* Input nama */}

        <div className="name-form">
          <label htmlFor="user-name" className="name-label">
            Nama kamu siapa meow?
          </label>

          <input
            id="user-name"
            type="text"
            className="name-input"
            placeholder="nama kamu...."
            value={name}
            maxLength={30}
            onChange={(event) => {
              setName(event.target.value);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleSave();
              }
            }}
          />
        </div>

        {/* Tombol Save */}

        <button type="button" className="save-button" onClick={handleSave}>
          <span>Save</span>

          <span className="save-arrow">›</span>
        </button>

        {/* Popup */}

        {showPopup && (
          <div className="popup-overlay" onClick={() => setShowPopup(false)}>
            <div
              className="name-popup"
              role="dialog"
              aria-modal="true"
              aria-labelledby="popup-title"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="popup-cat">ฅ^•ﻌ•^ฅ</div>

              <h2 id="popup-title" className="popup-title">
                Ups, belum diisi!
              </h2>

              <p className="popup-description">
                Kenalan dulu dong,
                <br />
                siapa nama kamu, meow?
              </p>

              <button
                type="button"
                className="popup-button"
                onClick={() => setShowPopup(false)}
              >
                Isi Nama
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

export default NamePage;
