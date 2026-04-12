# 🦊 MetaMask Setup Guide - Sepolia Testnet

Panduan lengkap cara install dan setting MetaMask untuk Sepolia Testnet.

---

## 📥 Step 1: Install MetaMask

### Untuk Chrome/Brave/Edge:
1. Buka https://metamask.io
2. Klik **"Download"**
3. Pilih **"Install MetaMask for Chrome"**
4. Klik **"Add to Chrome"**
5. Klik **"Add extension"**
6. Icon MetaMask 🦊 akan muncul di toolbar browser

### Untuk Firefox:
1. Buka https://metamask.io
2. Klik **"Download"**
3. Pilih **"Install MetaMask for Firefox"**
4. Klik **"Add to Firefox"**

---

## 🔐 Step 2: Buat Wallet Baru

### Jika Belum Punya Wallet:

1. **Klik icon MetaMask** 🦊 di toolbar
2. Klik **"Get Started"**
3. Klik **"Create a new wallet"**
4. Klik **"I Agree"** (terms & conditions)
5. **Buat Password:**
   - Minimal 8 karakter
   - Gunakan kombinasi huruf, angka, simbol
   - Catat password ini!
6. Klik **"Create a new wallet"**

### Secret Recovery Phrase (PENTING!):

7. Klik **"Secure my wallet"**
8. Klik **"Reveal Secret Recovery Phrase"**
9. **CATAT 12 kata ini di tempat aman!**
   ```
   Contoh:
   apple banana cherry date elephant fig
   grape honey ice juice kiwi lemon
   ```
   ⚠️ **JANGAN SHARE KE SIAPAPUN!**
   ⚠️ **Jika hilang, wallet tidak bisa di-recover!**

10. Klik **"Next"**
11. **Konfirmasi phrase:** Klik kata-kata sesuai urutan
12. Klik **"Confirm"**
13. Klik **"Got it!"**
14. ✅ **Wallet berhasil dibuat!**

---

## 🌐 Step 3: Switch ke Sepolia Testnet

### Cara 1: Enable Test Networks (Recommended)

1. **Buka MetaMask** (klik icon 🦊)
2. Klik **icon ⚙️ (Settings)** di kanan atas
3. Klik **"Advanced"**
4. Scroll ke bawah
5. **Toggle ON** → **"Show test networks"**
   ```
   Show test networks: [OFF] → [ON] ✅
   ```
6. Klik **"< Back"** (kiri atas)
7. Klik **dropdown network** (atas tengah)
   - Defaultnya: "Ethereum Mainnet"
8. Pilih **"Sepolia test network"**
9. ✅ **Sekarang di Sepolia Testnet!**

### Cara 2: Add Network Manual (Jika Sepolia Tidak Muncul)

1. **Buka MetaMask**
2. Klik **dropdown network** (atas tengah)
3. Klik **"Add network"**
4. Klik **"Add a network manually"**
5. **Isi form:**
   ```
   Network Name: Sepolia Testnet
   New RPC URL: https://sepolia.infura.io/v3/YOUR_INFURA_KEY
   Chain ID: 11155111
   Currency Symbol: ETH
   Block Explorer URL: https://sepolia.etherscan.io
   ```
6. Klik **"Save"**
7. Klik **"Switch to Sepolia Testnet"**
8. ✅ **Sekarang di Sepolia Testnet!**

---

## 💰 Step 4: Dapatkan Sepolia ETH (Gratis!)

Anda perlu Sepolia ETH untuk:
- Deploy smart contract
- Bayar gas fee
- Test transaksi

### Cara 1: PoW Faucet (Recommended - Paling Banyak)

1. **Copy alamat wallet:**
   - Buka MetaMask
   - Klik alamat (atas tengah)
   - Contoh: `0x1234...5678`
   - Akan auto-copy

2. **Buka faucet:**
   - https://sepolia-faucet.pk910.de

3. **Paste alamat wallet**

4. **Klik "Start Mining"**
   - Browser akan mining untuk dapat ETH
   - Biarkan tab terbuka
   - Tunggu 5-10 menit

