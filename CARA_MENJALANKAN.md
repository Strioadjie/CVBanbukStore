# 🎯 CARA MENJALANKAN PROJECT

Panduan singkat untuk menjalankan project dari awal.

## ⚡ Quick Start (5 Menit)

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment

Buat file `.env`:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="ganti-dengan-random-string-minimal-32-karakter"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_CONTRACT_ADDRESS=""
NEXT_PUBLIC_RPC_URL="https://sepolia.infura.io/v3/YOUR_INFURA_KEY"
PRIVATE_KEY=""
NEXT_PUBLIC_WHATSAPP_NUMBER="628123456789"
```

Generate NEXTAUTH_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 3. Setup Database

```bash
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

### 4. Jalankan Aplikasi

```bash
npm run dev
```

Buka: http://localhost:3000

### 5. Login

Gunakan akun demo:
- Admin: admin@test.com / admin123
- Sales: sales@test.com / sales123
- Customer: customer@test.com / customer123

## 🔐 Setup Web3 (Optional)

Jika ingin test pembayaran crypto:

### 1. Daftar Infura

1. Buka https://infura.io
2. Daftar gratis
3. Buat project baru
4. Copy API Key
5. Update `.env`:
   ```env
   NEXT_PUBLIC_RPC_URL="https://sepolia.infura.io/v3/YOUR_API_KEY"
   ```

### 2. Setup MetaMask

1. Install MetaMask extension
2. Buat wallet baru
3. Switch ke Sepolia Testnet
4. Export Private Key (untuk deploy contract)
5. Update `.env`:
   ```env
   PRIVATE_KEY="your-private-key"
   ```

### 3. Get Sepolia ETH

Kunjungi: https://sepolia-faucet.pk910.de

### 4. Deploy Contract

```bash
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
```

Copy contract address ke `.env`:
```env
NEXT_PUBLIC_CONTRACT_ADDRESS="0x..."
```

### 5. Restart App

```bash
npm run dev
```

## 🎉 Selesai!

Sekarang Anda bisa:
- ✅ Login dengan 3 role berbeda
- ✅ Kelola produk (Admin)
- ✅ Buat inquiry (Customer)
- ✅ Assign inquiry ke sales (Admin)
- ✅ Update status inquiry (Sales)
- ✅ Bayar dengan crypto (Customer)

## 📚 Dokumentasi Lengkap

- Setup detail: `SETUP_GUIDE.md`
- Deployment: `DEPLOYMENT.md`
- README: `README.md`

## 🐛 Troubleshooting

### Error: Module not found

```bash
npm install
```

### Error: Prisma Client

```bash
npx prisma generate
```

### Error: Database locked

```bash
rm prisma/dev.db
npx prisma migrate dev
npx prisma db seed
```

## 🆘 Butuh Bantuan?

Baca dokumentasi lengkap di `SETUP_GUIDE.md`
