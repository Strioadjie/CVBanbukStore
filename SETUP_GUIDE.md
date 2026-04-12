# 🚀 Setup Guide - Virtual Product Gallery Web3

Panduan lengkap untuk setup project dari awal sampai jalan.

## 📋 Prerequisites

Pastikan sudah terinstall:
- Node.js (v18 atau lebih baru)
- npm atau yarn
- Git
- MetaMask browser extension

## 🔧 Step-by-Step Setup

### 1️⃣ Install Dependencies

```bash
# Install dependencies Next.js
npm install

# Install bcryptjs types
npm install --save-dev @types/bcryptjs
```

### 2️⃣ Setup Environment Variables

Buat file `.env` di root project:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-super-secret-key-min-32-characters-long"
NEXTAUTH_URL="http://localhost:3000"

# Web3 (isi setelah deploy contract)
NEXT_PUBLIC_CONTRACT_ADDRESS=""
NEXT_PUBLIC_RPC_URL="https://sepolia.infura.io/v3/YOUR_INFURA_KEY"
PRIVATE_KEY=""

# WhatsApp
NEXT_PUBLIC_WHATSAPP_NUMBER="628123456789"
```

**Generate NEXTAUTH_SECRET:**
```bash
# Cara 1: Menggunakan openssl
openssl rand -base64 32

# Cara 2: Menggunakan Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 3️⃣ Setup Database

```bash
# Generate Prisma Client
npx prisma generate

# Jalankan migration (buat database)
npx prisma migrate dev --name init

# Seed database dengan data dummy
npx prisma db seed
```

Jika error saat seed, tambahkan di `package.json`:

```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

Install ts-node:
```bash
npm install --save-dev ts-node
```

### 4️⃣ Setup Infura (untuk Web3)

1. Daftar di https://infura.io (gratis)
2. Buat project baru
3. Pilih network: Sepolia
4. Copy API Key
5. Paste ke `.env`:
   ```env
   NEXT_PUBLIC_RPC_URL="https://sepolia.infura.io/v3/YOUR_API_KEY"
   ```

### 5️⃣ Setup MetaMask & Get Testnet ETH

**Install MetaMask:**
1. Download dari https://metamask.io
2. Install extension di browser
3. Buat wallet baru atau import existing

**Switch ke Sepolia Testnet:**
1. Buka MetaMask
2. Klik network dropdown (atas)
3. Enable "Show test networks"
4. Pilih "Sepolia test network"

**Get Private Key (untuk deploy contract):**
1. Buka MetaMask
2. Klik 3 titik > Account Details
3. Export Private Key
4. Masukkan password
5. Copy private key
6. Paste ke `.env`:
   ```env
   PRIVATE_KEY="your-private-key-here"
   ```

⚠️ **PENTING:** Jangan share private key ke siapapun!

**Get Free Sepolia ETH:**

Kunjungi salah satu faucet:
- https://sepolia-faucet.pk910.de (recommended)
- https://sepoliafaucet.com
- https://faucet.quicknode.com/ethereum/sepolia

Paste alamat wallet Anda dan request ETH (gratis).

### 6️⃣ Deploy Smart Contract

```bash
# Compile contract
npx hardhat compile

# Deploy ke Sepolia
npx hardhat run scripts/deploy.js --network sepolia
```

Output akan menampilkan contract address seperti:
```
✅ ProductPayment contract berhasil di-deploy!
📍 Contract Address: 0x1234567890abcdef...
```

Copy contract address dan paste ke `.env`:
```env
NEXT_PUBLIC_CONTRACT_ADDRESS="0x1234567890abcdef..."
```

### 7️⃣ Jalankan Aplikasi

```bash
# Development mode
npm run dev
```

Buka browser: http://localhost:3000

## 🧪 Testing

### Test Login

Gunakan akun demo (dari seed):

**Admin:**
- Email: admin@test.com
- Password: admin123

**Sales:**
- Email: sales@test.com
- Password: sales123

**Customer:**
- Email: customer@test.com
- Password: customer123

### Test Pembayaran Crypto

1. Login sebagai Customer
2. Buka halaman Products
3. Pilih produk
4. Klik "Beli"
5. Pilih "Pembayaran Crypto (ETH)"
6. Klik "Connect MetaMask"
7. Approve connection
8. Klik "Bayar Sekarang"
9. Confirm di MetaMask
10. Tunggu konfirmasi (1-2 menit)

## 🐛 Troubleshooting

### Error: "Module not found: Can't resolve 'bcryptjs'"

```bash
npm install bcryptjs
npm install --save-dev @types/bcryptjs
```

### Error: "Prisma Client not generated"

```bash
npx prisma generate
```

### Error: "Database locked"

```bash
# Tutup Prisma Studio jika terbuka
# Atau restart terminal
rm prisma/dev.db
npx prisma migrate dev
```

### Error: "Contract deployment failed"

Cek:
- Apakah ada balance ETH di wallet?
- Apakah RPC URL benar?
- Apakah private key valid?

```bash
# Cek balance
npx hardhat run scripts/check-balance.js --network sepolia
```

### Error: "MetaMask not detected"

- Pastikan MetaMask extension terinstall
- Refresh halaman
- Coba browser lain (Chrome/Firefox)

### Error: "Wrong network"

- Buka MetaMask
- Switch ke Sepolia Testnet
- Refresh halaman

## 📊 Database Management

### Lihat Database

```bash
# Buka Prisma Studio (GUI)
npx prisma studio
```

### Reset Database

```bash
# Hapus dan buat ulang
rm prisma/dev.db
npx prisma migrate dev
npx prisma db seed
```

### Backup Database

```bash
# Copy file database
cp prisma/dev.db prisma/dev.db.backup
```

## 🔐 Security Checklist

- [ ] Ganti NEXTAUTH_SECRET dengan random string
- [ ] Jangan commit file `.env` ke Git
- [ ] Jangan share private key
- [ ] Gunakan testnet untuk development
- [ ] Validate user input di API routes

## 📚 Next Steps

Setelah setup berhasil:

1. **Customize Design**: Edit Tailwind classes di components
2. **Add Features**: Tambah fitur sesuai kebutuhan
3. **Deploy**: Deploy ke Vercel/Netlify
4. **Production**: Ganti ke mainnet (hati-hati!)

## 🆘 Need Help?

Jika masih ada masalah:

1. Cek error message di console
2. Cek logs di terminal
3. Baca dokumentasi:
   - Next.js: https://nextjs.org/docs
   - Prisma: https://www.prisma.io/docs
   - Hardhat: https://hardhat.org/docs
   - ethers.js: https://docs.ethers.org

## ✅ Checklist Setup

- [ ] Node.js terinstall
- [ ] Dependencies terinstall (`npm install`)
- [ ] File `.env` dibuat dan diisi
- [ ] Database di-migrate (`npx prisma migrate dev`)
- [ ] Database di-seed (`npx prisma db seed`)
- [ ] Infura account dibuat
- [ ] MetaMask terinstall
- [ ] Sepolia ETH didapat
- [ ] Smart contract di-deploy
- [ ] Contract address di-set di `.env`
- [ ] App berjalan (`npm run dev`)
- [ ] Login berhasil
- [ ] Pembayaran crypto berhasil

Jika semua checklist ✅, selamat! Project sudah siap digunakan! 🎉
