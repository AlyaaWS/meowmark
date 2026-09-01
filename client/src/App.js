import { useEffect, useState, useCallback } from "react";

import LoadingPage from "./components/LoadingPage";
import WelcomePage from "./components/WelcomePage";
import NamePage from "./components/NamePage";
import HomePage from "./components/HomePage";
import LibraryPage from "./components/LibraryPage";
import AddBookPage from "./components/AddBookPage";
import EditBookPage from "./components/EditBookPage";
import BookDetailPage from "./components/BookDetailPage";
import PDFReaderPage from "./components/PDFReaderPage";
import ProfilePage from "./components/ProfilePage";

function App() {
  const [isLoading, setIsLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(() => {
    return localStorage.getItem("userId") ? "home" : "welcome";
  });

  const [userName, setUserName] = useState("");

  const [selectedBook, setSelectedBook] = useState(null);

  // Shared State Books & Loading
  const [books, setBooks] = useState([]);
  const [isBooksLoading, setIsBooksLoading] = useState(false);

  const fetchBooks = useCallback(async () => {
    const userId = localStorage.getItem("userId");

    if (!userId) return;

    setIsBooksLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8080/books?userId=${userId}`,
        { cache: "no-store" }
      );

      if (!response.ok) {
        throw new Error("Gagal mengambil data buku");
      }

      const data = await response.json();
      setBooks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching books:", error);
      setBooks([]);
    } finally {
      setIsBooksLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, 2800);

    return () => {
      clearTimeout(loadingTimer);
    };
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      const userId = localStorage.getItem("userId");

      if (!userId) return;

      try {
        const response = await fetch(`http://localhost:8080/users/${userId}`);

        if (!response.ok) {
          throw new Error("User tidak ditemukan");
        }

        const user = await response.json();

        setUserName(user.Name);
        setCurrentPage("home");

        fetchBooks();
      } catch (error) {
        console.error(error);

        localStorage.removeItem("userId");
        localStorage.removeItem("userName");

        setUserName("");
        setCurrentPage("welcome");
      }
    };

    loadUser();
  }, [fetchBooks]);

  const handleBookAdded = (newBook) => {
    if (newBook && newBook.ID) {
      setBooks((prevBooks) => [newBook, ...prevBooks]);
    } else {
      fetchBooks();
    }
    setCurrentPage("library");
  };

  /* Loading */

  if (isLoading) {
    return <LoadingPage />;
  }

  /* Welcome */

  if (currentPage === "welcome") {
    return (
      <WelcomePage
        onStart={() => {
          setCurrentPage("name");
        }}
      />
    );
  }

  /* Input Name */

  if (currentPage === "name") {
    return (
      <NamePage
        onSave={(user) => {
          setUserName(user.Name);
          fetchBooks();
          setCurrentPage("home");
        }}
      />
    );
  }

  /* Home */

  if (currentPage === "home") {
    return (
      <HomePage
        userName={userName}
        books={books}
        onHome={() => setCurrentPage("home")}
        onLibrary={() => setCurrentPage("library")}
        onAddBook={() => setCurrentPage("addBook")}
        onProfile={() => setCurrentPage("profile")}
      />
    );
  }

  /* Library */

  if (currentPage === "library") {
    return (
      <LibraryPage
        userName={userName}
        books={books}
        isLoading={isBooksLoading}
        onRefreshBooks={fetchBooks}
        onHome={() => setCurrentPage("home")}
        onLibrary={() => setCurrentPage("library")}
        onAddBook={() => setCurrentPage("addBook")}
        onProfile={() => setCurrentPage("profile")}
        onReadBook={() => setCurrentPage("reader")}
        onEditBook={(book) => {
          setSelectedBook(book);
          setCurrentPage("editBook");
        }}
        onBookDetail={(book) => {
          setSelectedBook(book);
          setCurrentPage("bookDetail");
        }}
      />
    );
  }

  /* Add Book */

  if (currentPage === "addBook") {
    return (
      <AddBookPage
        onBack={() => setCurrentPage("library")}
        onSave={handleBookAdded}
        onHome={() => setCurrentPage("home")}
        onLibrary={() => setCurrentPage("library")}
        onAddBook={() => setCurrentPage("addBook")}
        onProfile={() => setCurrentPage("profile")}
      />
    );
  }

  /* Edit Book */

  if (currentPage === "editBook") {
    return (
      <EditBookPage
        selectedBook={selectedBook}
        onBack={() => setCurrentPage("library")}
        onSave={() => {
          fetchBooks();
          setCurrentPage("library");
        }}
        onHome={() => setCurrentPage("home")}
        onLibrary={() => setCurrentPage("library")}
        onAddBook={() => setCurrentPage("addBook")}
        onProfile={() => setCurrentPage("profile")}
      />
    );
  }

  /* Book Detail */

  if (currentPage === "bookDetail") {
    return (
      <BookDetailPage
        selectedBook={selectedBook}
        books={books}
        setSelectedBook={setSelectedBook}
        onHome={() => setCurrentPage("home")}
        onLibrary={() => setCurrentPage("library")}
        onAddBook={() => setCurrentPage("addBook")}
        onProfile={() => setCurrentPage("profile")}
      />
    );
  }

  /* PDF Reader */

  if (currentPage === "reader") {
    return (
      <PDFReaderPage
        selectedBook={selectedBook}
        onHome={() => setCurrentPage("home")}
        onLibrary={() => setCurrentPage("library")}
        onAddBook={() => setCurrentPage("addBook")}
        onProfile={() => setCurrentPage("profile")}
      />
    );
  }

  /* Profile */

  if (currentPage === "profile") {
    return (
      <ProfilePage
        userName={userName}
        onHome={() => setCurrentPage("home")}
        onLibrary={() => setCurrentPage("library")}
        onAddBook={() => setCurrentPage("addBook")}
        onProfile={() => setCurrentPage("profile")}
        onLogout={() => {
          localStorage.removeItem("userId");

          setUserName("");
          setBooks([]);
          setCurrentPage("welcome");
        }}
      />
    );
  }

  return null;
}

export default App;
