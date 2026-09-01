import heroLogo from "../assets/hero_logo.png";
import "./WelcomePage.css";

function WelcomePage({ onStart }) {
  return (
    <main className="welcome-page">
      <section className="welcome-content">
        <div className="welcome-header">
          <h1 className="welcome-title">
            Selamat Datang
            <br />
            di <span>MeowMark!</span>
          </h1>

          <p className="welcome-description">
            simpan buku favoritmu, lacak progres
            <br />
            favoritmu, dan nikmati setiap
            <br />
            halaman, meow
          </p>
        </div>

        <div className="welcome-hero">
          <img
            src={heroLogo}
            alt="Kucing sedang membaca buku"
            className="welcome-image"
          />
        </div>

        <button type="button" className="start-button" onClick={onStart}>
          Mulai
        </button>
      </section>
    </main>
  );
}

export default WelcomePage;
