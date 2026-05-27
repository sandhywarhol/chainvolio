# LAPORAN AUDIT TEKNIS & UI/UX (V2): CHAINVOLIO
**Topik Khusus:** Integrasi Wallet Web3 (Phantom & Solflare) & Sesi Autentikasi Hibrida  
**Domain:** `chainvolio.xyz`  
**Tanggal Audit:** 27 Mei 2026  
**Auditor:** Antigravity (Google DeepMind Team)  
**Versi Dokumen:** 2.0 (Follow-up)

---

## 1. RINGKASAN EKSEKUTIF (EXECUTIVE SUMMARY)

Laporan audit ini merupakan kelanjutan dari evaluasi teknis dan UI/UX sebelumnya pada platform **ChainVolio**, dengan fokus utama pada alur pendaftaran, masuk (*login*), penautan dompet (*wallet linking*), serta perjalanan pengguna (**Builder** dan **Recruiter**) yang mengandalkan dompet Web3 (Phantom dan Solflare).

Perbaikan terbaru yang diterapkan developer (seperti penanganan callback Google OAuth ke `/auth/role` saat terjadi error API dan pemeriksaan timbal balik atestasi proaktif sebelum transaksi Solana ditandatangani) telah secara signifikan meningkatkan kestabilan sistem. Namun, **audit putaran kedua ini menemukan celah logika kritis (critical UX hijacking/collision) pada modal dompet (`CustomWalletModal.tsx`)** yang berpotensi memutus atau merusak sesi pengguna Google OAuth ketika mencoba menautkan dompet Solana mereka.

Rincian temuan, kendala fungsional, dan rekomendasi optimisasi disajikan lengkap dalam laporan di bawah ini.

---

## 2. EVALUASI USER INTERFACE (UI) DOMPET (PHANTOM & SOLFLARE)

Secara umum, desain antarmuka modal dompet dan integrasinya pada platform ChainVolio terlihat sangat modern dan futuristik.

### 2.1 Desain Visual & Konsistensi
- **Custom Wallet Modal (`components/wallet/CustomWalletModal.tsx`):**
  - Menggunakan skema warna gelap premium (`#0d0d0f`) dengan pinggiran border transparan halus (`border-white/10`) dan efek *backdrop blur* (`backdrop-blur-md`) yang serasi dengan estetika Web3 modern.
  - Kartu pilihan peran untuk pengguna baru menampilkan ikon yang informatif dengan kontras warna yang apik (Indigo untuk *Builder* dan Amber untuk *Recruiter*).
- **Responsive Web Design:**
  - Di perangkat seluler, modal otomatis berubah menjadi *drawer bottom-sheet* (`items-end sm:items-center rounded-t-[32px] sm:rounded-[32px]`) yang nyaman dijangkau oleh jempol pengguna.
- **Indikator Status (Loading/Connection States):**
  - Keberadaan spinner loading (`animate-spin`) pada tombol dompet saat proses koneksi berlangsung memberikan respons visual yang jelas sehingga pengguna tidak menekan tombol berulang kali.

### 2.2 Kelemahan UI (UI Gaps & Flaws)
- **Inkonsistensi Warna Indikator Langkah (Step Indicators):**
  - Pada langkah pemilihan peran untuk dompet baru (`step === "role"`), lingkaran status (dots) di bagian atas berwarna `bg-amber-400` (warna tema Recruiter), bahkan saat pengguna memilih peran Builder yang bertema Indigo. Ini sedikit merusak konsistensi warna visual tema peran.
- **Visualisasi Transisi Dompet pada Dashboard:**
  - Ketika Google Builder menautkan dompet dari dashboard, UI langsung berubah secara instan ke dashboard dompet tanpa adanya *success message banner* atau mikro-animasi transisi. Perubahan UI yang terlalu mendadak ini dapat membuat pengguna bingung apakah sesi mereka berhasil ditautkan atau dialihkan.

---

## 3. EVALUASI USER EXPERIENCE (UX) & SESI KONEKSI DOMPET

Alur interaksi dompet berjalan sangat cepat berkat penggunaan hook kustom `useWalletConnect.ts` yang memisahkan langkah pemilihan adapter (`select()`) dan inisiasi koneksi (`connect()`).

