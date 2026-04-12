# 💳 Payment Gateway Setup Guide

Panduan lengkap untuk setup payment gateway Midtrans.

---

## 🎯 Kenapa Midtrans?

Midtrans adalah payment gateway terpopuler di Indonesia yang support:
- 💳 Credit/Debit Card (Visa, Mastercard, JCB)
- 🏦 Bank Transfer (BCA, Mandiri, BNI, BRI, Permata)
- 📱 E-Wallet (GoPay, OVO, DANA, ShopeePay, LinkAja)
- 🏬 Retail (Indomaret, Alfamart)
- 📲 QRIS

---

## 🚀 Setup Midtrans (5 Menit)

### Step 1: Daftar Akun Midtrans

1. Buka https://dashboard.midtrans.com/register
2. Isi form registrasi:
   - Email
   - Password
   - Nama Bisnis: "CV Banbuk Mandiri Jaya"
   - Nomor HP
3. Klik "Register"
4. Cek email untuk verifikasi
5. Klik link verifikasi di email

### Step 2: Login & Pilih Sandbox

1. Login ke https://dashboard.midtrans.com
2. Pilih environment: **Sandbox** (untuk testing)
3. Dashboard akan terbuka

### Step 3: Dapatkan API Keys

1. Di dashboard, klik **Settings** (kiri bawah)
2. Klik **Access Keys**
3. Anda akan melihat:
   - **Server Key** (dimulai dengan `SB-Mid-server-`)
   - **Client Key** (dimulai dengan `SB-Mid-client-`)
4. Copy kedua keys tersebut

### Step 4: Update .env

Buka file `.env` dan paste keys:

```env
MIDTRANS_SERVER_KEY="SB-Mid-server-xxxxxxxxxxxxxxxx"
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY="SB-Mid-client-xxxxxxxxxxxxxxxx"
```

**Contoh:**
```env
MIDTRANS_SERVER_KEY="SB-Mid-server-abc123def456"
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY="SB-Mid-client-xyz789uvw012"
```

### Step 5: Restart Aplikasi

```bash
# Stop server (Ctrl+C)
# Start lagi
npm run dev
```

### Step 6: Test Payment

1. Buka http://localhost:3000
2. Login sebagai customer
3. Pilih produk
4. Klik "Beli"
5. Pilih "Payment Gateway"
6. Klik "Bayar Sekarang"
7. Popup Midtrans akan muncul
8. Pilih metode pembayaran
9. Gunakan test credentials (lihat di bawah)

---

## 🧪 Test Credentials (Sandbox)

### Credit Card

**Visa:**
```
Card Number: 4811 1111 1111 1114
CVV: 123
Exp: 01/25
OTP: 112233
```

**Mastercard:**
```
Card Number: 5211 1111 1111 1117
CVV: 123
Exp: 01/25
OTP: 112233
```

### Bank Transfer

Pilih bank apapun, akan langsung sukses di sandbox.

### E-Wallet (GoPay, OVO, dll)

Akan muncul QR code atau deeplink, langsung klik "Bayar" untuk simulasi.

### QRIS

Akan muncul QR code, klik "Bayar" untuk simulasi.

---

## 📊 Monitoring Transaksi

### Di Dashboard Midtrans:

1. Login ke https://dashboard.midtrans.com
2. Pilih **Sandbox**
3. Klik **Transactions**
4. Lihat semua transaksi testing

### Di Aplikasi:

1. Login sebagai Admin
2. Buka Dashboard
3. Lihat total transaksi & revenue

---

## 🔄 Flow Pembayaran

### Customer Side:

1. Customer pilih produk
2. Klik "Beli"
3. Pilih "Payment Gateway"
4. Klik "Bayar Sekarang"
5. Popup Midtrans muncul
6. Pilih metode pembayaran
7. Selesaikan pembayaran
8. Redirect ke dashboard

### Backend Side:

1. Create transaction di database (status: PENDING)
2. Request token ke Midtrans API
3. Return token ke frontend
4. Frontend open Midtrans Snap popup
5. Customer bayar
6. Midtrans kirim notification ke webhook
7. Update transaction status (COMPLETED/FAILED)
8. Update stok produk (jika COMPLETED)

---

## 🔐 Webhook Configuration

Webhook digunakan untuk menerima notifikasi dari Midtrans.

