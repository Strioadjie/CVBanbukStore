// Script untuk cek balance wallet
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("Checking balance for:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  const balanceInEth = hre.ethers.formatEther(balance);
  
  console.log("Balance:", balanceInEth, "ETH");
  
  if (parseFloat(balanceInEth) < 0.01) {
    console.log("\n⚠️  Balance terlalu rendah!");
    console.log("Dapatkan Sepolia ETH gratis di:");
    console.log("- https://sepolia-faucet.pk910.de");
    console.log("- https://sepoliafaucet.com");
  } else {
    console.log("\n✅ Balance cukup untuk deploy contract");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
