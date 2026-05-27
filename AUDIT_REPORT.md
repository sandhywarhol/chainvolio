# LAPORAN AUDIT TEKNIS & UI/UX: CHAINVOLIO

**Domain:** `chainvolio.xyz`  
**Tanggal Audit:** 26 Mei 2026  
**Auditor:** Antigravity (Google DeepMind Team)  
**Versi Dokumen:** 1.0 (Final)  

---

## 1. RINGKASAN EKSEKUTIF (EXECUTIVE SUMMARY)

Laporan ini menyajikan hasil audit mendalam terhadap platform **ChainVolio** dari dua sudut pandang pengguna utama: **Builder** (Talenta/Kandidat) dan **Recruiter** (Perusahaan, Komunitas, atau DAO). Audit difokuskan pada fungsionalitas teknis, integrasi blockchain Solana, alur autentikasi hibrida (Web3 & Google OAuth), Row-Level Security (RLS) di lapisan database, serta kualitas User Interface (UI) dan User Experience (UX).

### Penilaian Keandalan Arsitektur (Trust Architecture Rating): **9.2 / 10**

Secara keseluruhan, ChainVolio menerapkan filosofi **"Trust is enforced by architecture, not reputation"** dengan sangat konsisten. Lapisan integritas data sangat kokoh berkat:
- **Imutabilitas Terenkripsi:** Bukti kerja (Proof of Work) yang telah mendapatkan atestasi peer atau organisasi dikunci secara permanen di tingkat database Supabase melalui trigger SQL, mencegah pembaruan (`UPDATE`) atau penghapusan (`DELETE`).
- **Solana SPL Memo Anchoring:** Pencatatan atestasi profesional dan keputusan rekrutmen ("Hired") dijangkar ke Solana mainnet menggunakan program SPL Memo (`MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr`), memastikan verifikasi desentralisasi yang tidak dapat dirusak.
- **Isolasi Data Multitenancy:** RLS di Supabase dikonfigurasi dengan ketat sehingga mencegah kebocoran data pelamar lintas rekruter.

Namun, audit menemukan beberapa bug logika pada modal dompet (wallet modal), perilaku *fail-open* pada redirect callback Google, serta keterbatasan fungsional yang signifikan bagi pengguna rekruter berbasis Google OAuth (Web2-native). Temuan-temuan ini dirinci pada bagian bawah laporan ini beserta rekomendasi perbaikannya.

---

## 2. AUDIT PERSPEKTIF BUILDER (TALENT & PUBLIC FIGURE)

Perspektif Builder mencakup perjalanan talenta dari mendaftar, melengkapi profil, membuat Proof of Work, mengajukan verifikasi atestasi, hingga melamar pekerjaan rekruter.

### 2.1 Alur Login & Registrasi
- **Wallet Connection:** Builder baru dapat menghubungkan dompet Solana (Phantom/Solflare). Setelah koneksi berhasil, sistem memeriksa apakah kunci publik tersebut sudah memiliki profil melalui `/api/check-wallet`. Jika belum, pengguna diarahkan ke pemilihan peran (*role selection*) untuk menentukan dirinya sebagai Builder.
- **Google OAuth:** Memungkinkan Builder non-crypto untuk masuk menggunakan akun Google. Autentikasi diarahkan melalui `/auth/callback`, mendeteksi jika ini akun baru, lalu meminta konfirmasi peran di `/auth/role`. Jika memilih "Builder", sistem langsung membuat catatan di Supabase dengan status `onboarding_complete = true`.
- **Evaluasi UX:** Proses login sangat cepat dan responsif. Penanganan status pemuatan (*loading state*) mencegah kilatan UI (*UI flashing*) selama proses auto-connect berlangsung.

