// Demo deployment script - untuk testing tanpa setup lengkap
const hre = require("hardhat");

async function main() {
  console.log("🚀 Demo Deployment Script");
  console.log("=" .repeat(50));
  console.log("");

  // Check if RPC URL and Private Key are configured
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
  const privateKey = process.env.PRIVATE_KEY;

  if (!rpcUrl || rpcUrl === "" || !privateKey || privateKey === "") {
    console.log("⚠️  RPC URL atau Private Key belum dikonfigurasi");
    console.log("");
    console.log("📝 Untuk deploy contract ke Sepolia, ikuti langkah berikut:");
    console.log("");
    console.log("1️⃣  Setup Infura:");
    console.log("   - Buka: https://infura.io");
    console.log("   - Daftar (gratis)");
    console.log("   - Buat project baru");
    console.log("   - Copy API Key");
    console.log("   - Update .env:");
    console.log('     NEXT_PUBLIC_RPC_URL="https://sepolia.infura.io/v3/YOUR_API_KEY"');
    console.log("");
    console.log("2️⃣  Setup MetaMask:");
    console.log("   - Install MetaMask extension");
    console.log("   - Buat wallet atau import existing");
    console.log("   - Switch ke Sepolia Testnet");
    console.log("   - Export Private Key:");
    console.log("     • Klik ⋮ (3 titik) → Account details");
    console.log("     • Show private key → Masukkan password");
    console.log("     • Copy private key");
    console.log("   - Update .env:");
    console.log('     PRIVATE_KEY="your-private-key-here"');
    console.log("");
    console.log("3️⃣  Dapatkan Sepolia ETH (gratis):");
    console.log("   - Buka: https://sepolia-faucet.pk910.de");
    console.log("   - Paste alamat wallet MetaMask");
    console.log("   - Start Mining → Tunggu 5-10 menit");
    console.log("   - Claim rewards");
    console.log("");
    console.log("4️⃣  Deploy Contract:");
    console.log("   npx hardhat run scripts/deploy.js --network sepolia");
    console.log("");
    console.log("📚 Panduan lengkap: Baca METAMASK_SETUP.md");
    console.log("");
    console.log("=" .repeat(50));
    console.log("");
    console.log("💡 Untuk testing tanpa crypto, gunakan:");
    console.log("   - Pembayaran Manual (sudah bisa digunakan)");
    console.log("   - Payment Gateway Midtrans (perlu setup)");
    console.log("");
    
    // Generate mock contract address for demo
    console.log("🎭 DEMO MODE: Generating mock contract address...");
    const mockAddress = "0x" + Array(40).fill(0).map(() => 
      Math.floor(Math.random() * 16).toString(16)
    ).join("");
    
    console.log("");
    console.log("📍 Mock Contract Address:", mockAddress);
    console.log("");
    console.log("⚠️  Ini adalah mock address untuk demo UI saja.");
    console.log("⚠️  Tidak bisa digunakan untuk transaksi real.");
    console.log("⚠️  Deploy ke Sepolia untuk transaksi real.");
    console.log("");
    console.log("Untuk update .env dengan mock address:");
    console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS="${mockAddress}"`);
    console.log("");
    
    return;
  }

  // If configured, proceed with real deployment
  console.log("✅ Configuration found! Proceeding with deployment...");
  console.log("");
  
  try {
    const ProductPayment = await hre.ethers.getContractFactory("ProductPayment");
    console.log("📦 Deploying ProductPayment contract...");
    
    const productPayment = await ProductPayment.deploy();
    await productPayment.waitForDeployment();
    
    const contractAddress = await productPayment.getAddress();
    
    console.log("");
    console.log("=" .repeat(50));
    console.log("✅ ProductPayment contract berhasil di-deploy!");
    console.log("=" .repeat(50));
    console.log("");
    console.log("📍 Contract Address:", contractAddress);
    console.log("");
    console.log("🔧 Langkah selanjutnya:");
    console.log("1. Copy contract address di atas");
    console.log("2. Paste ke file .env sebagai NEXT_PUBLIC_CONTRACT_ADDRESS");
    console.log("3. Restart development server (npm run dev)");
    console.log("");
    console.log("💡 Contoh:");
    console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS="${contractAddress}"`);
    console.log("");
    console.log("🔍 Verify contract di Etherscan:");
    console.log(`https://sepolia.etherscan.io/address/${contractAddress}`);
    console.log("");
    console.log("=" .repeat(50));
  } catch (error) {
    console.error("❌ Error saat deployment:", error.message);
    console.log("");
    console.log("🔍 Troubleshooting:");
    console.log("1. Pastikan balance Sepolia ETH cukup (min 0.01 ETH)");
    console.log("2. Cek RPC URL di .env");
    console.log("3. Cek Private Key di .env");
    console.log("4. Coba lagi dalam beberapa menit");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
