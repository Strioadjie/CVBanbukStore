# 🚀 Deployment Guide

Panduan untuk deploy aplikasi ke production.

## 📋 Checklist Pre-Deployment

- [ ] Semua fitur sudah di-test
- [ ] Database schema final
- [ ] Smart contract sudah di-deploy
- [ ] Environment variables sudah disiapkan
- [ ] Security audit dilakukan

## 🌐 Deploy Frontend (Vercel)

### 1. Push ke GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/username/repo.git
git push -u origin main
```

### 2. Deploy ke Vercel

1. Buka https://vercel.com
2. Login dengan GitHub
3. Import repository
4. Configure project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: .next

### 3. Set Environment Variables

Di Vercel dashboard, tambahkan:

```
DATABASE_URL=your-production-database-url
NEXTAUTH_SECRET=your-production-secret
NEXTAUTH_URL=https://your-domain.vercel.app
NEXT_PUBLIC_CONTRACT_ADDRESS=your-contract-address
NEXT_PUBLIC_RPC_URL=your-rpc-url
NEXT_PUBLIC_WHATSAPP_NUMBER=628123456789
```

### 4. Deploy

Klik "Deploy" dan tunggu proses selesai.

## 🗄️ Database Production

### Option 1: PlanetScale (Recommended)

1. Daftar di https://planetscale.com
2. Buat database baru
3. Copy connection string
4. Update `DATABASE_URL` di Vercel
5. Update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
  relationMode = "prisma"
}
```

6. Deploy schema:

```bash
npx prisma db push
```

### Option 2: Supabase

1. Daftar di https://supabase.com
2. Buat project baru
3. Copy PostgreSQL connection string
4. Update `DATABASE_URL`
5. Update schema ke PostgreSQL

### Option 3: Railway

1. Daftar di https://railway.app
2. Buat PostgreSQL database
3. Copy connection string
4. Update environment variables

## ⛓️ Smart Contract Production

### Deploy ke Ethereum Mainnet

⚠️ **PERINGATAN:** Mainnet menggunakan ETH asli yang bernilai uang!

1. Pastikan wallet punya ETH cukup (untuk gas fee)
2. Update `hardhat.config.js`:

```javascript
mainnet: {
  url: process.env.MAINNET_RPC_URL,
  accounts: [process.env.MAINNET_PRIVATE_KEY],
  chainId: 1
}
```

3. Deploy:

```bash
npx hardhat run scripts/deploy.js --network mainnet
```

4. Verify contract:

```bash
npx hardhat verify --network mainnet CONTRACT_ADDRESS
```

### Alternative: Polygon (Lebih Murah)

```javascript
polygon: {
  url: "https://polygon-rpc.com",
  accounts: [process.env.PRIVATE_KEY],
  chainId: 137
}
```

## 🔐 Security Checklist

### Environment Variables

- [ ] Semua secrets di environment variables (tidak di code)
- [ ] `.env` ada di `.gitignore`
- [ ] Private keys tidak pernah di-commit

### API Security

- [ ] Rate limiting di-enable
- [ ] Input validation di semua endpoint
- [ ] SQL injection protection (Prisma handles this)
- [ ] XSS protection

### Authentication

- [ ] NEXTAUTH_SECRET adalah random string yang kuat
- [ ] Password di-hash dengan bcrypt
- [ ] Session timeout configured
- [ ] HTTPS only di production

### Smart Contract

- [ ] Contract sudah di-audit
- [ ] Access control implemented
- [ ] Reentrancy protection
- [ ] Integer overflow protection (Solidity 0.8+)

## 📊 Monitoring

### Vercel Analytics

Enable di Vercel dashboard untuk:
- Page views
- Performance metrics
- Error tracking

### Sentry (Error Tracking)

1. Install:

```bash
npm install @sentry/nextjs
```

2. Configure:

```javascript
// sentry.client.config.js
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
});
```

### Etherscan (Contract Monitoring)

- Monitor contract transactions
- Track gas usage
- View contract events

## 🔄 CI/CD

### GitHub Actions

Buat `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: npx prisma generate
```

## 📈 Performance Optimization

### Next.js

- Enable Image Optimization
- Use Static Generation where possible
- Implement ISR (Incremental Static Regeneration)
- Code splitting

### Database

- Add indexes untuk query yang sering
- Connection pooling
- Query optimization

### Caching

- Redis untuk session storage
- CDN untuk static assets
- Browser caching headers

## 🆘 Rollback Plan

Jika deployment bermasalah:

1. **Vercel**: Klik "Rollback" di dashboard
2. **Database**: Restore dari backup
3. **Smart Contract**: Deploy contract baru (contract tidak bisa di-edit)

## 📝 Post-Deployment

- [ ] Test semua fitur di production
- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Setup alerts
- [ ] Document production URLs
- [ ] Update DNS if needed

## 🔗 Production URLs

Setelah deploy, catat:

- Frontend: https://your-app.vercel.app
- Database: [connection string]
- Smart Contract: [contract address on Etherscan]
- API Docs: https://your-app.vercel.app/api

## 💰 Cost Estimation

### Free Tier

- Vercel: Free (hobby plan)
- PlanetScale: Free (5GB storage)
- Infura: Free (100k requests/day)

### Paid (if needed)

- Vercel Pro: $20/month
- PlanetScale: $29/month
- Infura: $50/month
- Gas fees: Variable (depends on usage)

## 📞 Support

Jika ada masalah deployment:

1. Check Vercel logs
2. Check database connection
3. Verify environment variables
4. Test contract on testnet first
5. Contact support jika perlu

---

**Good luck with deployment! 🚀**
