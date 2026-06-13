# CV Banbuk Store

CV Banbuk Store adalah aplikasi e-commerce berbasis web untuk katalog produk CV Banbuk Mandiri Jaya. Aplikasi ini menggabungkan katalog produk, wishlist, inquiry sales, dashboard role-based, checkout customer, payment gateway Midtrans, dan pembayaran crypto berbasis Ethereum.

Project ini dibuat dengan Next.js App Router, Prisma, NextAuth, Tailwind CSS, Midtrans Snap, ethers.js, dan smart contract Solidity.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white)
![Ethereum](https://img.shields.io/badge/Ethereum-3C3C3D?style=flat&logo=ethereum&logoColor=white)
![Midtrans](https://img.shields.io/badge/Midtrans-Payment-blue?style=flat)

## Ringkasan Aplikasi

Aplikasi ini memiliki empat area utama:

- Katalog produk untuk melihat produk, mencari, memfilter, membandingkan, dan membuka detail produk.
- Customer commerce flow untuk wishlist, keranjang, checkout, inquiry, dan riwayat transaksi.
- Operational dashboard untuk admin dan sales agar inquiry, produk, stok, dan laporan bisa dipantau.
- Payment flow dengan tiga pilihan: Midtrans, Ethereum wallet, dan pembayaran manual untuk pencatatan internal.

Secara bisnis, aplikasi ini memisahkan tugas setiap role:

- Customer membeli produk dan mengirim inquiry.
- Sales hanya menangani follow-up inquiry yang ditugaskan.
- Admin mengelola produk, user sales, assignment inquiry, laporan, dan monitoring transaksi.

Sales dan admin tidak memiliki flow checkout customer. Ini sengaja dibuat agar role operasional tidak bisa membeli barang dari dashboard kerja mereka.

## Fitur Utama

### Katalog Produk

- Menampilkan produk dalam grid responsive.
- Desktop katalog menampilkan empat produk per baris pada viewport besar.
- Search produk berdasarkan nama, deskripsi, bahan, dan ukuran.
- Filter produk berdasarkan bahan.
- Sort produk berdasarkan urutan katalog, harga terendah, harga tertinggi, dan stok terbanyak.
- Card produk menampilkan gambar, status stok, harga, bahan, ukuran, dan action sesuai role.
- Admin mendapat link edit produk langsung dari card.
- Sales dan admin bisa melihat katalog tanpa akses keranjang atau checkout.

### Detail Produk

- Tampilan gambar produk full-bleed pada hero, thumbnail, dan section spesifikasi.
- Ringkasan produk lengkap: nama, deskripsi, material, ukuran, stok, dan harga.
- Status stok otomatis menandai produk dengan stok terbatas.
- Customer bisa menambah produk ke keranjang, menyimpan wishlist, dan lanjut checkout.
- Role admin dan sales diarahkan ke dashboard/inquiry, bukan checkout.

### Compare Produk

- Customer atau pengunjung bisa memilih maksimal dua produk untuk dibandingkan.
- Produk yang dipilih disimpan di `localStorage` dengan key `compare-products`.
- Halaman compare menampilkan dua slot produk aktif.
- Tabel perbandingan memuat harga, stok, bahan, ukuran, dan deskripsi.
- Daftar produk pada halaman compare dibuat compact dengan grid empat kolom di layar besar.

### Keranjang

- Keranjang menggunakan `localStorage` dengan key `banbuk-cart`.
- Customer dan guest bisa memasukkan produk ke keranjang dari katalog atau detail produk.
- Jika user belum login, checkout tetap harus diarahkan ke login/customer flow.
- Admin dan sales tidak mendapat akses action keranjang.

### Wishlist

- Wishlist hanya untuk akun customer.
- Customer bisa menyimpan dan menghapus produk dari wishlist.
- Wishlist tersimpan di database dan terhubung ke user login.
- Admin dan sales tidak memiliki menu wishlist karena bukan bagian tugas operasional mereka.

### Inquiry

Inquiry adalah fitur untuk bertanya atau meminta follow-up produk sebelum membeli. Contohnya customer ingin bertanya warna, ukuran, ketersediaan stok, pengiriman, atau detail custom.

Alur inquiry:

1. Customer mengirim inquiry dari produk.
2. Inquiry masuk dengan status `PENDING`.
3. Admin melihat seluruh inquiry dan menugaskan salah satu sales.
4. Sales hanya melihat inquiry yang ditugaskan kepadanya.
5. Sales melakukan follow-up, bisa membuka WhatsApp customer dari halaman inquiry.
6. Sales mengubah status menjadi `DIPROSES` atau `SELESAI`.
7. Customer bisa memantau progres inquiry miliknya.

Status inquiry yang dipakai:

- `PENDING`: inquiry baru atau belum ditangani.
- `DIPROSES`: sales sedang melakukan follow-up.
- `SELESAI`: inquiry sudah selesai ditangani.

### Dashboard Role-Based

Dashboard akan berubah sesuai role user yang login.

Admin dashboard:

- Total produk.
- Total inquiry.
- Inquiry pending.
- Produk stok rendah.
- Total transaksi dan revenue completed.
- Produk populer berdasarkan jumlah inquiry.
- Snapshot stok produk.
- Chart revenue dan movement stok.
- Export laporan produk ke CSV.
- Export laporan inquiry ke CSV.
- Export ringkasan dashboard ke PDF.
- Shortcut tambah produk dan kelola inquiry.

Sales dashboard:

- Jumlah inquiry assigned.
- Inquiry pending milik sales tersebut.
- Inquiry selesai.
- Ringkasan assignment terbaru.
- Prioritas follow-up.
- Shortcut ke halaman inquiry dan katalog.
- Tidak ada wishlist, cart, atau checkout.

Customer dashboard:

- Ringkasan profil customer.
- Jumlah inquiry customer.
- Jumlah wishlist.
- Jumlah pesanan/transaksi.
- Wishlist terbaru.
- Transaksi terbaru.
- Inquiry terbaru.
- Shortcut ke katalog dan wishlist.

### Product Management

- Admin dapat menambah produk baru.
- Admin dapat mengedit produk.
- Admin dapat menghapus produk melalui API.
- Field produk meliputi nama, harga, stok, deskripsi, material, ukuran, dan gambar.
- Gambar produk bisa memakai URL asli atau fallback dummy image yang realistis dari `public/products`.

### Pembayaran

Aplikasi menyediakan tiga metode pembayaran pada halaman checkout customer.

Midtrans gateway:

- Memakai Midtrans Snap.
- Mendukung channel yang disediakan Midtrans, seperti bank transfer, e-wallet, QRIS, kartu, dan retail channel sesuai konfigurasi akun Midtrans.
- Membuat transaksi database dengan status `PENDING`.
- Webhook Midtrans memperbarui status menjadi `COMPLETED`, `FAILED`, atau tetap `PENDING`.
- Stok produk berkurang saat pembayaran Midtrans sudah completed.

Crypto Ethereum:

- Memakai MetaMask dan ethers.js.
- Frontend membaca konfigurasi network dari env, misalnya Sepolia atau Ethereum Mainnet.
- Smart contract `ProductPayment` menerima pembayaran ETH lewat fungsi `payProduct`.
- Setelah transaksi on-chain sukses, aplikasi mencatat transaksi ke database dengan `paymentType` `CRYPTO`.
- Hash transaksi dan wallet address customer disimpan di tabel transaksi.
- Nominal ETH saat ini dibuat fixed untuk demo checkout, yaitu `0.001 ETH`, sementara UI tetap menampilkan estimasi harga produk dalam rupiah.

Manual payment:

- Dipakai untuk simulasi atau pencatatan internal.
- Customer klik bayar, transaksi langsung dicatat sebagai `COMPLETED`.
- Stok produk langsung berkurang satu unit.

## Role dan Hak Akses

| Role | Fungsi Utama | Boleh | Tidak Boleh |
| --- | --- | --- | --- |
| Guest | Melihat katalog | Lihat produk, compare, tambah cart lokal | Checkout final, wishlist database, inquiry |
| Customer | Pembeli | Wishlist, cart, checkout, inquiry, riwayat transaksi | Kelola produk, assign sales, update inquiry sales |
| Sales | Follow-up customer | Lihat katalog, lihat inquiry assigned, update status inquiry, buka WhatsApp follow-up | Checkout, wishlist, cart, assign inquiry, kelola produk |
| Admin | Operasional dan monitoring | CRUD produk, lihat semua inquiry, assign sales, lihat user sales, laporan, statistik | Checkout sebagai customer, wishlist customer |

Catatan penting:

- Registrasi publik selalu membuat user dengan role `CUSTOMER`.
- Role `ADMIN` dan `SALES` dibuat lewat seed/database, bukan dari form registrasi publik.
- API tetap melakukan validasi role di server, jadi pembatasan akses tidak hanya bergantung pada UI.

## Alur Pemakaian

### Customer

1. Register atau login sebagai customer.
2. Buka halaman `/products` untuk melihat katalog.
3. Gunakan search, filter bahan, atau sort produk.
4. Buka detail produk untuk melihat informasi lengkap.
5. Simpan ke wishlist jika ingin menandai produk.
6. Tambahkan ke keranjang atau langsung checkout.
7. Pilih metode pembayaran: Midtrans, Ethereum, atau manual.
8. Pantau pesanan, wishlist, dan inquiry dari dashboard customer.

### Customer Inquiry

1. Buka detail produk.
2. Kirim inquiry jika ingin bertanya dulu sebelum membeli.
3. Tunggu admin assign inquiry ke sales.
4. Pantau status inquiry dari halaman `/inquiry` atau dashboard.
5. Sales akan melakukan follow-up, termasuk lewat WhatsApp jika dikonfigurasi.

### Sales

1. Login sebagai sales.
2. Buka dashboard untuk melihat ringkasan pekerjaan.
3. Buka `/inquiry` untuk melihat inquiry yang assigned ke akun sales tersebut.
4. Hubungi customer melalui action WhatsApp.
5. Ubah status inquiry menjadi `DIPROSES` atau `SELESAI`.
6. Sales bisa melihat katalog sebagai referensi produk, tetapi tidak bisa checkout.

### Admin

1. Login sebagai admin.
2. Buka dashboard untuk memantau produk, inquiry, stok, transaksi, dan laporan.
3. Tambah atau edit produk dari halaman produk.
4. Buka `/inquiry` untuk melihat semua inquiry.
5. Assign inquiry ke sales yang tersedia.
6. Export laporan produk, inquiry, atau ringkasan dashboard jika dibutuhkan.

## Demo Account

Seed database menyediakan akun demo berikut:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@test.com` | `admin123` |
| Sales | `sales@test.com` | `sales123` |
| Customer | `customer@test.com` | `customer123` |

Seed juga membuat beberapa produk awal, dua inquiry contoh, dan wishlist customer.

## Tech Stack

Frontend:

- Next.js 14 App Router.
- React 18.
- TypeScript.
- Tailwind CSS.
- GSAP untuk beberapa animasi UI.
- Recharts untuk chart dashboard.
- jsPDF untuk export PDF.

Backend:

- Next.js Route Handlers.
- NextAuth credentials provider.
- Prisma ORM.
- PostgreSQL sesuai schema Prisma saat ini.
- bcryptjs untuk hashing password.

Payment dan Web3:

- Midtrans Snap dan Midtrans Core API.
- ethers.js v6.
- MetaMask wallet.
- Solidity 0.8.19.
- Hardhat untuk compile dan deploy contract.

## Struktur Project

```text
app/
  api/                         Route handler untuk auth, produk, inquiry, payment, stats, transaction, users, wishlist
  dashboard/                   Dashboard role-based
  inquiry/                     Halaman inquiry customer, sales, admin
  products/                    Katalog, add/edit/detail/compare/payment
  login/                       Login NextAuth credentials
  register/                    Registrasi customer
components/                    Komponen UI, navbar, payment, product image, cart drawer
contracts/                     Smart contract Solidity
lib/                           Auth config, Prisma client, Midtrans helper
prisma/                        Schema, migration, seed
public/products/               Dummy product images
scripts/                       Script deploy/check contract
types/                         Type augmentation NextAuth dan Midtrans
```

## Database

Schema utama berada di `prisma/schema.prisma`.

Model yang dipakai:

- `User`: akun admin, sales, customer.
- `Product`: data produk katalog.
- `Inquiry`: pertanyaan/follow-up customer terhadap produk.
- `Wishlist`: produk favorit customer.
- `Transaction`: riwayat pembayaran Midtrans, crypto, dan manual.

Relasi penting:

- `User` customer memiliki banyak inquiry, wishlist, dan transaksi.
- `User` sales bisa mendapat banyak inquiry melalui relasi `assignedTo`.
- `Product` terhubung ke inquiry, wishlist, dan transaksi.
- `Inquiry` menyimpan `userId`, `productId`, dan opsional `assignedTo` untuk sales.

Project saat ini memakai datasource PostgreSQL:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DATABASE_URL_UNPOOLED")
}
```

Jika memakai Neon, Supabase, Railway, atau PostgreSQL lokal, isi `DATABASE_URL` dan `DATABASE_URL_UNPOOLED`. Jika provider tidak membutuhkan connection pooling terpisah, `DATABASE_URL_UNPOOLED` bisa memakai nilai yang sama dengan `DATABASE_URL`.

## Environment Variables

Buat file `.env` dari `.env.example`, lalu sesuaikan nilainya.

```bash
cp .env.example .env
```

Variabel wajib untuk aplikasi dasar:

| Variable | Keterangan |
| --- | --- |
| `DATABASE_URL` | URL database PostgreSQL utama. |
| `DATABASE_URL_UNPOOLED` | URL direct connection untuk Prisma migration/generate. |
| `NEXTAUTH_SECRET` | Secret NextAuth minimal 32 karakter. |
| `NEXTAUTH_URL` | URL aplikasi, contoh lokal `http://localhost:3000`. |

Variabel Midtrans:

| Variable | Keterangan |
| --- | --- |
| `MIDTRANS_IS_PRODUCTION` | `false` untuk sandbox, `true` untuk production. |
| `MIDTRANS_SERVER_KEY` | Server key dari dashboard Midtrans. |
| `NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION` | Harus sinkron dengan mode Midtrans frontend. |
| `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` | Client key untuk Midtrans Snap. |

Variabel Ethereum/Web3:

| Variable | Keterangan |
| --- | --- |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Address contract `ProductPayment` setelah deploy. |
| `NEXT_PUBLIC_CHAIN_ID` | Chain ID, contoh Sepolia `11155111`. |
| `NEXT_PUBLIC_CHAIN_NAME` | Nama network, contoh `Sepolia Testnet`. |
| `NEXT_PUBLIC_CHAIN_CURRENCY_SYMBOL` | Simbol native currency, contoh `ETH`. |
| `NEXT_PUBLIC_RPC_URL` | RPC URL frontend untuk network Ethereum. |
| `SEPOLIA_RPC_URL` | RPC URL untuk deploy contract ke Sepolia. |
| `MAINNET_RPC_URL` | RPC URL untuk deploy contract ke Ethereum Mainnet. |
| `PRIVATE_KEY` | Private key wallet deploy contract. Jangan commit nilai ini. |

Variabel WhatsApp:

| Variable | Keterangan |
| --- | --- |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Nomor WhatsApp bisnis, format `628123456789`. |

Generate `NEXTAUTH_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Instalasi Lokal

Prerequisite:

- Node.js 18 atau lebih baru.
- npm.
- Database PostgreSQL.
- Akun Midtrans sandbox jika ingin menguji payment gateway.
- MetaMask dan RPC Ethereum jika ingin menguji payment crypto.

Langkah setup:

```bash
git clone https://github.com/rhmatzeka/CVBanbukStore.git
cd CVBanbukStore
npm install
cp .env.example .env
```

Edit `.env`, minimal isi:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
DATABASE_URL_UNPOOLED="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
NEXTAUTH_SECRET="secret-minimal-32-karakter"
NEXTAUTH_URL="http://localhost:3000"
```

Generate Prisma client, jalankan migration, dan seed data:

```bash
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

Jalankan development server:

```bash
npm run dev
```

Buka aplikasi:

```text
http://localhost:3000
```

## Script NPM

| Command | Fungsi |
| --- | --- |
| `npm run dev` | Menjalankan Next.js development server. |
| `npm run build` | Generate Prisma client lalu build production Next.js. |
| `npm run start` | Menjalankan build production. |
| `npm run lint` | Menjalankan lint Next.js. |
| `npm run postinstall` | Generate Prisma client setelah install dependency. |

## Smart Contract Ethereum

Contract berada di:

```text
contracts/ProductPayment.sol
```

Fungsi utama contract:

- `payProduct(uint256 _productId)`: menerima pembayaran ETH untuk produk.
- `getBalance()`: melihat balance ETH pada contract.
- `getPayment(uint256 _paymentId)`: melihat detail pembayaran yang tersimpan.
- `withdraw()`: owner menarik seluruh ETH dari contract.
- `transferOwnership(address newOwner)`: mengganti owner contract.

Compile contract:

```bash
npx hardhat compile
```

Deploy ke Sepolia:

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

Deploy ke Ethereum Mainnet:

```bash
npx hardhat run scripts/deploy.js --network mainnet
```

Setelah deploy, salin address contract ke:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS="0x..."
```

Lalu restart aplikasi.

Catatan keamanan:

- Jangan commit `PRIVATE_KEY`.
- Untuk production, pakai wallet deploy khusus dan batasi dana di wallet tersebut.
- Uji di Sepolia sebelum Mainnet.
- Pastikan network MetaMask sama dengan `NEXT_PUBLIC_CHAIN_ID`.

## API Endpoints

### Auth

| Method | Endpoint | Akses | Fungsi |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Public | Register user baru sebagai customer. |
| `GET/POST` | `/api/auth/[...nextauth]` | Public | NextAuth login/logout/session. |

### Products

| Method | Endpoint | Akses | Fungsi |
| --- | --- | --- | --- |
| `GET` | `/api/products` | Public | Ambil semua produk. |
| `POST` | `/api/products` | Admin | Tambah produk. |
| `GET` | `/api/products/[id]` | Public | Ambil detail produk. |
| `PUT` | `/api/products/[id]` | Admin | Update produk. |
| `DELETE` | `/api/products/[id]` | Admin | Hapus produk. |

### Inquiry

| Method | Endpoint | Akses | Fungsi |
| --- | --- | --- | --- |
| `GET` | `/api/inquiry` | Login | Ambil inquiry sesuai role. |
| `POST` | `/api/inquiry` | Customer | Buat inquiry baru. |
| `PUT` | `/api/inquiry/[id]` | Admin/Sales | Admin assign sales, sales update status inquiry miliknya. |

### Wishlist

| Method | Endpoint | Akses | Fungsi |
| --- | --- | --- | --- |
| `GET` | `/api/wishlist` | Customer | Ambil wishlist customer. |
| `POST` | `/api/wishlist` | Customer | Tambah produk ke wishlist. |
| `DELETE` | `/api/wishlist?productId=...` | Customer | Hapus produk dari wishlist. |

### Transaction

| Method | Endpoint | Akses | Fungsi |
| --- | --- | --- | --- |
| `GET` | `/api/transaction` | Admin/Customer | Admin melihat semua transaksi, customer melihat transaksi sendiri. |
| `POST` | `/api/transaction` | Customer | Membuat transaksi manual atau crypto. |

### Dashboard dan Users

| Method | Endpoint | Akses | Fungsi |
| --- | --- | --- | --- |
| `GET` | `/api/stats` | Login | Mengambil statistik sesuai role. |
| `GET` | `/api/users?role=SALES` | Admin | Mengambil user, biasanya untuk daftar sales assignment. |

### Midtrans

| Method | Endpoint | Akses | Fungsi |
| --- | --- | --- | --- |
| `POST` | `/api/payment/midtrans/create` | Customer | Membuat transaksi Midtrans Snap. |
| `POST` | `/api/payment/midtrans/notification` | Midtrans webhook | Menerima notifikasi status pembayaran. |
| `GET` | `/api/payment/midtrans/status/[orderId]` | Customer/Admin | Cek status transaksi Midtrans. |

## Deployment Vercel

Checklist deploy:

1. Push repository ke GitHub.
2. Import repository ke Vercel.
3. Set environment variable di Vercel sesuai bagian Environment Variables.
4. Pastikan `DATABASE_URL` dan `DATABASE_URL_UNPOOLED` mengarah ke database production.
5. Pastikan `NEXTAUTH_URL` memakai domain Vercel atau custom domain production.
6. Jalankan migration database production sebelum traffic production dipakai.
7. Jika memakai Midtrans, set notification URL ke endpoint production:

```text
https://DOMAIN-APLIKASI/api/payment/midtrans/notification
```

8. Jika memakai crypto payment, deploy contract dan isi `NEXT_PUBLIC_CONTRACT_ADDRESS`.
9. Redeploy setelah environment variable berubah.

Untuk migration production, gunakan environment database production lalu jalankan:

```bash
npx prisma migrate deploy
```

## Testing Manual

### Smoke Test Dasar

1. Buka homepage.
2. Buka katalog `/products`.
3. Coba search dan filter bahan.
4. Buka detail salah satu produk.
5. Buka compare `/products/compare` dan pilih dua produk.
6. Login sebagai customer.
7. Simpan produk ke wishlist.
8. Buat inquiry produk.
9. Checkout manual dan pastikan transaksi muncul di dashboard customer.

### Test Role Admin

1. Login `admin@test.com`.
2. Buka dashboard dan cek statistik.
3. Tambah produk baru.
4. Edit produk.
5. Buka inquiry dan assign inquiry ke sales.
6. Export CSV/PDF dari dashboard.

### Test Role Sales

1. Login `sales@test.com`.
2. Pastikan dashboard sales tidak menampilkan wishlist/cart/checkout.
3. Buka inquiry dan pastikan hanya inquiry assigned yang tampil.
4. Ubah status inquiry.
5. Coba buka katalog dan pastikan hanya mode lihat/reference, bukan belanja.

### Test Role Customer

1. Login `customer@test.com`.
2. Buka katalog dan detail produk.
3. Tambah wishlist.
4. Tambah keranjang.
5. Buat inquiry.
6. Checkout manual.
7. Jika Midtrans dikonfigurasi, test sandbox payment.
8. Jika contract dikonfigurasi, test pembayaran ETH di Sepolia.

### Checklist UI Responsive

- Katalog tetap rapi di desktop, tablet, dan mobile.
- Card produk tidak saling memotong teks.
- Gambar produk full pada detail dan compare.
- Halaman inquiry compact dan tombol terlihat sebagai button.
- Halaman payment tidak memakai elemen terlalu besar di mobile.
- Navbar dan logo konsisten di semua halaman.

## Troubleshooting

### Prisma gagal generate karena env database

Pastikan `.env` memiliki `DATABASE_URL` dan `DATABASE_URL_UNPOOLED`. Jika memakai satu URL database saja, isi keduanya dengan nilai yang sama.

### Login gagal setelah seed

Jalankan ulang seed:

```bash
npx prisma db seed
```

Perlu diingat, seed menghapus data lama lalu membuat ulang user, produk, inquiry, dan wishlist demo.

### Midtrans tidak muncul

Pastikan variable berikut sudah diisi dan app sudah direstart:

```env
MIDTRANS_SERVER_KEY="..."
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY="..."
MIDTRANS_IS_PRODUCTION="false"
NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION="false"
```

Untuk sandbox, gunakan credential sandbox dari dashboard Midtrans.

### MetaMask gagal checkout

Cek hal berikut:

- `NEXT_PUBLIC_CONTRACT_ADDRESS` sudah diisi.
- MetaMask berada di network yang sama dengan `NEXT_PUBLIC_CHAIN_ID`.
- Wallet punya saldo ETH cukup untuk nominal checkout dan gas fee.
- Contract sudah berhasil deploy ke network tersebut.

### Sales tidak bisa checkout

Itu perilaku yang benar. Sales adalah role follow-up inquiry, bukan pembeli. Checkout hanya untuk customer.

## Catatan Pengembangan

- Jaga rule role-based di UI dan API server sekaligus.
- Jangan menambahkan akses checkout ke admin atau sales.
- Jika menambah payment method baru, simpan transaksi ke model `Transaction` dengan `paymentType` yang jelas.
- Jika menambah status inquiry baru, update UI badge, dashboard count, dan dokumentasi status.
- Jika mengubah schema Prisma, update migration dan README bagian database.

## Repository

GitHub:

```text
https://github.com/rhmatzeka/CVBanbukStore.git
```
