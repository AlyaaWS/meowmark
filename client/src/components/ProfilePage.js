import "./ProfilePage.css";
import BottomNavbar from "./BottomNavbar";
import profileImage from "../assets/cat-avatar.png";

function ProfilePage({ userName, books = [], onHome, onLibrary, onAddBook, onLogout }) {
  const totalBooks = books.length;
  const finishedBooks = books.filter(b => {
    const total = b.total_page || b.totalPage || 1;
    const current = b.current_page || b.currentPage || 0;
    return current >= total && total > 0;
  }).length;
  const readingBooks = books.filter(b => {
    const total = b.total_page || b.totalPage || 1;
    const current = b.current_page || b.currentPage || 0;
    return current > 0 && current < total;
  }).length;

  return (
    <div className="profile-page">
      <div className="profile-content">
        <img
          className="profile-avatar"
          src={profileImage}
          alt="Profile"
        />

        <h2 className="profile-name">{userName}</h2>

        <div className="profile-stats">
          <div className="stat-card">
            <h1>{readingBooks}</h1>
            <p>Read</p>
          </div>

          <div className="stat-card">
            <h1>{totalBooks}</h1>
            <p>Total Book</p>
          </div>

          <div className="stat-card">
            <h1>{finishedBooks}</h1>
            <p>Finished</p>
          </div>
        </div>

        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>

      <BottomNavbar
        active="profile"
        onHome={onHome}
        onLibrary={onLibrary}
        onAddBook={onAddBook}
      />
    </div>
  );
}

export default ProfilePage;