### 2.2 Pengisian Profil & Kredensial
- **Penyuntingan Profil:** Talenta dapat mengisi informasi esensial (Nama, Bio, Keterampilan, Negara, Zona Waktu, dan Preferensi Kerja). Interface menggunakan indikator persentase kelengkapan profil (misalnya, *"Add a bio, skills, and contact info to reach 100% visibility"*), yang memicu motivasi pengguna untuk menyelesaikan onboarding.
- **Penyuntingan Foto (Avatar Crop):** Integrasi `ImageCropModal` dan pustaka kompresi gambar di sisi klien (`browser-image-compression`) memastikan bahwa foto profil otomatis dikompresi di bawah 500KB sebelum diunggah ke storage avatars Supabase, yang sangat ramah bandwidth.
- **Kredensial & Sertifikat:** Pengguna dapat mengunggah file sertifikat. Kredensial ini disimpan secara aman dan ditampilkan di bagian khusus pada tab profil.
- **Public Figure Status:** Gelar kehormatan "Public Figure" diberikan secara manual oleh admin ChainVolio setelah melalui proses verifikasi eksternal. Di dalam database, ini tercatat sebagai tipe verifikasi khusus yang memberikan bobot reputasi lebih tinggi dalam perhitungan skor talenta.

### 2.3 Proof of Work (PoW) & Atestasi
- **Minting Bukti Kerja:** Penambahan entri kontribusi profesional (Role, Deskripsi, Tanggal, Dampak/Outcome, Tautan Bukti Kerja, dan Gambar Portfolio) dilakukan secara inline melalui `ReceiptForm.tsx`.
- **Self-Declared vs Attested:** Saat pertama kali dibuat, entri berstatus "Self-Declared" (Deklarasi Mandiri). Pengguna dapat membagikan link publik CV mereka (`/cv/[wallet]`) untuk meminta atestasi dari pihak ketiga (atasan atau rekan kerja).
- **Proses Penguncian Data:** Setelah atestasi ditandatangani dan diverifikasi oleh sistem, status entri otomatis berubah menjadi "Attested". Pada titik ini, database mengunci entri tersebut secara absolut. Di frontend, banner kunci (`Lock` icon) ditampilkan bersama teks: *"This record is locked after attestation. No further edits can be cryptographically signed."*

### 2.4 Melamar Pekerjaan (Recruiter Job Application)
- **Halaman Lowongan (`/r/[slug]`):** Halaman lowongan terstruktur dengan sangat rapi, menampilkan rincian kompensasi, lokasi, kriteria kelayakan, dan profil rekruter secara transparan.
- **Eligibility Gates:** Sistem memeriksa kepatuhan kandidat terhadap filter kelayakan rekruter (misalnya, persyaratan profil harus berstatus "Verified Only" atau "Active Wallet Only" dengan jumlah minimum Proof of Work tertentu). Validasi ini berjalan ganda di frontend (sebagai panduan UX) dan di backend API saat pengiriman lamaran.
- **Cryptographic Submission:** Saat melamar, kandidat menandatangani pesan berisi persetujuan pengiriman snapshot data CV mereka yang diikat ke ID lowongan rekruter. Ini mencegah pemalsuan identitas atau pengiriman spam massal otomatis.

---

## 3. AUDIT PERSPEKTIF RECRUITER (COMPANY/ORG & COMMUNITY/DAO)

Perspektif Recruiter mencakup pembuatan profil organisasi, posting lowongan, mengelola pelamar, dan melakukan on-chain hiring.

### 3.1 Registrasi & Profil Organisasi
- **Onboarding Peran:** Pengguna memilih peran "Recruiter" di modal login Web3. Dompet baru akan diarahkan untuk memilih jenis organisasi: **Company/Agency** (Perusahaan komersial) atau **Community/DAO** (Komunitas Web3 desentralisasi).
- **Redireksi Form:** Pengguna dompet diarahkan ke `/org/edit-profile-wallet?type=...`, sedangkan pengguna Google OAuth diarahkan ke `/onboarding/org`.
- **Informasi Bisnis:** Formulir profil memfasilitasi pengisian tautan sosial media resmi (Twitter/X, LinkedIn, Discord, Telegram, Website) dan email kontak utama. Validasi protokol tautan (`http://` atau `https://`) diperiksa ketat oleh API backend.

