# 🧪 Testing Guide

Panduan untuk testing semua fitur aplikasi.

## 📋 Checklist Testing

### ✅ Authentication

#### Register
- [ ] Register dengan email valid
- [ ] Register dengan email yang sudah ada (harus error)
- [ ] Register dengan password < 6 karakter (harus error)
- [ ] Password dan confirm password tidak cocok (harus error)

#### Login
- [ ] Login dengan credentials benar
- [ ] Login dengan email salah (harus error)
- [ ] Login dengan password salah (harus error)
- [ ] Auto redirect ke dashboard setelah login
- [ ] Session tersimpan (refresh page tetap login)

#### Logout
- [ ] Logout berhasil
- [ ] Redirect ke homepage
- [ ] Session terhapus

### ✅ Role-Based Access

#### Admin
- [ ] Bisa akses semua halaman
- [ ] Bisa tambah produk
- [ ] Bisa edit produk
- [ ] Bisa hapus produk
- [ ] Bisa lihat semua inquiry
- [ ] Bisa assign inquiry ke sales
- [ ] Dashboard menampilkan stats admin

#### Sales
- [ ] Tidak bisa akses halaman admin
- [ ] Bisa lihat inquiry yang di-assign
- [ ] Bisa update status inquiry
- [ ] Bisa klik tombol WhatsApp
- [ ] Dashboard menampilkan stats sales

#### Customer
- [ ] Tidak bisa akses halaman admin/sales
- [ ] Bisa lihat produk
- [ ] Bisa tambah ke wishlist
- [ ] Bisa buat inquiry
- [ ] Bisa bayar produk
- [ ] Dashboard menampilkan stats customer

### ✅ Produk

#### List Produk
- [ ] Semua produk tampil
- [ ] Card produk menampilkan info lengkap
- [ ] Tombol berbeda per role

#### Tambah Produk (Admin)
- [ ] Form validation bekerja
- [ ] Produk berhasil ditambahkan
- [ ] Redirect ke list produk
- [ ] Produk baru muncul di list

#### Edit Produk (Admin)
- [ ] Form terisi dengan data existing
- [ ] Update berhasil
- [ ] Data terupdate di list

#### Hapus Produk (Admin)
- [ ] Produk terhapus
- [ ] Hilang dari list

### ✅ Wishlist

#### Tambah ke Wishlist
- [ ] Produk berhasil ditambahkan
- [ ] Alert muncul
- [ ] Tidak bisa tambah produk yang sama 2x

#### Lihat Wishlist
- [ ] Semua wishlist tampil
- [ ] Bisa beli dari wishlist
- [ ] Bisa hapus dari wishlist

#### Hapus dari Wishlist
- [ ] Produk terhapus
- [ ] Hilang dari list wishlist

### ✅ Inquiry

#### Buat Inquiry (Customer)
- [ ] Inquiry berhasil dibuat
- [ ] Status awal: PENDING
- [ ] Muncul di list inquiry customer

#### Assign Sales (Admin)
- [ ] Bisa pilih sales dari dropdown
- [ ] Inquiry ter-assign ke sales
- [ ] Sales bisa lihat inquiry tersebut

#### Update Status (Sales)
- [ ] Bisa ubah status (PENDING → DIPROSES → SELESAI)
- [ ] Status terupdate
- [ ] Customer bisa lihat status baru

#### WhatsApp Button (Sales)
- [ ] Link WhatsApp terbuka
- [ ] Message auto-fill dengan benar
- [ ] Nomor WhatsApp sesuai config

### ✅ Pembayaran Regular

#### Flow Pembayaran
- [ ] Halaman payment terbuka
- [ ] Info produk tampil
- [ ] Pilih metode "Regular"
- [ ] Klik "Bayar Sekarang"
- [ ] Transaksi tersimpan
- [ ] Stok produk berkurang
- [ ] Redirect ke dashboard

### ✅ Pembayaran Crypto

#### Setup
- [ ] MetaMask terinstall
- [ ] Switch ke Sepolia Testnet
- [ ] Ada balance Sepolia ETH
- [ ] Contract sudah di-deploy
- [ ] Contract address di .env

#### Connect Wallet
- [ ] Klik "Connect MetaMask"
- [ ] MetaMask popup muncul
- [ ] Approve connection
- [ ] Wallet address tampil
- [ ] Status "Connected" muncul

#### Bayar dengan Crypto
- [ ] Pilih metode "Crypto"
- [ ] Klik "Bayar Sekarang"
- [ ] MetaMask popup muncul
- [ ] Confirm transaksi
- [ ] Tunggu konfirmasi (1-2 menit)
- [ ] Transaksi tersimpan dengan txHash
- [ ] Stok produk berkurang
- [ ] Redirect ke dashboard

#### Verify di Blockchain
- [ ] Buka Sepolia Etherscan
- [ ] Search contract address
- [ ] Transaksi muncul di history
- [ ] Event "PaymentReceived" ter-emit

### ✅ Dashboard