5. **Lihat progress:**
   ```
   Mining... 0.001 ETH
   Mining... 0.005 ETH
   Mining... 0.01 ETH
   ...
   Mining... 0.05 ETH ✅
   ```

6. **Klik "Stop Mining & Claim Rewards"**

7. **Tunggu konfirmasi** (1-2 menit)

8. **Cek MetaMask:**
   - Buka MetaMask
   - Lihat balance: `0.05 ETH` ✅

### Cara 2: Alchemy Faucet (Cepat - Sedikit)

1. **Buka:** https://sepoliafaucet.com
2. **Login dengan Alchemy** (gratis)
3. **Paste alamat wallet**
4. **Klik "Send Me ETH"**
5. **Dapat:** 0.5 ETH
6. **Limit:** 1x per hari

### Cara 3: QuickNode Faucet

1. **Buka:** https://faucet.quicknode.com/ethereum/sepolia
2. **Paste alamat wallet**
3. **Verify** (Twitter/Discord)
4. **Klik "Claim"**
5. **Dapat:** 0.05 ETH

### Cara 4: Infura Faucet

1. **Buka:** https://www.infura.io/faucet/sepolia
2. **Login dengan Infura** (gratis)
3. **Paste alamat wallet**
4. **Klik "Receive ETH"**
5. **Dapat:** 0.5 ETH

---

## 🔑 Step 5: Export Private Key (Untuk Deploy Contract)

⚠️ **PENTING:** Private key adalah kunci wallet Anda. Jangan share ke siapapun!

### Cara Export:

1. **Buka MetaMask**
2. Klik **icon ⋮ (3 titik)** di kanan atas
3. Klik **"Account details"**
4. Klik **"Show private key"**
5. **Masukkan password MetaMask**
6. Klik **"Confirm"**
7. **Private key akan muncul:**
   ```
   abc123def456...xyz789
   ```
8. **Klik "Copy"** atau catat manual
9. **Paste ke file .env:**
   ```env
   PRIVATE_KEY="abc123def456...xyz789"
   ```
10. ⚠️ **JANGAN COMMIT .env KE GIT!**

---

## ✅ Verifikasi Setup

### Checklist:

- [ ] MetaMask terinstall
- [ ] Wallet sudah dibuat
- [ ] Secret phrase sudah dicatat
- [ ] Switch ke Sepolia Testnet
- [ ] Balance > 0.01 ETH
- [ ] Private key sudah di-export
- [ ] Private key sudah di .env

### Cara Cek:

1. **Buka MetaMask**
2. **Cek network:** Harus "Sepolia test network"
3. **Cek balance:** Harus > 0 ETH
4. **Cek alamat:** Copy dan cek di Etherscan
   - https://sepolia.etherscan.io/address/YOUR_ADDRESS

---

## 🎯 Troubleshooting

### MetaMask tidak muncul di toolbar

**Solusi:**
1. Klik icon **puzzle** 🧩 di toolbar
2. Cari "MetaMask"
3. Klik **pin** 📌 untuk pin ke toolbar

### Sepolia tidak muncul di list network

**Solusi:**
1. Settings → Advanced
2. Toggle ON "Show test networks"
3. Atau add manual (lihat Cara 2 di atas)

### Balance tidak bertambah setelah claim faucet

**Solusi:**
1. Tunggu 2-5 menit
2. Refresh MetaMask (klik icon 🔄)
3. Cek di Etherscan:
   - https://sepolia.etherscan.io/address/YOUR_ADDRESS
4. Jika masih 0, coba faucet lain

### Lupa password MetaMask

**Solusi:**
1. Klik "Forgot password?"
2. Masukkan Secret Recovery Phrase (12 kata)
3. Buat password baru
4. ⚠️ Jika lupa phrase, wallet tidak bisa di-recover!

### Private key tidak bisa di-copy

**Solusi:**
1. Screenshot (tapi hapus setelah di-copy!)
2. Atau ketik manual
3. Pastikan tidak ada spasi di awal/akhir