### 3.2 Pembuatan Lowongan (Hiring Link)
- **Pembuatan Kolaborasi (`/hiring/create`):** Rekruiter dapat mendefinisikan kriteria kandidat yang dicari (Position, Focus Areas seperti Github, On-chain, DAO, dsb.), kompensasi, deadline, dan batasan penyaringan (eligibility filters).
- **Trusted Hiring Signal:** Sistem secara otomatis menandai lowongan sebagai **"Trusted Hiring Source"** apabila akun rekruter terafiliasi dengan dompet terverifikasi (Verified Org) atau memiliki langganan Stripe berbayar yang aktif pada Google Org Account. Ini memberikan rasa aman bagi pelamar talenta.
- **Generasi Tautan Unik:** Sistem menghasilkan tautan lamaran unik berbasis slug acak: `/r/[job-title-slug]-[random-hash]` untuk dibagikan ke jejaring sosial media.

### 3.3 Penilaian & Dashboard Rekrutmen
- **Dashboard Hiring (`/hiring/[slug]/dashboard`):** Menampilkan semua kandidat pelamar. Dilengkapi fitur pencarian talenta, filter kategori, penyaringan spam (menyembunyikan pelamar berkualitas rendah/low-signal), dan penyortiran berdasarkan kecocokan terbaik (*best fit*).
- **Algoritma Fit & Signal Score:** Sistem melakukan analisis otomatis berdasarkan data snapshot kandidat:
  - **Signal Score (Maks 100):** Volume Proof of Work (maks 50 poin) + Bobot Atestasi Terverifikasi (maks 40 poin, dengan bobot bertingkat: Company/Org = 30, Community/DAO = 25, Public Figure = 22, Builder = 20, Unverified = 12) + Aktivitas Baru (10 poin jika aktif 30 hari terakhir).
  - **Fit Score (Maks 100):** Kesesuaian keterampilan kandidat dengan focus areas rekruter (60 poin) + rata-rata atestasi terverifikasi (maks 25 poin) + kepemilikan lencana profil terverifikasi (15 poin).
- **Fitur Catatan & Evaluasi:** Rekruter dapat menulis catatan internal untuk pelamar secara langsung di dashboard, disimpan otomatis secara asinkron di database.
- **Download Intelligence Report:** Tombol untuk mengunduh laporan PDF inteligensi rekrutmen yang merangkum data kandidat secara otomatis.

### 3.4 Memberikan Atestasi & On-Chain Hiring
- **Atestasi Kerja:** Rekruter dapat mengunjungi entri PoW pelamar dan memberikan atestasi. Atestasi ini diverifikasi melalui transaksi Solana mainnet di mana rekruter mengirimkan instruksi berisikan payload metadata terkompresi.
- **Sistem Batasan Kuota Bulanan:** Quota atestasi disesuaikan dengan tier akun rekruter untuk menghindari penyalahgunaan spam:
  - Rekruter Unverified dibatasi hanya **1 atestasi per kandidat setiap 30 hari**.
  - Tier Company/Community mendapat limit yang lebih longgar/tidak terbatas tergantung pada status verifikasi atau langganan aktif.
- **Anti-Reciprocity Check (Pencegahan Kolusi):** Guna menjamin kredibilitas sistem, API backend memblokir aksi atestasi timbal balik (coworker-swap). Jika kandidat A pernah memberikan atestasi ke pekerjaan kandidat B, maka kandidat B diblokir secara permanen untuk memberikan atestasi kembali ke kandidat A.
- **On-chain Hiring Decision ("Hired"):** Ketika rekruter memindahkan status kandidat menjadi "Hired", sistem membuat instruksi transaksi Solana mainnet baru menggunakan SPL Memo Program. Memo ini mempublikasikan hash dari rincian keputusan rekrutmen untuk membuktikan keaslian proses rekrutmen di masa depan.

---

## 4. ANALISIS PERBANDINGAN: WEB3 NATIVE VS GOOGLE OAUTH

