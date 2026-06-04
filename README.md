# 🛍️ Virtual Product Gallery Web3

Platform e-commerce modern untuk **CV Banbuk Mandiri Jaya** dengan dukungan pembayaran cryptocurrency.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white)
![Ethereum](https://img.shields.io/badge/Ethereum-3C3C3D?style=flat&logo=ethereum&logoColor=white)

---

## ✨ Features

### 👥 3 Role User
- **Admin** - Full access (kelola produk, user, inquiry, laporan)
- **Sales** - Kelola inquiry, hubungi customer via WhatsApp
- **Customer** - Lihat produk, wishlist, inquiry, pembayaran

### 💰 Payment Methods
- 💳 **Payment Gateway** (Midtrans) - Bank Transfer, E-Wallet, QRIS, dll
- 🔐 **Crypto Payment** (Ethereum) - MetaMask, network configurable (Sepolia/Mainnet)
- 💵 **Manual Payment** - Simulasi untuk testing

### 🎯 Core Features
- ✅ Product Management (CRUD)
- ✅ Inquiry System dengan assignment ke sales
- ✅ Wishlist
- ✅ Dashboard dengan statistik
- ✅ WhatsApp Integration
- ✅ Smart Contract di network yang bisa dikonfigurasi

### 🎨 UI & Experience
- ✅ Katalog produk dengan kartu 4 kolom di desktop dan layout mobile responsif
- ✅ Halaman compare produk dengan gambar penuh, pilihan compact, dan tabel rincian
- ✅ Halaman inquiry role-based untuk customer, sales, dan admin
- ✅ Checkout payment yang ringkas untuk Midtrans, ETH, dan manual payment
- ✅ Branding CV Banbuk Store dengan navbar dan logo konsisten

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm atau yarn

### Installation

```bash
# 1. Clone repository
git clone https://github.com/rhmatzeka/CVBanbukStore.git
cd CVBanbukStore

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# Edit .env dan isi NEXTAUTH_SECRET

# 4. Setup database
npx prisma generate
npx prisma migrate dev
npx prisma db seed

# 5. Run development server
npm run dev
```

Buka http://localhost:3000

### Demo Accounts

```
Admin:    admin@test.com    / admin123
Sales:    sales@test.com    / sales123
Customer: customer@test.com / customer123
```

---

## 🧱 Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- NextAuth.js

**Backend:**
- Next.js API Routes
- Prisma ORM
- SQLite (dev) / MySQL (prod)

**Web3:**
- Solidity 0.8.19
- Hardhat
- ethers.js v6
- MetaMask

---

## 📦 Project Structure

```
├── app/                    # Next.js pages & API routes
├── components/             # React components
├── contracts/              # Smart contracts (Solidity)
├── scripts/                # Deployment scripts
├── lib/                    # Utilities & config
├── prisma/                 # Database schema & migrations
└── types/                  # TypeScript types
```

---

## 🔐 Smart Contract

**Contract Address (contoh Sepolia):**
```
0xd23F22620160b0f05D16eba0F9D7D979709bA44D
```

**View on Etherscan:**
https://sepolia.etherscan.io/address/0xd23F22620160b0f05D16eba0F9D7D979709bA44D

### Deploy Contract

```bash
# Compile
npx hardhat compile

# Deploy to Sepolia
npx hardhat run scripts/deploy.js --network sepolia

# Deploy to Ethereum Mainnet
npx hardhat run scripts/deploy.js --network mainnet
```

---

## 🌐 Environment Variables

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Web3 (Optional - untuk crypto payment)
NEXT_PUBLIC_CONTRACT_ADDRESS="0x..."
NEXT_PUBLIC_CHAIN_ID="11155111"
NEXT_PUBLIC_CHAIN_NAME="Sepolia Testnet"
NEXT_PUBLIC_CHAIN_CURRENCY_SYMBOL="ETH"
NEXT_PUBLIC_RPC_URL="https://ethereum-sepolia-rpc.publicnode.com"
SEPOLIA_RPC_URL="https://ethereum-sepolia-rpc.publicnode.com"
MAINNET_RPC_URL="https://ethereum-rpc.publicnode.com"
PRIVATE_KEY="your-private-key"

# Midtrans (Optional - untuk payment gateway)
MIDTRANS_SERVER_KEY="your-server-key"
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY="your-client-key"

# WhatsApp
NEXT_PUBLIC_WHATSAPP_NUMBER="628123456789"
```

---

## 📱 Screenshots

### Homepage
Landing page dengan informasi produk dan fitur

### Dashboard
Dashboard berbeda untuk setiap role (Admin, Sales, Customer)

### Product Catalog
Katalog produk dengan filter dan search

### Product Compare
Bandingkan dua produk dengan kartu compact dan rincian spesifikasi

### Inquiry
Riwayat inquiry customer, assignment admin, dan status follow-up sales

### Crypto Payment
Pembayaran dengan MetaMask dan Ethereum

---

## 🧪 Testing

### Manual Payment (Tanpa Setup)
1. Login sebagai customer
2. Pilih produk → Beli
3. Pilih "Manual Payment"
4. Klik "Bayar Sekarang"

### Crypto Payment (Perlu Setup)
1. Install MetaMask
2. Set `.env` ke network target yang dipakai aplikasi
3. Switch MetaMask ke network yang sama
4. Connect wallet & bayar

### UI Regression Checklist
1. Cek katalog desktop menampilkan 4 produk per baris
2. Cek compare product image tetap penuh dan tidak kepotong aneh
3. Cek inquiry tidak melebar kosong dan tombol detail terlihat seperti button
4. Cek payment ETH menampilkan tombol bayar yang jelas di panel gelap
5. Cek tampilan mobile untuk katalog, compare, inquiry, dan checkout

---

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/[...nextauth]` - Login/Logout

### Products
- `GET /api/products` - List products
- `POST /api/products` - Create product (Admin)
- `GET /api/products/[id]` - Get product
- `PUT /api/products/[id]` - Update product (Admin)
- `DELETE /api/products/[id]` - Delete product (Admin)

### Inquiry
- `GET /api/inquiry` - List inquiries (role-based)
- `POST /api/inquiry` - Create inquiry
- `PUT /api/inquiry/[id]` - Update inquiry

### Transactions
- `GET /api/transaction` - List transactions
- `POST /api/transaction` - Create transaction

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Developer

**Rahmat Eka**
- GitHub: [@rhmatzeka](https://github.com/rhmatzeka)
- Project: CV Banbuk Mandiri Jaya

---

## 🙏 Acknowledgments

- Next.js Team
- Prisma Team
- Hardhat Team
- Midtrans
- MetaMask

---

**Dibuat dengan ❤️ untuk CV Banbuk Mandiri Jaya**
