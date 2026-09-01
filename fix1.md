Saya sedang membuat aplikasi React + Golang (Gin + GORM + PostgreSQL).

Saya akan mengirim file:
- App.js
- AddBookPage.js
- LibraryPage.js
- book.go
- book_handler.go
- book_repository.go
- routes.go

Masalahnya:
- POST /books berhasil.
- GET /books?userId=8 mengembalikan data.
- Namun Library React tetap menampilkan "Buku tidak ditemukan".
- Setelah menambah buku, Library juga tidak langsung ter-update.

Tolong analisis seluruh alur berdasarkan kode yang saya kirim (bukan memberi tebakan), mulai dari:
1. Flow AddBook → POST → Database → GET → Library.
2. State React (books, filteredBooks, useEffect, currentPage).
3. Dependency useEffect.
4. Proses render ulang (re-render) saat pindah halaman.
5. Mismatch field JSON (ID/id, Title/title, dll.).
6. Jelaskan akar penyebab yang sebenarnya, tunjukkan baris kode yang salah, dan berikan perbaikannya.

Jangan menyuruh saya mencoba satu per satu. Lakukan code review menyeluruh dan berikan solusi final berdasarkan kode.