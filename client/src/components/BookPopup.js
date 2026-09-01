import "./BookPopup.css";

function BookPopup({
  isOpen,
  book,
  onClose,
  onRead,
  onDetail,
  onEdit,
  onDelete,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="popup-overlay"
      onClick={onClose}
    >
      <div
        className="book-popup"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="popup-title">
          Meow?
        </h2>

        <button
          className="popup-button read-button"
          onClick={onRead}
        >
          Read the Book
        </button>

        <button
          className="popup-button detail-button"
          onClick={onDetail}
        >
          See the book detail
        </button>

        <button
          className="popup-button edit-button"
          onClick={onEdit}
        >
          Edit Book
        </button>

        <button
          className="popup-button remove-button"
          onClick={onDelete}
        >
          Remove :(
        </button>
      </div>
    </div>
  );
}

export default BookPopup;