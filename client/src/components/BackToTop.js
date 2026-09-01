import { useEffect, useState } from "react";
import "./BackToTop.css";

function BackToTop({ scrollContainerRef }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const container = scrollContainerRef?.current;

    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const maxScroll =
        container.scrollHeight - container.clientHeight;

      const percent =
        maxScroll > 0
          ? (scrollTop / maxScroll) * 100
          : 0;

      setProgress(percent);
    };

    container.addEventListener("scroll", handleScroll);

    handleScroll();

    return () => {
      container.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, [scrollContainerRef]);

  const handleBackToTop = () => {
    scrollContainerRef.current?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      type="button"
      className={`back-to-top ${
        progress > 5 ? "show" : ""
      }`}
      style={{
        "--progress": `${progress}%`,
      }}
      onClick={handleBackToTop}
    >
      <span>↑</span>
    </button>
  );
}

export default BackToTop;