#### Dashboard Admin
- [ ] Total produk benar
- [ ] Total inquiry benar
- [ ] Inquiry pending benar
- [ ] Stok rendah benar
- [ ] Total transaksi benar
- [ ] Total revenue benar
- [ ] Produk terpopuler tampil

#### Dashboard Sales
- [ ] Inquiry assigned benar
- [ ] Pending benar
- [ ] Completed benar

#### Dashboard Customer
- [ ] My inquiry benar
- [ ] My wishlist benar
- [ ] My transaksi benar

### ✅ UI/UX

#### Responsive
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

#### Navigation
- [ ] Navbar tampil di semua page
- [ ] Link navigation bekerja
- [ ] Active state benar
- [ ] Logout bekerja

#### Loading States
- [ ] Loading indicator saat fetch data
- [ ] Disabled button saat submit
- [ ] Skeleton loader (optional)

#### Error Handling
- [ ] Error message tampil
- [ ] User-friendly error messages
- [ ] Network error handled

### ✅ Security

#### Authentication
- [ ] Protected routes tidak bisa diakses tanpa login
- [ ] Auto redirect ke login jika belum login
- [ ] Session timeout bekerja

#### Authorization
- [ ] Customer tidak bisa akses admin routes
- [ ] Sales tidak bisa akses admin routes
- [ ] API endpoints cek role

#### Input Validation
- [ ] XSS protection
- [ ] SQL injection protection (Prisma)
- [ ] Required fields validated
- [ ] Data type validated

### ✅ Performance

#### Load Time
- [ ] Homepage < 2 detik
- [ ] Dashboard < 3 detik
- [ ] Product list < 2 detik

#### Database
- [ ] Query optimization
- [ ] No N+1 queries
- [ ] Indexes ada (jika perlu)

#### Smart Contract
- [ ] Gas fee reasonable
- [ ] Transaction confirmed < 2 menit
- [ ] No failed transactions

## 🧪 Test Scenarios

### Scenario 1: Customer Journey

1. Register akun baru
2. Login
3. Lihat produk
4. Tambah 2 produk ke wishlist
5. Buat inquiry untuk 1 produk
6. Beli 1 produk dengan regular payment
7. Beli 1 produk dengan crypto payment
8. Cek dashboard (harus ada 1 inquiry, 2 wishlist, 2 transaksi)
9. Logout

### Scenario 2: Admin Journey

1. Login sebagai admin
2. Tambah 3 produk baru
3. Edit 1 produk
4. Lihat inquiry
5. Assign 2 inquiry ke sales
6. Cek dashboard (stats harus update)
7. Logout

### Scenario 3: Sales Journey

1. Login sebagai sales
2. Lihat inquiry yang di-assign
3. Update status 1 inquiry ke "DIPROSES"
4. Klik WhatsApp button
5. Update status ke "SELESAI"
6. Cek dashboard (stats harus update)
7. Logout

### Scenario 4: Web3 Journey

1. Install MetaMask
2. Create wallet
3. Switch ke Sepolia
4. Get Sepolia ETH dari faucet
5. Login sebagai customer
6. Pilih produk
7. Connect MetaMask
8. Bayar dengan crypto
9. Verify di Etherscan
10. Cek transaksi di dashboard

## 🐛 Bug Testing

### Common Bugs to Check

- [ ] Race conditions
- [ ] Memory leaks
- [ ] Infinite loops
- [ ] Null pointer exceptions
- [ ] Type errors
- [ ] Network timeouts
- [ ] Database locks
- [ ] Session conflicts

### Edge Cases

- [ ] Empty states (no products, no inquiry, etc.)
- [ ] Very long text (overflow)
- [ ] Special characters in input
- [ ] Concurrent requests
- [ ] Slow network
- [ ] MetaMask not installed
- [ ] Wrong network
- [ ] Insufficient balance

## 📊 Test Results Template

```
Date: [DATE]
Tester: [NAME]
Environment: [DEV/STAGING/PROD]

✅ Passed: X/Y
❌ Failed: Y/Y
⚠️  Warnings: Z

Failed Tests:
1. [Test Name] - [Error Description]
2. [Test Name] - [Error Description]

Notes:
- [Additional notes]
```

## 🔧 Testing Tools

### Manual Testing
- Browser DevTools
- MetaMask
- Prisma Studio
- Etherscan

### Automated Testing (Optional)
- Jest (unit tests)
- Cypress (e2e tests)
- Playwright (e2e tests)

### Load Testing (Optional)
- Apache JMeter
- k6
- Artillery

## ✅ Pre-Production Checklist

- [ ] All tests passed
- [ ] No console errors
- [ ] No console warnings
- [ ] Performance acceptable
- [ ] Security audit done
- [ ] Documentation complete
- [ ] Environment variables set
- [ ] Database backed up
- [ ] Smart contract verified

## 🎯 Success Criteria

Project dianggap berhasil jika:

1. ✅ Semua fitur bekerja
2. ✅ Tidak ada critical bugs
3. ✅ Performance acceptable
4. ✅ Security terjamin
5. ✅ User experience baik
6. ✅ Documentation lengkap

---

**Happy Testing! 🧪**
