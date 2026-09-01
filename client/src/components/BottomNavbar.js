import "./BottomNavbar.css";

import navbarHome from "../assets/navbar_home.png";
import navbarLibrary from "../assets/navbar_library.png";
import navbarPlus from "../assets/navbar_plus.png";

function BottomNavbar({
  activePage,
  onHome,
  onLibrary,
  onAddBook,
}) {
  return (
    <nav className="bottom-navbar">

      {/* HOME */}

      <button
        type="button"
        className={
          activePage === "home"
            ? "bottom-navbar-button active"
            : "bottom-navbar-button"
        }
        aria-label="Home"
        onClick={onHome}
      >
        <img
          src={navbarHome}
          alt=""
          className="bottom-navbar-icon"
        />
      </button>

      {/* LIBRARY */}

      <button
        type="button"
        className={
          activePage === "library"
            ? "bottom-navbar-button active"
            : "bottom-navbar-button"
        }
        aria-label="Library"
        onClick={onLibrary}
      >
        <img
          src={navbarLibrary}
          alt=""
          className="bottom-navbar-icon"
        />
      </button>

      {/* TAMBAH BUKU */}

      <button
        type="button"
        className={
          activePage === "add-book"
            ? "bottom-navbar-button active"
            : "bottom-navbar-button"
        }
        aria-label="Tambah buku"
        onClick={onAddBook}
      >
        <img
          src={navbarPlus}
          alt=""
          className="bottom-navbar-icon"
        />
      </button>

    </nav>
  );
}

export default BottomNavbar;