### Setup Webhook (Production):

1. Login ke Midtrans Dashboard
2. Settings → Configuration
3. Payment Notification URL:
   ```
   https://your-domain.com/api/payment/midtrans/notification
   ```
4. Finish Redirect URL:
   ```
   https://your-domain.com/dashboard
   ```
5. Save

### Testing Webhook (Local):

Gunakan ngrok untuk expose local server:

```bash
# Install ngrok
npm install -g ngrok

# Expose port 3000
ngrok http 3000

# Copy URL (e.g., https://abc123.ngrok.io)
# Paste ke Midtrans webhook settings
```

---

## 🌐 Production Setup

### Step 1: Switch ke Production

Di file `lib/midtrans.ts`, ubah:

```typescript
isProduction: true, // Ubah dari false ke true
```

### Step 2: Dapatkan Production Keys

1. Login ke Midtrans Dashboard
2. Switch ke **Production** environment
3. Settings → Access Keys
4. Copy Production Server Key & Client Key
5. Update `.env`:
   ```env
   MIDTRANS_SERVER_KEY="Mid-server-xxxxxxxx"
   NEXT_PUBLIC_MIDTRANS_CLIENT_KEY="Mid-client-xxxxxxxx"
   ```

### Step 3: Verifikasi Bisnis

Untuk production, Midtrans akan minta:
- KTP
- NPWP
- Dokumen bisnis
- Rekening bank

Proses verifikasi: 1-3 hari kerja.

---

## 💰 Biaya Transaksi

### Sandbox (Testing):
- **GRATIS** - Tidak ada biaya

### Production:
- **Credit Card:** 2.9% + Rp 2,000
- **Bank Transfer:** Rp 4,000 per transaksi
- **E-Wallet:** 2% (min Rp 300)
- **QRIS:** 0.7%
- **Retail:** Rp 4,000 per transaksi

*Biaya dapat berubah, cek di dashboard Midtrans.

---

## 🐛 Troubleshooting

### Error: "getaddrinfo ENOTFOUND app.sandbox.midtrans.com"

**Penyebab:** Koneksi internet atau DNS issue

**Solusi:**
1. Cek koneksi internet
2. Coba restart router
3. Flush DNS:
   ```bash
   # Windows
   ipconfig /flushdns
   
   # Mac/Linux
   sudo dscacheutil -flushcache
   ```
4. Coba lagi

### Error: "Midtrans belum dikonfigurasi"

**Penyebab:** API keys belum di-set

**Solusi:**
1. Cek file `.env`
2. Pastikan ada:
   ```env
   MIDTRANS_SERVER_KEY="SB-Mid-server-xxx"
   NEXT_PUBLIC_MIDTRANS_CLIENT_KEY="SB-Mid-client-xxx"
   ```
3. Restart aplikasi

### Error: "Invalid signature"

**Penyebab:** Server key salah

**Solusi:**
1. Cek server key di `.env`
2. Pastikan copy dari dashboard yang benar
3. Jangan ada spasi atau karakter tambahan

### Popup Midtrans tidak muncul

**Penyebab:** Script Snap belum load

**Solusi:**
1. Cek console browser (F12)
2. Pastikan tidak ada error
3. Cek koneksi internet
4. Refresh halaman

---

## 📚 Resources

### Official Docs:
- Dashboard: https://dashboard.midtrans.com
- Docs: https://docs.midtrans.com
- API Reference: https://api-docs.midtrans.com

### Support:
- Email: support@midtrans.com
- Phone: +62 21 2963 4433
- Live Chat: Di dashboard

---

## ✅ Checklist Setup

- [ ] Daftar akun Midtrans
- [ ] Verifikasi email
- [ ] Login ke dashboard
- [ ] Pilih Sandbox environment
- [ ] Copy Server Key
- [ ] Copy Client Key
- [ ] Paste ke .env
- [ ] Restart aplikasi
- [ ] Test pembayaran
- [ ] Cek transaksi di dashboard

---

## 🎉 Selesai!

Sekarang aplikasi Anda sudah support payment gateway dengan berbagai metode pembayaran!

**Next Steps:**
1. Test semua metode pembayaran
2. Setup webhook untuk production
3. Verifikasi bisnis untuk production
4. Go live! 🚀

---

**Dibuat dengan ❤️ untuk CV Banbuk Mandiri Jaya**
