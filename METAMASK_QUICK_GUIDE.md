# 🦊 MetaMask Quick Guide - Sepolia Testnet

Quick reference untuk setup MetaMask dalam 5 menit!

---

## ⚡ Quick Setup (5 Menit)

### 1️⃣ Install (1 menit)
```
1. Buka: https://metamask.io
2. Klik "Download" → "Add to Chrome"
3. Klik icon 🦊 di toolbar
```

### 2️⃣ Buat Wallet (2 menit)
```
1. "Create a new wallet"
2. Buat password (min 8 karakter)
3. Catat 12 kata Secret Phrase ⚠️ PENTING!
4. Konfirmasi phrase
5. Done! ✅
```

### 3️⃣ Switch ke Sepolia (1 menit)
```
1. Settings ⚙️ → Advanced
2. Toggle ON "Show test networks"
3. Klik dropdown network (atas)
4. Pilih "Sepolia test network"
5. Done! ✅
```

### 4️⃣ Dapatkan ETH (1 menit)
```
1. Copy alamat wallet (klik alamat di atas)
2. Buka: https://sepolia-faucet.pk910.de
3. Paste alamat → "Start Mining"
4. Tunggu 5-10 menit → "Claim"
5. Cek balance di MetaMask ✅
```

### 5️⃣ Export Private Key (30 detik)
```
1. Klik ⋮ (3 titik) → "Account details"
2. "Show private key"
3. Masukkan password
4. Copy private key
5. Paste ke .env:
   PRIVATE_KEY="your-private-key-here"
6. Done! ✅
```

---

## 📋 Checklist

```
[ ] MetaMask installed
[ ] Wallet created
[ ] Secret phrase saved (12 words)
[ ] Switched to Sepolia
[ ] Balance > 0.01 ETH
[ ] Private key exported
[ ] Private key in .env
```

---

## 🎯 Network Settings

### Sepolia Testnet:
```
Network Name: Sepolia Testnet
RPC URL: https://sepolia.infura.io/v3/YOUR_KEY
Chain ID: 11155111
Symbol: ETH
Explorer: https://sepolia.etherscan.io
```

---

## 💰 Faucets (Gratis!)

### Recommended:
```
🥇 PoW Faucet (0.05 ETH)
   https://sepolia-faucet.pk910.de
   ⏱️ 5-10 menit mining

🥈 Alchemy (0.5 ETH)
   https://sepoliafaucet.com
   ⏱️ Instant, perlu login

🥉 QuickNode (0.05 ETH)
   https://faucet.quicknode.com/ethereum/sepolia
   ⏱️ Instant, perlu verify
```

---

## 🔑 Important Keys

### Secret Recovery Phrase (12 words):
```
⚠️ JANGAN SHARE KE SIAPAPUN!
⚠️ Jika hilang, wallet hilang selamanya!
⚠️ Simpan offline (tulis di kertas)

Contoh:
apple banana cherry date elephant fig
grape honey ice juice kiwi lemon
```

### Private Key:
```
⚠️ JANGAN SHARE KE SIAPAPUN!
⚠️ Hanya untuk deploy contract
⚠️ Simpan di .env (jangan commit ke git)

Format:
abc123def456...xyz789 (64 karakter)
```

---

## 🚨 Common Issues

### Issue: Sepolia tidak muncul
```
✅ Fix:
Settings → Advanced → Toggle ON "Show test networks"
```

### Issue: Balance 0 setelah claim
```
✅ Fix:
1. Tunggu 2-5 menit
2. Refresh MetaMask (klik 🔄)
3. Cek di Etherscan
```

### Issue: Lupa password
```
✅ Fix:
"Forgot password?" → Masukkan 12 kata phrase
⚠️ Jika lupa phrase, wallet tidak bisa di-recover!
```

---

## 🎓 Next Steps

### After MetaMask Setup:

```bash
# 1. Setup Infura
# Buka: https://infura.io
# Copy API Key → Update .env

# 2. Deploy Contract
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia

# 3. Update .env
NEXT_PUBLIC_CONTRACT_ADDRESS="0x..."

# 4. Restart App
npm run dev

# 5. Test Payment
# Login → Produk → Bayar dengan Crypto ✅
```

---

## 📱 Quick Commands

### Check Balance:
```
Buka MetaMask → Lihat angka di atas
```

### Copy Address:
```
Klik alamat (0x...) → Auto copy
```

### Switch Network:
```
Klik dropdown (atas) → Pilih network
```

### View on Etherscan:
```
Klik ⋮ → "View on Explorer"
```

---

## 🔒 Security Checklist

```
✅ Secret phrase disimpan offline
✅ Password kuat (min 8 karakter)
✅ Private key tidak di-share
✅ .env tidak di-commit ke git
✅ Hanya connect ke website terpercaya
✅ Gunakan testnet untuk testing
```

---

## 📞 Help

### Official Support:
```
Website: https://metamask.io
Docs: https://docs.metamask.io
Support: https://support.metamask.io
```

### Community:
```
Discord: https://discord.gg/metamask
Twitter: @MetaMask
Reddit: r/Metamask
```

---

## 💡 Pro Tips

```
💡 Bookmark faucet untuk claim lagi nanti
💡 Buat wallet terpisah untuk mainnet
💡 Backup phrase di 2 tempat berbeda
💡 Test dulu di testnet sebelum mainnet
💡 Cek gas fee sebelum transaksi
```

---

## ⏱️ Time Estimates

```
Install MetaMask: 1 menit
Create Wallet: 2 menit
Switch to Sepolia: 1 menit
Get ETH (mining): 5-10 menit
Get ETH (instant): 1 menit
Export Private Key: 30 detik
Deploy Contract: 2-3 menit

Total: 10-15 menit ⚡
```

---

## 🎯 Success Indicators

```
✅ Icon 🦊 di toolbar
✅ Network: "Sepolia test network"
✅ Balance: > 0.01 ETH
✅ Address: 0x... (42 karakter)
✅ Private key: di .env
✅ Ready to deploy! 🚀
```

---

**Print atau screenshot guide ini untuk referensi cepat!** 📸

**Full guide:** Baca `METAMASK_SETUP.md` untuk detail lengkap.
