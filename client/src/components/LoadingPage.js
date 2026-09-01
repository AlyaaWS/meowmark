import "./LoadingPage.css";

function LoadingPage() {
  return (
    <div className="loading-page">
      <div className="loading-content">
        <svg
          className="cat-logo"
          viewBox="0 0 60 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            className="cat-line"
            pathLength="1"
            d="
              M37.5 22.5
              V30
              H45
              V22.5

              M15 22.5
              V30
              H22.5
              V22.5

              M60 37.5
              C60 67.5 0 67.5 0 37.5
              V0
              L15 15
              H45
              L60 0
            "
          />
        </svg>

        <p className="loading-text">~ meow mewo ~</p>
      </div>
    </div>
  );
}

export default LoadingPage;