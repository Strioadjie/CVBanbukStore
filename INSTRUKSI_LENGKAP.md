# 📖 INSTRUKSI LENGKAP - Bahasa Indonesia

Panduan lengkap untuk setup dan menjalankan Virtual Product Gallery Web3.

---

## 📚 DAFTAR ISI

1. [Persiapan](#persiapan)
2. [Instalasi](#instalasi)
3. [Konfigurasi](#konfigurasi)
4. [Deploy Smart Contract](#deploy-smart-contract)
5. [Menjalankan Aplikasi](#menjalankan-aplikasi)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 PERSIAPAN

### Yang Harus Diinstall:

1. **Node.js** (versi 18 atau lebih baru)
   - Download: https://nodejs.org
   - Cek versi: `node --version`

2. **npm** (biasanya sudah include dengan Node.js)
   - Cek versi: `npm --version`

3. **Git** (optional, untuk version control)
   - Download: https://git-scm.com

4. **MetaMask** (browser extension)
   - Download: https://metamask.io
   - Install di Chrome/Firefox/Brave

5. **Code Editor** (pilih salah satu)
   - VS Code (recommended): https://code.visualstudio.com
   - Sublime Text
   - Atom

---

## 💻 INSTALASI

### Step 1: Download Project

Jika dari GitHub:
```bash
git clone https://github.com/username/virtual-product-gallery-web3.git
cd virtual-product-gallery-web3
```

Jika dari ZIP:
1. Extract file ZIP
2. Buka terminal/command prompt
3. Masuk ke folder project: `cd path/to/project`

### Step 2: Install Dependencies

```bash
npm install
```

Tunggu sampai selesai (bisa 2-5 menit tergantung internet).

**Jika ada error:**
```bash
# Hapus node_modules dan install ulang
rm -rf node_modules
npm install
```

---

## ⚙️ KONFIGURASI

### Step 1: Buat File .env

Copy file `.env.example` menjadi `.env`:

**Windows:**
```bash
copy .env.example .env
```

**Mac/Linux:**
```bash
cp .env.example .env
```

### Step 2: Isi File .env

Buka file `.env` dengan text editor dan isi:

```env
# 1. DATABASE (biarkan default)
DATABASE_URL="file:./dev.db"

# 2. NEXTAUTH_SECRET (generate random string)
NEXTAUTH_SECRET="paste-hasil-generate-di-sini"

# 3. NEXTAUTH_URL (biarkan default untuk development)
NEXTAUTH_URL="http://localhost:3000"

# 4. CONTRACT ADDRESS (isi setelah deploy contract)
NEXT_PUBLIC_CONTRACT_ADDRESS=""

# 5. RPC URL (isi setelah daftar Infura)
NEXT_PUBLIC_RPC_URL=""

# 6. PRIVATE KEY (isi setelah export dari MetaMask)
PRIVATE_KEY=""

# 7. WHATSAPP (ganti dengan nomor Anda)
NEXT_PUBLIC_WHATSAPP_NUMBER="628123456789"
```

### Step 3: Generate NEXTAUTH_SECRET

**Cara 1 - Menggunakan Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Cara 2 - Menggunakan website:**
1. Buka: https://generate-secret.vercel.app/32
2. Copy hasilnya
3. Paste ke `.env`

### Step 4: Setup Infura (untuk Web3)

1. Buka https://infura.io
2. Klik "Sign Up" (gratis)
3. Verifikasi email
4. Login
5. Klik "Create New Key"
6. Pilih "Web3 API"
7. Nama: "Virtual Gallery"
8. Network: Pilih "Sepolia"
9. Klik "Create"
10. Copy "API Key"
11. Paste ke `.env`:
    ```env
    NEXT_PUBLIC_RPC_URL="https://sepolia.infura.io/v3/PASTE_API_KEY_DI_SINI"
    ```

### Step 5: Setup MetaMask

#### Install MetaMask:
1. Buka https://metamask.io
2. Klik "Download"
3. Install extension di browser
4. Klik icon MetaMask di browser
5. Klik "Create a new wallet"
6. Buat password
7. Backup secret phrase (PENTING!)
8. Selesai

#### Switch ke Sepolia Testnet:
1. Buka MetaMask
2. Klik network dropdown (atas tengah)
3. Klik "Show test networks"
4. Toggle ON
5. Pilih "Sepolia test network"

#### Export Private Key:
1. Buka MetaMask
2. Klik 3 titik (atas kanan)
3. Klik "Account details"
4. Klik "Export private key"
5. Masukkan password MetaMask
6. Copy private key
7. Paste ke `.env`:
    ```env
    PRIVATE_KEY="paste-private-key-di-sini"
    ```

⚠️ **PENTING:** Jangan share private key ke siapapun!

#### Dapatkan Sepolia ETH (Gratis):

**Cara 1 - PoW Faucet (Recommended):**
1. Buka https://sepolia-faucet.pk910.de
2. Paste alamat wallet MetaMask
3. Klik "Start Mining"
4. Tunggu sampai dapat 0.05 ETH (5-10 menit)
5. Klik "Stop Mining & Claim Rewards"

**Cara 2 - Alchemy Faucet:**
1. Buka https://sepoliafaucet.com
2. Login dengan Alchemy account (gratis)
3. Paste alamat wallet
4. Klik "Send Me ETH"

**Cara 3 - QuickNode Faucet:**
1. Buka https://faucet.quicknode.com/ethereum/sepolia
2. Paste alamat wallet
3. Klik "Continue"
4. Verify (Twitter/Discord)
5. Claim ETH

### Step 6: Setup Database

```bash
# Generate Prisma Client
npx prisma generate

# Buat database dan tabel
npx prisma migrate dev --name init

# Isi database dengan data dummy
npx prisma db seed
```

**Output yang benar:**
```
✅ Users created
✅ Products created
✅ Inquiries created
✅ Wishlists created
🎉 Seeding completed!

📝 Demo Accounts:
Admin: admin@test.com / admin123
Sales: sales@test.com / sales123
Customer: customer@test.com / customer123
```

---

## 🚀 DEPLOY SMART CONTRACT

### Step 1: Compile Contract

```bash
npx hardhat compile
```

**Output yang benar:**
```
Compiled 1 Solidity file successfully
```

### Step 2: Cek Balance Wallet

```bash
npx hardhat run scripts/check-balance.js --network sepolia
```

**Output yang benar:**
```
Checking balance for: 0xYourAddress
Balance: 0.05 ETH
✅ Balance cukup untuk deploy contract
```

**Jika balance kurang:**
- Dapatkan Sepolia ETH dari faucet (lihat Step 5 di atas)

### Step 3: Deploy ke Sepolia

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

**Output yang benar:**
```
🚀 Memulai deployment ProductPayment contract...
📦 Deploying contract...
✅ ProductPayment contract berhasil di-deploy!
📍 Contract Address: 0x1234567890abcdef...

🔧 Langkah selanjutnya:
1. Copy contract address di atas
2. Paste ke file .env sebagai NEXT_PUBLIC_CONTRACT_ADDRESS
3. Restart development server (npm run dev)
```

### Step 4: Update .env

Copy contract address dan paste ke `.env`:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS="0x1234567890abcdef..."
```

### Step 5: Verify Contract (Optional)

Buka Sepolia Etherscan:
```
https://sepolia.etherscan.io/address/CONTRACT_ADDRESS
```

Ganti `CONTRACT_ADDRESS` dengan address Anda.

---

## 🏃 MENJALANKAN APLIKASI

### Step 1: Start Development Server

```bash
npm run dev
```

**Output yang benar:**
```
▲ Next.js 14.1.0
- Local:        http://localhost:3000
- Network:      http://192.168.1.x:3000

✓ Ready in 2.5s
```

### Step 2: Buka Browser

Buka: http://localhost:3000

**Halaman yang muncul:**
- Homepage dengan 3 tombol: Login, Register, Lihat Produk
- Navbar di atas
- Footer di bawah

### Step 3: Login

1. Klik "Login"
2. Gunakan akun demo:
   - **Admin:** admin@test.com / admin123
   - **Sales:** sales@test.com / sales123
   - **Customer:** customer@test.com / customer123
3. Klik "Login"
4. Redirect ke Dashboard

---

## 🧪 TESTING

### Test 1: Login dengan 3 Role

**Admin:**
1. Login: admin@test.com / admin123
2. Dashboard menampilkan stats admin
3. Bisa akses semua menu
4. Logout

**Sales:**
1. Login: sales@test.com / sales123
2. Dashboard menampilkan stats sales
3. Tidak bisa akses menu admin
4. Logout

**Customer:**
1. Login: customer@test.com / customer123
2. Dashboard menampilkan stats customer
3. Tidak bisa akses menu admin/sales
4. Logout

### Test 2: Kelola Produk (Admin)

1. Login sebagai admin
2. Klik "Produk" di navbar
3. Klik "+ Tambah Produk"
4. Isi form:
   - Nama: "Tas Kulit Baru"
   - Harga: 600000
   - Stok: 10
   - Deskripsi: "Tas kulit premium"
   - Bahan: "Kulit Asli"
   - Ukuran: "30x25x10 cm"
5. Klik "Tambah Produk"
6. Produk baru muncul di list

### Test 3: Wishlist (Customer)

1. Login sebagai customer
2. Klik "Produk"
3. Pilih produk
4. Klik "❤️ Wishlist"
5. Alert: "Berhasil ditambahkan ke wishlist!"
6. Klik "Wishlist" di navbar
7. Produk muncul di wishlist

### Test 4: Inquiry (Customer)

1. Login sebagai customer
2. Klik "Produk"
3. Pilih produk
4. Klik "💬 Inquiry"
5. Alert: "Inquiry berhasil dibuat!"
6. Klik "Inquiry" di navbar
7. Inquiry muncul dengan status "PENDING"

### Test 5: Assign Inquiry (Admin)

1. Login sebagai admin
2. Klik "Inquiry"
3. Pilih inquiry dengan status "PENDING"
4. Klik dropdown "Assign ke Sales"
5. Pilih "Sales User"
6. Inquiry ter-assign

### Test 6: Update Status (Sales)

1. Login sebagai sales
2. Klik "Inquiry"
3. Pilih inquiry yang di-assign
4. Ubah status ke "DIPROSES"
5. Status terupdate
6. Klik "💬 WhatsApp"
7. WhatsApp Web terbuka dengan message auto-fill

### Test 7: Pembayaran Regular (Customer)

1. Login sebagai customer
2. Klik "Produk"
3. Pilih produk
4. Klik "💰 Beli"
5. Pilih "Pembayaran Regular"
6. Klik "Bayar Sekarang"
7. Alert: "Pembayaran berhasil!"
8. Redirect ke dashboard
9. Transaksi muncul di dashboard

### Test 8: Pembayaran Crypto (Customer)

**Persiapan:**
- MetaMask terinstall
- Switch ke Sepolia
- Ada balance Sepolia ETH
- Contract sudah di-deploy

**Steps:**
1. Login sebagai customer
2. Klik "Produk"
3. Pilih produk
4. Klik "💰 Beli"
5. Pilih "Pembayaran Crypto (ETH)"
6. Klik "🦊 Connect MetaMask"
7. MetaMask popup muncul
8. Klik "Next" → "Connect"
9. Wallet connected (alamat muncul)
10. Klik "💳 Bayar Sekarang"
11. MetaMask popup muncul
12. Cek detail transaksi:
    - To: Contract Address
    - Amount: 0.001 ETH
    - Gas Fee: ~0.0001 ETH
13. Klik "Confirm"
14. Tunggu konfirmasi (1-2 menit)
15. Alert: "Pembayaran crypto berhasil!"
16. Redirect ke dashboard
17. Transaksi muncul dengan txHash

**Verify di Etherscan:**
1. Copy txHash dari database
2. Buka: https://sepolia.etherscan.io/tx/TX_HASH
3. Transaksi muncul dengan status "Success"

---

## 🐛 TROUBLESHOOTING

### Error: "Module not found"

**Solusi:**
```bash
npm install
```

### Error: "Prisma Client not generated"

**Solusi:**
```bash
npx prisma generate
```

### Error: "Database locked"

**Solusi:**
```bash
# Tutup Prisma Studio jika terbuka
# Atau hapus database dan buat ulang
rm prisma/dev.db
npx prisma migrate dev
npx prisma db seed
```

### Error: "Contract deployment failed"

**Cek:**
1. Apakah ada balance ETH di wallet?
   ```bash
   npx hardhat run scripts/check-balance.js --network sepolia
   ```

2. Apakah RPC URL benar?
   - Cek `.env`
   - Format: `https://sepolia.infura.io/v3/API_KEY`

3. Apakah private key valid?
   - Export ulang dari MetaMask
   - Paste ke `.env` (tanpa 0x)

**Solusi:**
```bash
# Dapatkan Sepolia ETH dari faucet
# Update .env dengan nilai yang benar
# Deploy ulang
npx hardhat run scripts/deploy.js --network sepolia
```

### Error: "MetaMask not detected"

**Solusi:**
1. Install MetaMask extension
2. Refresh halaman
3. Coba browser lain (Chrome/Firefox)

### Error: "Wrong network"

**Solusi:**
1. Buka MetaMask
2. Klik network dropdown
3. Pilih "Sepolia test network"
4. Refresh halaman

### Error: "Insufficient funds"

**Solusi:**
1. Dapatkan Sepolia ETH dari faucet
2. Tunggu sampai balance cukup (min 0.01 ETH)
3. Coba lagi

### Error: "Transaction failed"

**Penyebab:**
- Gas fee terlalu rendah
- Contract error
- Network congestion

**Solusi:**
1. Cek balance wallet
2. Increase gas fee di MetaMask
3. Coba lagi

### Port 3000 sudah digunakan

**Solusi:**
```bash
# Gunakan port lain
npm run dev -- -p 3001
```

Buka: http://localhost:3001

---

## 📊 MONITORING

### Lihat Database

```bash
npx prisma studio
```

Buka: http://localhost:5555

### Lihat Logs

**Development:**
- Logs muncul di terminal
- Cek console browser (F12)

**Production:**
- Vercel logs
- Sentry (jika disetup)

### Cek Contract

1. Buka Sepolia Etherscan
2. Search contract address
3. Lihat:
   - Transactions
   - Events
   - Balance

---

## 🎯 CHECKLIST SETUP

- [ ] Node.js terinstall
- [ ] npm terinstall
- [ ] MetaMask terinstall
- [ ] Dependencies terinstall (`npm install`)
- [ ] File `.env` dibuat
- [ ] NEXTAUTH_SECRET di-generate
- [ ] Infura account dibuat
- [ ] RPC URL di-set
- [ ] MetaMask wallet dibuat
- [ ] Switch ke Sepolia
- [ ] Sepolia ETH didapat
- [ ] Private key di-export
- [ ] Database di-migrate
- [ ] Database di-seed
- [ ] Contract di-compile
- [ ] Contract di-deploy
- [ ] Contract address di-set
- [ ] App berjalan (`npm run dev`)
- [ ] Login berhasil
- [ ] Semua fitur di-test

---

## 🎉 SELESAI!

Jika semua checklist ✅, maka project sudah siap digunakan!

**Next Steps:**
1. Customize design sesuai brand
2. Tambah fitur sesuai kebutuhan
3. Deploy ke production
4. Monitor & maintain

**Dokumentasi Lain:**
- `README.md` - Overview
- `SETUP_GUIDE.md` - Setup detail
- `TESTING_GUIDE.md` - Testing procedures
- `DEPLOYMENT.md` - Deployment guide
- `FITUR_LENGKAP.md` - Feature list

---

## 📞 BANTUAN

Jika masih ada masalah:

1. Baca dokumentasi lengkap
2. Cek error message di console
3. Google error message
4. Tanya di forum:
   - Stack Overflow
   - GitHub Issues
   - Discord communities

---

**Selamat mencoba! 🚀**

**Dibuat dengan ❤️ untuk CV Banbuk Mandiri Jaya**