---

## 🔒 Security Tips

### DO ✅:
- ✅ Catat Secret Recovery Phrase di tempat aman (offline)
- ✅ Gunakan password yang kuat
- ✅ Backup wallet secara berkala
- ✅ Gunakan testnet untuk testing
- ✅ Verify website sebelum connect wallet

### DON'T ❌:
- ❌ Share Secret Recovery Phrase ke siapapun
- ❌ Share Private Key ke siapapun
- ❌ Screenshot phrase dan simpan di cloud
- ❌ Gunakan wallet yang sama untuk mainnet & testnet
- ❌ Connect wallet ke website yang tidak dipercaya

---

## 📱 MetaMask Mobile (Optional)

### Install di HP:

1. **Download:**
   - iOS: App Store
   - Android: Google Play Store

2. **Import wallet:**
   - Buka app
   - "Import using Secret Recovery Phrase"
   - Masukkan 12 kata
   - Buat password

3. **Switch ke Sepolia:**
   - Settings → Networks
   - Add Sepolia (sama seperti desktop)

---

## 🎓 Next Steps

Setelah setup MetaMask:

### 1. Setup Infura (untuk RPC URL)
```bash
# Buka: https://infura.io
# Daftar → Buat project → Copy API Key
# Update .env:
NEXT_PUBLIC_RPC_URL="https://sepolia.infura.io/v3/YOUR_API_KEY"
```

### 2. Deploy Smart Contract
```bash
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
```

### 3. Update Contract Address
```bash
# Copy contract address dari output
# Update .env:
NEXT_PUBLIC_CONTRACT_ADDRESS="0x..."
```

### 4. Test Payment
```bash
# Restart app
npm run dev

# Login → Pilih produk → Bayar dengan Crypto
```

---

## 📚 Resources

### Official:
- Website: https://metamask.io
- Docs: https://docs.metamask.io
- Support: https://support.metamask.io

### Faucets:
- PoW Faucet: https://sepolia-faucet.pk910.de
- Alchemy: https://sepoliafaucet.com
- QuickNode: https://faucet.quicknode.com/ethereum/sepolia
- Infura: https://www.infura.io/faucet/sepolia

### Explorers:
- Sepolia Etherscan: https://sepolia.etherscan.io
- Sepolia Stats: https://sepolia.dev

### Learn More:
- What is MetaMask: https://metamask.io/faqs/
- How to use testnet: https://docs.metamask.io/wallet/how-to/get-started-building/run-devnet/

---

## ❓ FAQ

### Q: Apakah Sepolia ETH punya nilai?
**A:** Tidak. Sepolia ETH adalah testnet, tidak punya nilai uang real. Gratis untuk testing.

### Q: Berapa ETH yang dibutuhkan untuk deploy contract?
**A:** Sekitar 0.01-0.05 ETH untuk deploy + beberapa transaksi.

### Q: Apakah bisa pakai wallet yang sama untuk mainnet?
**A:** Bisa, tapi tidak disarankan. Buat wallet terpisah untuk testing.

### Q: Bagaimana cara switch kembali ke mainnet?
**A:** Klik dropdown network → Pilih "Ethereum Mainnet"

### Q: Apakah perlu KYC untuk MetaMask?
**A:** Tidak. MetaMask tidak perlu KYC.

---

## ✅ Summary

**Setup MetaMask untuk Sepolia Testnet:**

1. ✅ Install MetaMask extension
2. ✅ Buat wallet baru
3. ✅ Catat Secret Recovery Phrase
4. ✅ Enable test networks
5. ✅ Switch ke Sepolia
6. ✅ Claim Sepolia ETH dari faucet
7. ✅ Export Private Key
8. ✅ Update .env
9. ✅ Ready to deploy! 🚀

**Total waktu:** 10-15 menit

---

**Selamat! MetaMask Anda sudah siap untuk testing! 🎉**

**Next:** Deploy smart contract dengan `npx hardhat run scripts/deploy.js --network sepolia`
