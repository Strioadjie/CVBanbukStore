# 💳 Cara Bayar dengan Crypto (ETH)

Panduan lengkap untuk melakukan pembayaran menggunakan cryptocurrency Ethereum.

---

## ✅ Prerequisites

Pastikan Anda sudah:
- ✅ Install MetaMask extension
- ✅ Punya wallet MetaMask
- ✅ Switch ke Sepolia Testnet
- ✅ Punya Sepolia ETH (minimal 0.002 ETH untuk transaksi + gas)

Kalau belum, baca: `METAMASK_SETUP.md`

---

## 🚀 Langkah-Langkah Pembayaran

### Step 1: Login ke Aplikasi

1. Buka: http://localhost:3000
2. Klik **"Login"**
3. Gunakan akun customer:
   ```
   Email: customer@test.com
   Password: customer123
   ```
4. Klik **"Login"**

### Step 2: Pilih Produk

1. Klik **"Produk"** di navbar
2. Browse katalog produk
3. Pilih produk yang ingin dibeli
4. Klik **"💰 Beli"**

### Step 3: Pilih Metode Pembayaran

1. Di halaman payment, Anda akan lihat 3 opsi:
   - 💳 Payment Gateway (Midtrans)
   - 🔐 **Pembayaran Crypto (ETH)** ← Pilih ini
   - 💵 Pembayaran Manual

2. Klik **"🔐 Pembayaran Crypto (ETH)"**

### Step 4: Connect MetaMask

1. Klik tombol **"🦊 Connect MetaMask"**

2. **MetaMask popup akan muncul:**
   - Pilih account yang ingin digunakan
   - Klik **"Next"**
   - Klik **"Connect"**

3. **Wallet berhasil terhubung!**
   - Anda akan lihat:
     - ✅ Wallet Terhubung
     - Address: 0x1234...5678
     - Balance: 0.05 ETH
     - Network: sepolia

### Step 5: Review Transaksi

Sebelum bayar, cek informasi:

```
Produk: Tas Kulit Premium
Harga: 0.001 ETH (≈ Rp 500,000)

Wallet Info:
- Address: 0x1234...5678
- Balance: 0.05 ETH
- Network: Sepolia
```

Pastikan:
- ✅ Network: **Sepolia** (bukan Mainnet!)
- ✅ Balance cukup (min 0.002 ETH)
- ✅ Produk sudah benar

### Step 6: Bayar

1. Klik tombol **"💳 Bayar Sekarang"**

2. **MetaMask popup muncul lagi:**
   ```
   Confirm Transaction
   
   To: 0xd23F...A44D (Contract)
   Amount: 0.001 ETH
   Gas Fee: ~0.0001 ETH
   Total: ~0.0011 ETH
   ```

3. **Review detail transaksi:**
   - To: Contract address (bukan address orang)
   - Amount: 0.001 ETH (sesuai harga)
   - Gas Fee: Biaya jaringan (otomatis)

4. Klik **"Confirm"**

### Step 7: Tunggu Konfirmasi

1. **Status akan berubah:**
   ```
   ⏳ Mempersiapkan transaksi...
   ⏳ Menunggu konfirmasi di MetaMask...
   ⏳ Transaksi dikirim! Hash: 0xabc123...
   ⏳ Menunggu konfirmasi blockchain...
   ✅ Pembayaran berhasil!
   ```

2. **Tunggu 30-60 detik** untuk konfirmasi blockchain

3. **Setelah berhasil:**
   - Alert: "Pembayaran berhasil!"
   - Redirect ke dashboard
   - Transaksi tersimpan di database
   - Stok produk berkurang

### Step 8: Verify Transaksi

1. **Di Dashboard:**
   - Lihat transaksi di "My Transaksi"
   - Status: COMPLETED
   - Transaction Hash: 0xabc123...

2. **Di Etherscan:**
   - Klik link "View on Etherscan"
   - Atau buka: https://sepolia.etherscan.io
   - Paste transaction hash
   - Lihat detail transaksi

3. **Di MetaMask:**
   - Buka MetaMask
   - Klik "Activity"
   - Lihat transaksi terakhir
   - Status: Confirmed ✅

---

## 🎯 Troubleshooting

### Issue: "MetaMask tidak terdeteksi"

**Solusi:**
1. Pastikan MetaMask extension terinstall
2. Refresh halaman
3. Coba browser lain (Chrome/Firefox)

### Issue: "Silakan switch ke Sepolia Testnet"

**Solusi:**
1. Buka MetaMask
2. Klik dropdown network (atas)
3. Pilih "Sepolia test network"
4. Refresh halaman

### Issue: "Balance tidak cukup"

**Solusi:**
1. Cek balance di MetaMask
2. Minimal: 0.002 ETH (0.001 + gas fee)
3. Dapatkan Sepolia ETH dari faucet:
   - https://sepolia-faucet.pk910.de
   - https://sepoliafaucet.com

### Issue: "Transaksi dibatalkan oleh user"

**Penyebab:** Anda klik "Reject" di MetaMask

**Solusi:**
1. Klik "Bayar Sekarang" lagi
2. Klik "Confirm" di MetaMask