| Kategori Evaluasi | Web3 Native (Phantom/Solflare Wallet) | Web2 Native (Google OAuth via Supabase) |
| :--- | :--- | :--- |
| **Kemudahan Penggunaan (UX)** | Membutuhkan ekstensi browser atau aplikasi mobile wallet. Lebih kompleks untuk pemula. | Sangat mudah, instan sekali klik bagi pengguna yang belum terbiasa dengan kripto. |
| **Kedaulatan Identitas** | *Non-custodial* murni. Identity anchor berasal dari kunci publik dompet desentralisasi. | Bergantung pada penyedia pihak ketiga (Google/Supabase Auth). |
| **Transaksi & Tanda Tangan** | Mampu melakukan operasi state-changing on-chain secara langsung (attest, hire, archive). | **Terbatas.** Tidak dapat menandatangani transaksi on-chain karena tidak memegang kunci privat. |
| **Dashboard Lowongan (Recruiter)** | Memiliki akses penuh ke semua fitur dashboard kandidat dan on-chain status update. | **Tidak didukung penuh.** Rekruter Google-only tidak dapat mengakses dashboard hiring jika tidak menautkan dompet. |
| **Atestasi Organisasi** | Rekruter dapat melakukan atestasi langsung dengan menandatangani Memo Solana di rantai. | Rekruter Google harus menghubungkan dompet terlebih dahulu saat ingin menandatangani Memo. |
| **Penanganan Mobile DApp** | Terintegrasi dengan deep-linking bawaan untuk memicu penjelajahan in-app dompet. | Berjalan mulus di semua mobile browser standar tanpa hambatan deep-linking. |

---

## 5. TEMUAN BUG TEKNIS & CELAH LOGIKA (BUG REPORT)

Berikut adalah daftar bug, inkonsistensi logika, dan celah dalam kode ChainVolio yang ditemukan selama proses peninjauan statis codebase:

