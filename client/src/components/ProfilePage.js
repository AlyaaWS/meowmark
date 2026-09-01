import "./ProfilePage.css";
import BottomNavbar from "./BottomNavbar";
import profileImage from "../assets/cat-avatar.png";

function ProfilePage({ userName, onHome, onLibrary, onAddBook, onLogout }) {
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
            <h1>7</h1>
            <p>Read</p>
          </div>

          <div className="stat-card">
            <h1>16</h1>
            <p>Total Book</p>
          </div>

          <div className="stat-card">
            <h1>8</h1>
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