### Issue: "Gas fee terlalu tinggi"

**Solusi:**
1. Tunggu beberapa menit (network congestion)
2. Atau adjust gas fee di MetaMask:
   - Klik "Edit" di popup
   - Pilih "Low" atau "Medium"
   - Klik "Save"

### Issue: "Transaction failed"

**Penyebab:**
- Gas fee terlalu rendah
- Contract error
- Network issue

**Solusi:**
1. Cek transaction di Etherscan
2. Lihat error message
3. Coba lagi dengan gas fee lebih tinggi

### Issue: "Stuck di 'Menunggu konfirmasi...'"

**Solusi:**
1. Tunggu 2-3 menit
2. Cek di Etherscan apakah transaksi pending
3. Jika stuck > 5 menit, refresh halaman
4. Cek di MetaMask apakah transaksi confirmed

---

## 💡 Tips & Best Practices

### Sebelum Transaksi:

✅ **Cek Network:**
- Pastikan di Sepolia (testnet)
- JANGAN gunakan Mainnet untuk testing!

✅ **Cek Balance:**
- Minimal 0.002 ETH
- Lebih banyak lebih baik

✅ **Cek Gas Fee:**
- Biasanya 0.0001 - 0.0005 ETH
- Bisa berubah tergantung network

✅ **Cek Contract Address:**
- Pastikan address benar
- Jangan kirim ke address random

### Saat Transaksi:

✅ **Review Detail:**
- Cek amount (0.001 ETH)
- Cek gas fee
- Cek total

✅ **Jangan Tutup Browser:**
- Tunggu sampai konfirmasi
- Jangan refresh halaman

✅ **Simpan Transaction Hash:**
- Copy hash untuk tracking
- Bisa cek di Etherscan

### Setelah Transaksi:

✅ **Verify di Etherscan:**
- Pastikan status "Success"
- Cek event "PaymentReceived"

✅ **Cek Dashboard:**
- Transaksi muncul di list
- Status: COMPLETED

✅ **Cek Stok:**
- Stok produk berkurang 1

---

## 📊 Flow Diagram

```
Customer                MetaMask              Smart Contract         Database
   |                       |                        |                    |
   |--[1. Connect]-------->|                        |                    |
   |<--[Address]-----------|                        |                    |
   |                       |                        |                    |
   |--[2. Pay]------------>|                        |                    |
   |                       |--[3. Sign Tx]--------->|                    |
   |                       |                        |--[4. Execute]----->|
   |                       |                        |                    |
   |                       |<--[5. Receipt]---------|                    |
   |<--[6. Success]--------|                        |                    |
   |                       |                        |                    |
   |--[7. Save]---------------------------------------->[Transaction]    |
   |                       |                        |                    |
```

---

## 🔍 Transaction Details

### What Happens Behind the Scenes:

1. **Connect Wallet:**
   - Request account access
   - Get wallet address
   - Check network
   - Get balance

2. **Prepare Transaction:**
   - Create contract instance
   - Set amount (0.001 ETH)
   - Estimate gas fee

3. **Send Transaction:**
   - Call `payProduct(productId)`
   - Send 0.001 ETH
   - Wait for user confirmation

4. **Blockchain Processing:**
   - Transaction broadcast to network
   - Miners include in block
   - Block confirmed
   - Receipt generated

5. **Update Database:**
   - Save transaction hash
   - Update status: COMPLETED
   - Decrease product stock
   - Send notification

---

## 💰 Cost Breakdown

### Testnet (Sepolia):
```
Product Price: 0.001 ETH (FREE - testnet)
Gas Fee: ~0.0001 ETH (FREE - testnet)
Total: ~0.0011 ETH (FREE - testnet)
```

### Mainnet (Production):
```
Product Price: 0.001 ETH (~$2-3 USD)
Gas Fee: ~0.0001-0.001 ETH (~$0.2-2 USD)
Total: ~0.0011-0.002 ETH (~$2-5 USD)
```

**Note:** Harga ETH dan gas fee berubah-ubah!

---

## 🎓 Learn More

### Blockchain Basics:
- What is Ethereum: https://ethereum.org/what-is-ethereum
- What is Gas: https://ethereum.org/gas
- What is Testnet: https://ethereum.org/testnets

### MetaMask:
- User Guide: https://docs.metamask.io
- FAQs: https://metamask.io/faqs

### Smart Contracts:
- Solidity Docs: https://docs.soliditylang.org
- Etherscan: https://sepolia.etherscan.io

---

## ✅ Success Checklist

Transaksi berhasil jika:

- [ ] MetaMask connected
- [ ] Network: Sepolia
- [ ] Balance cukup
- [ ] Transaction confirmed
- [ ] Status: Success di Etherscan
- [ ] Transaction hash tersimpan
- [ ] Muncul di dashboard
- [ ] Stok produk berkurang

---

## 🎉 Selamat!

Anda berhasil melakukan pembayaran dengan cryptocurrency! 🚀

**Next Steps:**
- Test dengan produk lain
- Cek transaction history
- Explore Etherscan
- Learn more about blockchain

---

**Dibuat dengan ❤️ untuk CV Banbuk Mandiri Jaya**