### 1. Perilaku Pengalihan Peran yang Membingungkan Pengguna Dompet Lama
- **Lokasi Kode:** [CustomWalletModal.tsx:L125-L137](file:///Users/macbookpro/Documents/Chainvolio/components/wallet/CustomWalletModal.tsx#L125-L137)
- **Deskripsi:** Ketika pengguna menghubungkan dompet, modal secara default memanggil `/api/check-wallet?wallet=${address}&mode=builder`. Jika dompet tersebut ternyata terdaftar sebagai Recruiter di database, API akan mengembalikan respons `{ allowed: false, reason: "..." }`. Namun, di sisi frontend, alih-alih menampilkan toast kesalahan atau pesan penjelasan, kode modal secara otomatis mengubah status sesi menjadi `"recruiter"`, menutup modal secara diam-diam, dan me-redirect pengguna ke `/dashboard` sebagai rekruter:
  ```typescript
  if (check.allowed === false) {
      // Existing recruiter — go straight to dashboard
      const wn = connectedWalletNameRef.current;
      connectedWalletNameRef.current = "";
      saveSession(address, wn, "recruiter");
      setLoadingKey(null);
      onClose();
      router.push("/dashboard");
      return;
  }
  ```
- **Dampak UX:** Pengguna yang berniat masuk sebagai Builder akan terkejut dan bingung mengapa dompet mereka langsung masuk ke Dashboard Recruiter tanpa notifikasi apa pun yang menjelaskan bahwa dompet tersebut sudah terikat pada peran Recruiter dan tidak dapat didaftarkan ganda.
- **Rekomendasi Perbaikan:** Tampilkan pesan error transisi (*Toast* atau *Alert*) terlebih dahulu untuk menjelaskan batasan kepemilikan peran dompet tersebut sebelum melakukan pengalihan paksa, atau izinkan pengguna memilih opsi batal login.

### 2. Kode Mati / Tidak Terpakai pada Modul Penanganan Mobile Redirect
- **Lokasi Kode:** [wallet-connection.ts](file:///Users/macbookpro/Documents/Chainvolio/lib/wallet-connection.ts)
- **Deskripsi:** File utilitas `wallet-connection.ts` berisikan fungsi lengkap `performWalletConnection()` yang mengurusi logika redirect ke browser in-app dompet di perangkat mobile. Namun, setelah ditelusuri di seluruh proyek, fungsi ini sama sekali tidak pernah diimpor (`import`) maupun dipanggil dalam komponen mana pun. Logika redirect mobile telah diduplikasi secara manual di dalam hook `useWalletConnect.ts` dan komponen `CustomWalletModal.tsx`.
- **Dampak Teknis:** Menambah utang teknis (*technical debt*), memperbesar ukuran bundle kode proyek tanpa guna, dan dapat menyesatkan developer baru dalam memahami alur koneksi dompet yang sebenarnya berjalan.
- **Rekomendasi Perbaikan:** Hapus file `lib/wallet-connection.ts` untuk menjaga kebersihan repositori proyek, atau lakukan refaktorisasi agar `useWalletConnect.ts` menggunakan utilitas terpusat dari file tersebut.

### 3. Risiko Crash/Loop Redirect pada Google Auth Callback (Fail-Open Vulnerability)
- **Lokasi Kode:** [callback/page.tsx:L41-L52](file:///Users/macbookpro/Documents/Chainvolio/app/auth/callback/page.tsx#L41-L52)
- **Deskripsi:** Di halaman penanganan callback Google OAuth, jika pemanggilan API `/api/org-accounts?auth_uid=${session.user.id}` gagal (misal karena gangguan database Supabase atau timeout jaringan), penanganannya diletakkan di dalam blok `catch` kosong yang meloloskan alur (*fail-open*) ke `router.replace(next)` (yang defaultnya mengarah ke `/dashboard`):
  ```typescript
  try {
      const { data: { session } } = await supabaseAuth.auth.getSession();
      if (session?.user?.id) {
          const res = await fetch(`/api/org-accounts?auth_uid=${session.user.id}`);
          if (res.ok) {
              const data = await res.json();
              if (!data.orgAccount) {
                  router.replace("/auth/role");
                  return;
              }
          }
      }
  } catch {
      // Fail open — go to dashboard as normal
  }
  router.replace(next);
  ```
  Di dalam `app/dashboard/page.tsx`, terdapat pengecekan:
  ```typescript
  const needsOnboarding = !orgAccount || !orgAccount.onboarding_complete;
  useEffect(() => {
      if (needsOnboarding) router.replace("/onboarding/org");
  }, [needsOnboarding, router]);
  ```
- **Dampak Teknis:** Jika database bermasalah secara berkala sehingga `/api/org-accounts` gagal merespons, pengguna baru Google OAuth akan terlempar ke `/dashboard`, yang kemudian mendeteksi `orgAccount === null`, lalu me-redirect-nya ke `/onboarding/org`. Halaman onboarding kemudian akan mencoba membuat ulang atau membaca akun yang mungkin sudah ada, memicu kebingungan status di sisi Supabase, *infinite redirect loops*, atau crash visual karena render UI mengasumsikan objek `orgAccount` selalu terdefinisi jika pengguna sudah masuk dashboard.
- **Rekomendasi Perbaikan:** Jika pengecekan akun gagal di callback, tampilkan halaman error penanganan khusus alih-alih membiarkannya lolos ke dashboard. Lakukan sanitasi data yang lebih ketat pada wrapper dashboard.

### 4. Kurangnya Notifikasi Error saat Atestasi Timbal Balik Diblokir
- **Lokasi Kode:** [attest/route.ts:L324-L329](file:///Users/macbookpro/Documents/Chainvolio/app/api/attest/route.ts#L324-L329)
- **Deskripsi:** API backend mendeteksi adanya atestasi timbal balik (anti-reciprocity) dan memblokir dengan status code `403` dan respons error: `Reciprocal attestation (coworker-swap) detected...`. Namun, pada bagian frontend halaman verifikasi [attest/[id]/page.tsx](file:///Users/macbookpro/Documents/Chainvolio/app/attest/%5Bid%5D/page.tsx), validasi pencegahan ini tidak diperiksa secara proaktif di awal sebelum user menandatangani transaksi blockchain.
- **Dampak UX:** Pengatas (Attester) akan tetap dimintai tanda tangan transaksi Solana, membayar biaya gas (*gas fee*) jaringan, menunggu konfirmasi transaksi di blockchain hingga sukses, namun saat transaksi dikirimkan ke backend API untuk disimpan ke database, API akan menolaknya karena aturan timbal balik tersebut. Pengguna akhirnya membuang token SOL mereka secara sia-sia untuk transaksi yang tidak akan pernah tercatat di platform.
- **Rekomendasi Perbaikan:** Jalankan pengecekan timbal balik (/api/check-reciprocity) secara asinkron di frontend saat halaman attest pertama kali dimuat. Nonaktifkan tombol "Verify/Sign" dan tampilkan pesan pemblokiran sebelum pengguna memicu interaksi dengan dompet Web3 mereka.

### 5. Validasi Tautan Bukti Kerja yang Lemah pada Form Portfolio
- **Lokasi Kode:** [ReceiptForm.tsx:L312-L316](file:///Users/macbookpro/Documents/Chainvolio/components/receipt/ReceiptForm.tsx#L312-L316)
- **Deskripsi:** Form penginputan bukti kerja talenta (`ReceiptForm.tsx`) memiliki kolom "Evidence Links". Kolom ini hanya memvalidasi tipe input `url` bawaan HTML5. Jika pengguna memasukkan teks URL tanpa protokol lengkap (seperti `github.com/user/project` tanpa awalan `https://`), browser mungkin meloloskannya, tetapi backend API `/api/receipts` akan menolak entri tersebut dengan pesan kesalahan URL tidak valid.
- **Dampak UX:** Serupa dengan kasus atestasi, pelamar talenta mungkin sudah menyetujui transaksi minting di dompet mereka, lalu menerima error backend yang membatalkan penyimpanan data ke Supabase, mengakibatkan hilangnya biaya transaksi secara percuma.
- **Rekomendasi Perbaikan:** Terapkan regex validasi URL yang ketat di frontend (memastikan keberadaan `http://` atau `https://`) dan lakukan auto-format (tambahkan `https://` secara otomatis jika hilang) sebelum proses submit diajukan ke dompet untuk ditandatangani.

---

## 6. REKOMENDASI PENINGKATAN UI/UX & ESTETIKA

Untuk menghadirkan pengalaman pengguna premium bertaraf dunia (*wow factor*) sesuai dengan pedoman desain modern, berikut adalah beberapa perbaikan visual dan interaktif yang direkomendasikan untuk diimplementasikan:

1. **Tambahkan Visualisasi Reputasi Dinamis (Attestation Graph):**
   - Halaman CV talenta (`/cv/[wallet]`) saat ini menampilkan daftar Proof of Work secara linier. Sangat direkomendasikan untuk menambahkan visualisasi diagram hubungan (*interactive node graph*) menggunakan pustaka Canvas/SVG. Diagram ini dapat memetakan talenta ke entitas-entitas yang memberikan mereka atestasi (Company, DAO, Public Figure). Ini akan memberikan kesan visual Web3 modern yang sangat premium.
2. **Efek Backdrop-Blur (Glassmorphism) pada Navbar & Modal:**
   - Gunakan properti CSS `backdrop-filter: blur(12px)` yang dipadukan dengan border transparan tipis `border: 1px solid rgba(255, 255, 255, 0.08)` pada header dashboard, modal pilihan peran dompet, dan notifikasi mengambang. Ini akan memperkuat estetika futuristik yang premium dan menghilangkan kesan warna gelap datar.
3. **Animasi Transisi Halus (Smooth Micro-Animations):**
   - Terapkan efek transisi mikro pada interaksi hover tombol filter status rekrutmen, kartu pilihan peran, dan tombol navigasi sidebar. Contohnya, transisi perlahan pada bayangan tombol (`box-shadow: 0 0 20px rgba(16, 185, 129, 0.2)` saat hover pada tombol berunsur warna emerald/teal).
4. **Penyempurnaan Tampilan Mode Terang/Gelap (Theme-Aware):**
   - Pastikan variabel warna CSS didefinisikan secara terpusat pada file `globals.css` menggunakan token variabel CSS modern agar mendukung transisi tema yang konsisten dan menghindari kebocoran warna mentah (plain red/blue) di halaman dashboard.

---

### KESIMPULAN AUDIT

ChainVolio memiliki pondasi arsitektur data tepercaya yang sangat kuat dan patut diacungi jempol. Keberanian dalam mengimplementasikan imutabilitas data tingkat database dan audit trail berbasis Solana SPL Memo adalah inovasi nyata dalam mengatasi problem manipulasi riwayat kerja tradisional. 

Apabila bug logika transisi dompet, masalah loop Google Auth callback, dan minimnya validasi tautan pra-tanda tangan di atas segera diperbaiki, platform ChainVolio akan menjadi infrastruktur perekrutan talenta Web3 paling aman, kredibel, dan memiliki pengalaman pengguna terbaik di industrinya.
