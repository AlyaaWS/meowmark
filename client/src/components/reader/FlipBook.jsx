import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./FlipBook.css";

function FlipBook({ totalPages = 100 }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [direction, setDirection] = useState(1);

  const nextPage = () => {
    if (currentPage >= totalPages) return;

    setDirection(1);
    setCurrentPage((page) => page + 1);
  };

  const previousPage = () => {
    if (currentPage <= 1) return;

    setDirection(-1);
    setCurrentPage((page) => page - 1);
  };

  return (
    <div className="flipbook-container">

      <div className="flip-left" onClick={previousPage} />

      <AnimatePresence mode="wait">

        <motion.div
          key={currentPage}
          className="flip-page"
          initial={{
            x: direction === 1 ? 200 : -200,
            rotateY: direction === 1 ? 25 : -25,
            opacity: 0
          }}
          animate={{
            x: 0,
            rotateY: 0,
            opacity: 1
          }}
          exit={{
            x: direction === 1 ? -200 : 200,
            rotateY: direction === 1 ? -25 : 25,
            opacity: 0
          }}
          transition={{
            duration: 0.28
          }}
        >

          <div className="dummy-page">

            <h2>Page {currentPage}</h2>

            <p>
              Nanti di sini kita ganti menjadi PDF asli.
            </p>

          </div>

        </motion.div>

      </AnimatePresence>

      <div className="flip-right" onClick={nextPage} />

    </div>
  );
}

export default FlipBook;