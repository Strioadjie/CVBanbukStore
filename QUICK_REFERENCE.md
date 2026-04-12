# ⚡ Quick Reference

Cheat sheet untuk command dan informasi penting.

## 🚀 Commands

### Setup
```bash
npm install                          # Install dependencies
npx prisma generate                  # Generate Prisma Client
npx prisma migrate dev              # Run migrations
npx prisma db seed                  # Seed database
npx prisma studio                   # Open Prisma Studio
```

### Development
```bash
npm run dev                         # Start dev server
npm run build                       # Build for production
npm start                           # Start production server
npm run lint                        # Run linter
```

### Smart Contract
```bash
npx hardhat compile                 # Compile contracts
npx hardhat run scripts/deploy.js --network sepolia  # Deploy
npx hardhat run scripts/check-balance.js --network sepolia  # Check balance
```

### Database
```bash
npx prisma migrate reset            # Reset database
npx prisma migrate dev --name NAME  # Create migration
npx prisma db push                  # Push schema changes
```

## 🔑 Demo Accounts

```
Admin:    admin@test.com    / admin123
Sales:    sales@test.com    / sales123
Customer: customer@test.com / customer123
```

## 🌐 URLs

```
Local:     http://localhost:3000
Studio:    http://localhost:5555
Sepolia:   https://sepolia.etherscan.io
Faucet:    https://sepolia-faucet.pk910.de
Infura:    https://infura.io
MetaMask:  https://metamask.io
```

## 📁 Important Files

```
.env                    # Environment variables
prisma/schema.prisma    # Database schema
contracts/*.sol         # Smart contracts
hardhat.config.js       # Hardhat config
app/api/*              # API routes
components/*           # React components
```

## 🔐 Environment Variables

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="[generate-random-32-chars]"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_CONTRACT_ADDRESS="[after-deploy]"
NEXT_PUBLIC_RPC_URL="https://sepolia.infura.io/v3/[API_KEY]"
PRIVATE_KEY="[from-metamask]"
NEXT_PUBLIC_WHATSAPP_NUMBER="628123456789"
```

## 🛣️ Routes

### Public
```
/                       # Homepage
/login                  # Login page
/register               # Register page
/products               # Product catalog
```

### Protected
```
/dashboard              # Dashboard (role-based)
/products/add           # Add product (Admin)
/products/[id]/edit     # Edit product (Admin)
/products/[id]/payment  # Payment page
/wishlist               # Wishlist (Customer)
/inquiry                # Inquiry management
```

## 🔌 API Endpoints

### Auth
```
POST /api/auth/register         # Register
POST /api/auth/[...nextauth]    # Login/Logout
```

### Products
```
GET    /api/products            # List products
POST   /api/products            # Create product (Admin)
GET    /api/products/[id]       # Get product
PUT    /api/products/[id]       # Update product (Admin)
DELETE /api/products/[id]       # Delete product (Admin)
```

### Inquiry
```
GET  /api/inquiry               # List inquiries (role-based)
POST /api/inquiry               # Create inquiry
PUT  /api/inquiry/[id]          # Update inquiry
```

### Wishlist
```
GET    /api/wishlist            # List wishlist
POST   /api/wishlist            # Add to wishlist
DELETE /api/wishlist            # Remove from wishlist
```

### Transaction
```
GET  /api/transaction           # List transactions
POST /api/transaction           # Create transaction
```

### Stats
```
GET /api/stats                  # Dashboard statistics
```

### Users
```
GET /api/users                  # List users (Admin)
```

## 🎨 Tailwind Classes

### Colors
```
bg-blue-600     # Primary
bg-green-500    # Success
bg-red-500      # Danger
bg-yellow-500   # Warning
bg-pink-500     # Wishlist
```

### Common Patterns
```
className="w-full px-4 py-2 border rounded-lg"  # Input
className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"  # Button
className="grid grid-cols-1 md:grid-cols-3 gap-6"  # Grid
className="flex justify-between items-center"  # Flex
```

## 🔧 Troubleshooting

### Reset Everything
```bash
rm -rf node_modules
rm prisma/dev.db
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run dev
```

### Fix Prisma
```bash
npx prisma generate
npx prisma migrate reset
```

### Fix MetaMask
1. Switch to Sepolia
2. Refresh page
3. Reconnect wallet

### Fix Contract
```bash
npx hardhat clean
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
```

## 📊 Database Schema

```prisma
User {
  id, email, password, name, role
}

Product {
  id, name, price, stock, description, material, size, image
}

Inquiry {
  id, productId, userId, status, assignedTo, message
}

Wishlist {
  id, userId, productId
}

Transaction {
  id, userId, productId, amount, paymentType, txHash, walletAddress, status
}
```

## 🔐 Smart Contract

### Functions
```solidity
payProduct(uint256 _productId) payable  # Pay for product
withdraw()                              # Withdraw (owner)
getBalance()                            # Get balance
getPayment(uint256 _paymentId)         # Get payment details
transferOwnership(address newOwner)     # Transfer ownership
```

### Events
```solidity
PaymentReceived(paymentId, buyer, amount, productId, timestamp)
Withdrawn(owner, amount)
```

## 🎯 Testing Checklist

- [ ] Login (3 roles)
- [ ] Add product (Admin)
- [ ] Create inquiry (Customer)
- [ ] Assign inquiry (Admin)
- [ ] Update status (Sales)
- [ ] Add to wishlist (Customer)
- [ ] Pay regular (Customer)
- [ ] Pay crypto (Customer)
- [ ] Dashboard stats

## 📚 Documentation

```
README.md               # Main docs
SETUP_GUIDE.md         # Setup instructions
CARA_MENJALANKAN.md    # Quick start (ID)
INSTRUKSI_LENGKAP.md   # Full guide (ID)
TESTING_GUIDE.md       # Testing procedures
DEPLOYMENT.md          # Deployment guide
FITUR_LENGKAP.md       # Feature list
PROJECT_SUMMARY.md     # Project overview
QUICK_REFERENCE.md     # This file
```

## 🆘 Help

### Error Messages
```
"Module not found"           → npm install
"Prisma Client not found"    → npx prisma generate
"Database locked"            → Close Prisma Studio
"MetaMask not detected"      → Install MetaMask
"Wrong network"              → Switch to Sepolia
"Insufficient funds"         → Get Sepolia ETH
```

### Useful Links
- Next.js: https://nextjs.org/docs
- Prisma: https://www.prisma.io/docs
- Hardhat: https://hardhat.org/docs
- ethers.js: https://docs.ethers.org
- Tailwind: https://tailwindcss.com/docs

---

**Keep this file handy for quick reference! 📌**
