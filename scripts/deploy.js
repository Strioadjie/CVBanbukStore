// Script untuk deploy ProductPayment contract ke Sepolia
const hre = require("hardhat");

async function main() {
  console.log("🚀 Memulai deployment ProductPayment contract...");

  // Ambil contract factory
  const ProductPayment = await hre.ethers.getContractFactory("ProductPayment");
  
  console.log("📦 Deploying contract...");
  
  // Deploy contract
  const productPayment = await ProductPayment.deploy();
  
  // Tunggu sampai contract ter-deploy
  await productPayment.waitForDeployment();
  
  const contractAddress = await productPayment.getAddress();
  
  console.log("✅ ProductPayment contract berhasil di-deploy!");
  console.log("📍 Contract Address:", contractAddress);
  console.log("");
  console.log("🔧 Langkah selanjutnya:");
  console.log("1. Copy contract address di atas");
  console.log("2. Paste ke file .env sebagai NEXT_PUBLIC_CONTRACT_ADDRESS");
  console.log("3. Restart development server (npm run dev)");
  console.log("");
  console.log("💡 Contoh:");
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS="${contractAddress}"`);
}

// Jalankan script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error saat deployment:", error);
    process.exit(1);
  });
