Benerin 3 hal di project Meowmark tanpa mengubah desain yang sudah ada:

1. **Navbar**
   - Buat `BottomNavbar` konsisten di semua halaman.
   - Selalu `fixed` di bawah viewport.
   - Tidak ikut naik saat halaman/isi di-scroll.
   - Responsif di berbagai ukuran HP.
   - Jangan sampai navbar menutupi konten.

2. **Favorite**
   - Ubah fitur favorite agar tersimpan di database PostgreSQL, bukan hanya `useState`.
   - Saat user menekan ♥, update field `is_favorite` pada buku di database.
   - Saat pindah halaman atau refresh, status favorite tetap tersimpan.
   - Filter `Favorite` harus mengambil berdasarkan `is_favorite` dari database.
   - Pastikan `user_id` tetap digunakan sehingga user hanya bisa mengakses dan mengubah buku miliknya sendiri.

3. **Edit Book**
   - Perbaiki fitur edit agar perubahan buku benar-benar tersimpan ke database.
   - Buat/benahi endpoint `PUT` atau `PATCH /books/:id`.
   - Setelah berhasil disimpan, kembali ke Library dan tampilkan data terbaru.
   - Pastikan hanya pemilik buku berdasarkan `user_id` yang bisa mengedit bukunya.

Cek dan sesuaikan frontend React, Go handler, repository, routes, dan model yang sudah ada. Jangan membuat data dummy baru dan jangan menghapus fitur yang sudah berjalan. Berikan perubahan kode lengkap untuk setiap file yang perlu diubah.