### 3.1 Penanganan Masa Aktif & Autokoneksi (Session Restore)
- Fitur `SessionRestoreHandler` di `WalletProvider.tsx` mampu memulihkan sesi dompet yang tersimpan (`cv_wallet_name`) secara aman saat halaman dimuat ulang (*page refresh*), dengan batas aman kedaluwarsa (`cv_session_exp` selama 7 hari).
- Adanya batas waktu (*timeout*) 10 detik pada autokoneksi mencegah spinner loading macet selamanya jika ekstensi Phantom mengalami kemacetan akibat penangguhan *service worker* Manifest V3 (MV3) oleh Chrome.

### 3.2 Analisis Alur Wallet Linking (Google OAuth + Web3 Wallet)
- **Tujuan Asli Fitur:** Memungkinkan pengguna masuk dengan Google (Web2-native) lalu menautkan dompet Solana sebagai alat tanda tangan kriptografis untuk atestasi on-chain, tanpa merusak akun Google mereka.
- **Bencana UX (UX Collision Bug):**
  - Ketika Google Recruiter mengklik banner "Link Wallet" di dashboard, modal dompet dibuka dengan status `googleSession` aktif.
  - Namun, ketika dompet terhubung, `useEffect` pendeteksi koneksi di [CustomWalletModal.tsx:L116-L176](file:///Users/macbookpro/Documents/Chainvolio/components/wallet/CustomWalletModal.tsx#L116-L176) langsung mengambil alih kendali. Jika dompet tersebut belum terdaftar (baru), modal akan memaksa pengguna memilih peran (*role selection*) dan tipe organisasi (Step 2 & 3).
  - Setelah selesai, modal melakukan pengalihan paksa (`router.push("/org/edit-profile-wallet?type=...")`), menghapus sesi Google recruiter mereka secara lokal dan menggantinya dengan sesi pendaftaran dompet rekruter baru.
  - Pengguna tidak pernah berhasil menautkan dompet ke akun Google mereka melalui modal tersebut. Mereka terpaksa keluar dari dashboard dan terjebak dalam proses pendaftaran ganda yang membingungkan.

---

## 4. KENDALA & KEBINGUNGAN UMUM PENGGUNA (FRICTION POINTS)

Berdasarkan analisis arsitektur sesi, berikut adalah titik hambatan terbesar bagi pengguna:

1. **Kebingungan Peran Dompet yang Terikat:**
   - Jika pengguna memiliki dompet yang sudah terdaftar sebagai Recruiter, namun ia tidak sengaja mencoba masuk melalui tombol dompet biasa dengan niat menjadi Builder, sistem langsung melakukan pengalihan paksa ke `/dashboard` sebagai Recruiter secara diam-diam tanpa memberi tahu mengapa ia tidak bisa mendaftar sebagai Builder.
2. **Kehilangan Akses Penautan Dompet:**
   - Banner penautan dompet (*Link Wallet nudge*) di dashboard Google Recruiter dapat ditutup dengan tombol "×" yang menyimpan flag `cv_wallet_nudge_dismissed` di `localStorage`.
   - Begitu ditutup, **tidak ada opsi atau tombol cadangan** di sidebar, navbar, atau menu navigasi manapun untuk membuka kembali modal penautan dompet. Satu-satunya cara bagi recruiter untuk memunculkannya kembali adalah dengan membersihkan cache browser mereka.
3. **Penyimpanan Status Koneksi Seluler yang Mengunci UI:**
   - Di perangkat seluler, jika koneksi dompet gagal atau dibatalkan pengguna, flag `cv_connecting` di `localStorage` tidak dihapus. Hal ini menyebabkan tombol koneksi dompet terkunci selamanya (tidak merespons klik berikutnya) karena baris kode `if (localStorage.getItem("cv_connecting")) return;` memblokir interaksi lebih lanjut.

---

## 5. PERSPEKTIF BUILDER (TALENT) - EVALUASI KESULITAN & ERROR

Bagi pengguna Builder, platform menawarkan fungsionalitas pembuatan resume on-chain yang matang, namun memiliki celah berikut:

### 5.1 Hambatan saat Google Builder Menautkan Dompet
- Google Builder yang baru mendaftar tidak diizinkan mengakses fitur platform sama sekali sebelum menghubungkan dompet Solana (`GoogleBuilderNoWalletView`).
- Ketika mereka menghubungkan dompet melalui tombol `<WalletMultiButton />`, mereka langsung dialihkan ke dashboard utama wallet-builder.
- Di dashboard tersebut, sistem mendeteksi bahwa alamat dompet belum memiliki profil, sehingga memunculkan banner *"No profile yet. Create one first"* yang mengarah ke `/create-profile`.
- Di halaman `/create-profile`, formulir tampil **kosong melongpong**. Platform tidak melakukan sinkronisasi atau pra-pengisian (*pre-filling*) data profil dasar (Nama, Email, Foto Profil) yang sebenarnya sudah didapatkan dari sesi akun Google mereka. Ini memaksa Builder mengisi ulang informasi secara manual.

### 5.2 Kelelahan Tanda Tangan Kriptografis (Signature Fatigue)
- Builder harus menandatangani pesan dompet (`signMessage`) setiap kali memperbarui deskripsi profil sederhana di `/create-profile`. Kurangnya penjelasan singkat di UI tentang pentingnya tanda tangan ini (untuk integritas data resume) dapat membuat pengguna awam merasa curiga atau lelah dengan munculnya pop-up dompet yang terus-menerus.

### 5.3 Validasi Lemah pada Tautan Bukti Kerja (Evidence Links)
- Di [ReceiptForm.tsx:L312-L316](file:///Users/macbookpro/Documents/Chainvolio/components/receipt/ReceiptForm.tsx#L312-L316), kolom input URL bukti kerja menggunakan tipe bawaan HTML5 (`type="url"`).
- Jika pengguna mengetik `github.com/myproject` (tanpa awalan `https://`), beberapa browser meloloskannya secara lokal. Pengguna kemudian dipandu untuk menandatangani transaksi dompet. Namun, saat data dikirim ke API `/api/receipts`, API menolaknya karena validasi regex URL ketat di backend gagal.
- **Hasil Akhir:** Pengguna kehilangan waktu, lelah menandatangani transaksi dompet, hanya untuk menghadapi error kegagalan penyimpanan di akhir.

---

## 6. PERSPEKTIF RECRUITER (COMPANY & DAO) - EVALUASI KESULITAN & ERROR

Bagi pengguna Recruiter, berikut adalah kendala fungsionalitas dompet yang ditemui:

### 6.1 Kegagalan Total Fitur Penautan Dompet Organisasi
- Karena bug intersep modal yang dijelaskan pada Poin 3.2, Google Recruiter tidak dapat menautkan dompet Solana mereka secara sukses jika melalui modal penautan dompet bawaan.
- Mereka harus melewati modal tersebut, pergi ke tab *Profile*, gulir ke bawah ke bagian *Wallet Section*, dan menekan tombol *Save as Signing Wallet* secara manual. Informasi tentang jalur alternatif ini tidak pernah dijelaskan di platform, sehingga mayoritas pengguna menganggap fitur penautan dompet rusak total.

### 6.2 Lemahnya Alur Validasi Onboarding Profil Dompet
- Onboarding recruiter berbasis dompet langsung mengalihkan pengguna ke `/org/edit-profile-wallet?type=...`. Namun, halaman ini tidak memiliki mekanisme pencegahan yang mengikat pengguna untuk mengisi profil secara lengkap sebelum mereka menavigasi ke bagian dashboard lainnya. Hal ini memicu potensi kesalahan data (misal membuat lowongan kerja tanpa nama organisasi yang valid).

### 6.3 Inkonsistensi Aksi Pemutusan Tautan Dompet (*Unlinking*)
- Tombol *Unlink* pada dashboard recruiter menghapus keterikatan dompet di database. Namun, dompet Solana di browser pengguna tetap berada dalam status terhubung (*connected*). Ini membingungkan karena pengguna merasa telah melepas dompetnya, namun alamat dompetnya masih terpampang jelas di antarmuka web.

---

## 7. LAPORAN BUG SPESIFIK & REKOMENDASI PENINGKATAN TEKNIS

Berikut adalah daftar bug teknis lengkap beserta potongan kode terkait dan usulan perbaikan konkretnya:

### BUG 1: Intersep & Pembajakan Sesi Sesi Google oleh Modal Dompet
* **Lokasi File:** [CustomWalletModal.tsx:L116-L176](file:///Users/macbookpro/Documents/Chainvolio/components/wallet/CustomWalletModal.tsx#L116-L176)
* **Penyebab:** Fungsi `handleConnected` di dalam hook `useEffect` modal dompet secara agresif memproses koneksi dompet baru sebagai proses masuk (*login*) utama dan memicu pemilihan peran (`setStep("role")`), mengabaikan apakah pengguna saat ini sebenarnya sudah login menggunakan akun Google.
* **Solusi Perbaikan:**  
  Tambahkan pengecekan `googleSession` di awal fungsi `handleConnected`. Jika sesi Google aktif, lewati seluruh logika penentuan peran dompet baru dan biarkan modal langsung menutup dirinya (atau otomatis memicu endpoint link), sehingga dashboard utama yang mengambil alih proses pengaitan dompet:
  ```typescript
  // Di dalam handleConnected() CustomWalletModal.tsx:
  if (googleSession) {
      // Jika pengguna login via Google, cukup tutup modal.
      // Dashboard atau OrgDashboard yang akan mendeteksi status connected untuk melakukan link.
      setLoadingKey(null);
      onClose();
      return;
  }
  ```

---

### BUG 2: Ketiadaan Validasi Keunikan Wallet Address pada Penautan Akun
* **Lokasi File:** [app/api/org-accounts/route.ts:L79-L97](file:///Users/macbookpro/Documents/Chainvolio/app/api/org-accounts/route.ts#L79-L97)
* **Penyebab:** Endpoint `PATCH` untuk `org_accounts` memperbarui kolom `wallet_address` secara bebas tanpa memvalidasi apakah dompet tersebut sudah terikat pada akun Google lain atau sudah terdaftar sebagai profil Builder terpisah.
* **Solusi Perbaikan:**  
  Lakukan pengecekan duplikasi database sebelum memperbarui alamat dompet di dalam `PATCH` handler:
  ```typescript
  // Periksa apakah wallet sudah dikaitkan dengan akun org lain
  const { data: existingOrg } = await supabaseServer
      .from("org_accounts")
      .select("auth_uid")
      .eq("wallet_address", updates.wallet_address)
      .neq("auth_uid", auth_uid)
      .maybeSingle();

  if (existingOrg) {
      return NextResponse.json({ error: "Wallet ini sudah ditautkan ke akun lain." }, { status: 400 });
  }

  // Periksa apakah wallet sudah terdaftar sebagai Builder profil
  const { data: existingProfile } = await supabaseServer
      .from("profiles")
      .select("wallet_address")
      .eq("wallet_address", updates.wallet_address)
      .maybeSingle();

  if (existingProfile) {
      return NextResponse.json({ error: "Wallet ini sudah terdaftar sebagai Builder profil." }, { status: 400 });
  }
  ```

---

### BUG 3: Penguncian Tombol Koneksi Dompet Seluler akibat Sisa Flag `cv_connecting`
* **Lokasi File:** [hooks/useWalletConnect.ts:L58-L105](file:///Users/macbookpro/Documents/Chainvolio/hooks/useWalletConnect.ts#L58-L105)
* **Penyebab:** Jika pengguna membatalkan tanda tangan koneksi dompet di ponsel (menghasilkan error `WalletWindowClosedError`) atau koneksi terputus (*timeout*), flag pengunci `cv_connecting` di `localStorage` tidak dihapus.
* **Solusi Perbaikan:**  
  Pastikan bendera `cv_connecting` dihapus pada setiap blok `catch` di dalam penanganan error koneksi:
  ```typescript
  } catch (err: any) {
      localStorage.removeItem("cv_connecting"); // Pastikan bendera dibersihkan di sini!
      const msg: string = err?.message ?? "";
      if (err?.name === "WalletWindowClosedError") {
          setConnectionError("cancelled");
          return;
      }
      // ... sisa penanganan error
  ```

---

### BUG 4: Tidak Adanya Opsi Re-open Modal Penautan Dompet setelah Dihapus (Dismissed)
* **Lokasi File:** [app/dashboard/page.tsx:L1830-L1858](file:///Users/macbookpro/Documents/Chainvolio/app/dashboard/page.tsx#L1830-L1858)
* **Penyebab:** Nudge banner penautan dompet di dashboard Google Recruiter hanya melacak `cv_wallet_nudge_dismissed`. Sekali ditutup, tidak ada alternatif tombol lain bagi pengguna untuk menautkan dompet.
* **Solusi Perbaikan:**  
  Tambahkan tautan kecil "Link Wallet" atau tombol aksi permanen di menu bar samping (*Sidebar*) atau di bagian bawah detail profil Google pada dashboard rekruter:
  ```typescript
  // Tambahkan item menu sidebar di GoogleNavTabs atau sebagai tombol kecil di sidebar bawah:
  {!orgAccount?.wallet_address && (
      <button 
          onClick={() => setWalletModalOpen(true)}
          className="w-full flex items-center gap-2.5 px-3 py-[7px] rounded-md text-teal-400 hover:bg-teal-500/10 text-left text-xs font-bold"
      >
          <Wallet className="w-3.5 h-3.5 text-teal-400" />
          <span>Link Wallet</span>
      </button>
  )}
  ```

---

### OPTIMISASI 1: Pra-pengisian Data Profil dari Akun Google ke Profil Wallet (Onboarding Builder)
* **Lokasi File:** [app/create-profile/page.tsx:L50-L85](file:///Users/macbookpro/Documents/Chainvolio/app/create-profile/page.tsx#L50-L85)
* **Optimisasi:** Ketika seorang Google Builder diarahkan ke halaman `/create-profile` setelah menghubungkan dompet baru mereka, baca data user metadata dari sesi Google Supabase (`supabase.auth.getSession()`) dan gunakan nilai tersebut sebagai nilai awal (*default state*) form.
* **Kode Implementasi:**
  ```typescript
  const { session } = useGoogleAuth(); // Gunakan Google Auth di halaman profil
  
  useEffect(() => {
      if (!publicKey) return;
      // ... fetch profil wallet eksis ...
      // Jika profileExists tetap false, pre-fill menggunakan data google:
      if (session?.user) {
          setForm(prev => ({
              ...prev,
              displayName: prev.displayName || session.user.user_metadata?.full_name || "",
              email: prev.email || session.user.email || "",
              avatarUrl: prev.avatarUrl || session.user.user_metadata?.avatar_url || "",
          }));
      }
  }, [publicKey, session]);
  ```

---

### OPTIMISASI 2: Auto-Prefix Protokol URL pada Tautan Bukti Kerja
* **Lokasi File:** [components/receipt/ReceiptForm.tsx:L128-L131](file:///Users/macbookpro/Documents/Chainvolio/components/receipt/ReceiptForm.tsx#L128-L131)
* **Optimisasi:** Sebelum menyetujui transaksi blockchain, lakukan format otomatis terhadap tautan bukti kerja yang tidak memiliki prefiks protokol `http://` atau `https://` agar tidak memicu error penolakan di sisi server API:
  ```typescript
  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      // Auto-prefix URLs
      const formattedLinks = form.evidenceLinks.map(link => {
          let url = link.url.trim();
          if (url && !/^https?:\/\//i.test(url)) {
              url = `https://${url}`;
          }
          return { ...link, url };
      });
      
      setForm(prev => ({ ...prev, evidenceLinks: formattedLinks }));
      setShowConfirm(true);
  };
  ```

---

## 8. KESIMPULAN AUDIT V2

Pondasi integrasi dompet Solana Web3 pada platform ChainVolio sudah mengimplementasikan penanganan MV3 Chrome Extensions dan in-app mobile deep-linking yang sangat baik. Namun, platform ini memiliki tantangan transisi identitas Web2-Web3 (hybrid authentication) yang cukup besar.

Dengan memperbaiki **BUG 1 (Intersep Modal Dompet)**, menyinkronkan data profil Google ke form pembuatan profil dompet (**Optimisasi 1**), dan membersihkan bendera penguncian seluler (**BUG 3**), ChainVolio dapat menghadirkan pengalaman pengguna Web3 yang mulus, andal, tanpa hambatan login, dan minim dari transaksi yang gagal.
