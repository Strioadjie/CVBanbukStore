# Virtual Product Gallery Web3 - CV Banbuk Mandiri Jaya

Platform modern untuk pengelolaan produk dan penjualan dengan dukungan pembayaran cryptocurrency (Ethereum).

## 🚀 Fitur Utama

### 👥 3 Role User
- **ADMIN**: Kelola produk, user, inquiry, dan lihat laporan
- **SALES**: Kelola inquiry yang di-assign, update status, hubungi customer
- **CUSTOMER**: Lihat produk, wishlist, inquiry, dan pembayaran

### 🛍️ Fitur Produk
- CRUD produk (Admin)
- Katalog produk dengan detail lengkap
- Wishlist untuk customer
- Sistem inquiry
- Produk terpopuler berdasarkan inquiry

### 💰 Pembayaran
- Pembayaran regular
- Pembayaran dengan Ethereum (ETH)
- Integrasi MetaMask
- Smart Contract di Sepolia Testnet

### 📊 Dashboard
- Dashboard Admin: statistik lengkap, produk terpopuler, revenue
- Dashboard Sales: inquiry yang ditangani
- Dashboard Customer: inquiry, wishlist, transaksi

## 🧱 Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- NextAuth.js (Authentication)

### Backend
- Next.js API Routes
- Prisma ORM
- SQLite Database

### Web3
- Solidity (Smart Contract)
- Hardhat (Development Framework)
- ethers.js (Web3 Library)
- MetaMask Integration

## 📦 Instalasi

### 1. Clone & Install Dependencies

```bash
# Install dependencies untuk Next.js
npm install

# Install dependencies untuk Hardhat (smart contract)
cd contracts
npm install
cd ..
```

### 2. Setup Environment Variables

Buat file `.env` di root project:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="ganti-dengan-random-string-panjang"
NEXTAUTH_URL="http://localhost:3000"

# Web3 Configuration (isi setelah deploy contract)
NEXT_PUBLIC_CONTRACT_ADDRESS=""
NEXT_PUBLIC_RPC_URL="https://sepolia.infura.io/v3/YOUR_INFURA_KEY"
PRIVATE_KEY="your-wallet-private-key"

# WhatsApp
NEXT_PUBLIC_WHATSAPP_NUMBER="62XXXXXXXXXX"
```

**Cara mendapatkan Infura Key:**
1. Daftar di https://infura.io
2. Buat project baru
3. Copy API Key untuk Sepolia

**Cara mendapatkan Private Key:**
1. Buka MetaMask
2. Klik 3 titik > Account Details > Export Private Key
3. ⚠️ JANGAN SHARE PRIVATE KEY KE SIAPAPUN!

### 3. Setup Database

```bash
# Generate Prisma Client
npx prisma generate

# Jalankan migration
npx prisma migrate dev --name init

# (Optional) Buka Prisma Studio untuk lihat database
npx prisma studio
```

### 4. Seed Database (Optional)

Buat file `prisma/seed.ts` untuk data dummy:

```bash
npx prisma db seed
```

## 🔐 Deploy Smart Contract

### 1. Compile Contract

```bash
npx hardhat compile
```

### 2. Deploy ke Sepolia Testnet

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

Output akan menampilkan contract address. Copy dan paste ke `.env`:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS="0xYourContractAddress"
```

### 3. Verify Contract (Optional)

```bash
npx hardhat verify --network sepolia YOUR_CONTRACT_ADDRESS
```

## 🏃 Menjalankan Aplikasi

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

Buka browser: http://localhost:3000

## 👤 Demo Accounts

Setelah setup, buat user dengan role berbeda:

**Admin:**
- Email: admin@test.com
- Password: admin123

**Sales:**
- Email: sales@test.com
- Password: sales123

**Customer:**
- Email: customer@test.com
- Password: customer123

## 💳 Testing Pembayaran Crypto

### 1. Install MetaMask

Download: https://metamask.io

### 2. Switch ke Sepolia Testnet

1. Buka MetaMask
2. Klik network dropdown
3. Enable "Show test networks"
4. Pilih "Sepolia"

### 3. Dapatkan Sepolia ETH (Gratis)

Kunjungi faucet:
- https://sepolia-faucet.pk910.de
- https://sepoliafaucet.com

### 4. Test Pembayaran

1. Login sebagai Customer
2. Pilih produk
3. Klik "Beli"
4. Klik "Connect MetaMask"
5. Approve connection
6. Klik "Bayar Sekarang"
7. Confirm transaksi di MetaMask
8. Tunggu konfirmasi

## 📱 Fitur WhatsApp

Sales bisa hubungi customer via WhatsApp dengan format:

```
https://wa.me/62XXXXXXXXXX?text=Saya%20tertarik%20produk%20[NAMA_PRODUK]
```

Ganti nomor di `.env`:

```env
NEXT_PUBLIC_WHATSAPP_NUMBER="628123456789"
```

## 📁 Struktur Project

```
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── dashboard/         # Dashboard pages
│   ├── products/          # Product pages
│   ├── login/             # Auth pages
│   └── ...
├── components/            # React Components
├── contracts/             # Smart Contracts (Solidity)
├── scripts/               # Deployment scripts
├── lib/                   # Utilities
├── prisma/                # Database schema
└── types/                 # TypeScript types
```

## 🔧 Troubleshooting

### Database Error

```bash
# Reset database
rm prisma/dev.db
npx prisma migrate reset
```

### Contract Deployment Error

```bash
# Pastikan ada balance di wallet
# Cek RPC URL di .env
# Cek private key valid
```

### MetaMask Connection Error

- Pastikan MetaMask terinstall
- Switch ke Sepolia network
- Refresh halaman

## 📚 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Hardhat Docs](https://hardhat.org/docs)
- [ethers.js Docs](https://docs.ethers.org)
- [Solidity Docs](https://docs.soliditylang.org)

## 🤝 Support

Untuk pertanyaan atau bantuan, hubungi:
- Email: support@banbuk.com
- WhatsApp: +62XXXXXXXXXX

## 📄 License

MIT License - CV Banbuk Mandiri Jaya

---

**Dibuat dengan ❤️ untuk CV Banbuk Mandiri Jaya**
