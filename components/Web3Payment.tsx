"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";

const CONTRACT_ABI = [
  "function payProduct(uint256 _productId) public payable",
  "function getBalance() public view returns (uint256)",
  "event PaymentReceived(uint256 indexed paymentId, address indexed buyer, uint256 amount, uint256 productId, uint256 timestamp)"
];

interface Web3PaymentProps {
  productId: string;
  productName: string;
  price: number;
  onSuccess: (txHash: string, walletAddress: string) => void;
}

export default function Web3Payment({ productId, productName, price, onSuccess }: Web3PaymentProps) {
  const sepoliaChainId = BigInt(11155111);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isConfigured, setIsConfigured] = useState(true);
  const [balance, setBalance] = useState("0");
  const [network, setNetwork] = useState("");
  const [txStatus, setTxStatus] = useState("");

  useEffect(() => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
    if (!contractAddress || contractAddress === "") {
      setIsConfigured(false);
    }

    checkConnection();
  }, []);

  const checkConnection = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          setWalletAddress(address);
          setIsConnected(true);
          await updateBalance(address);
          await checkNetwork();
        }
      } catch (error) {
        console.log("Not connected yet");
      }
    }
  };

  const updateBalance = async (address: string) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const walletBalance = await provider.getBalance(address);
      setBalance(ethers.formatEther(walletBalance));
    } catch (error) {
      console.error("Error getting balance:", error);
    }
  };

  const checkNetwork = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const currentNetwork = await provider.getNetwork();
      setNetwork(currentNetwork.name);

      if (currentNetwork.chainId !== sepoliaChainId) {
        setError("Silakan switch ke Sepolia Testnet di MetaMask.");
      } else {
        setError("");
      }
    } catch (error) {
      console.error("Error checking network:", error);
    }
  };

  const connectWallet = async () => {
    try {
      setError("");
      setLoading(true);

      if (!window.ethereum) {
        setError("MetaMask tidak terdeteksi. Silakan install MetaMask terlebih dahulu.");
        setLoading(false);
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);

      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      setWalletAddress(address);
      setIsConnected(true);

      await updateBalance(address);
      await checkNetwork();
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Gagal connect wallet");
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError("");
      setTxStatus("Mempersiapkan transaksi...");

      if (!window.ethereum) {
        throw new Error("MetaMask tidak terdeteksi");
      }

      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
      if (!contractAddress) {
        throw new Error("Contract address belum di-set");
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const currentNetwork = await provider.getNetwork();

      if (currentNetwork.chainId !== sepoliaChainId) {
        throw new Error("Silakan switch ke Sepolia Testnet");
      }

      const currentBalance = await provider.getBalance(walletAddress);
      const ethAmount = "0.001";
      const valueInWei = ethers.parseEther(ethAmount);

      if (currentBalance < valueInWei) {
        throw new Error("Balance tidak cukup. Minimal 0.001 ETH ditambah gas fee");
      }

      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);

      setTxStatus("Menunggu konfirmasi di MetaMask...");

      let productIdHash = 0;
      for (let i = 0; i < productId.length; i++) {
        productIdHash = ((productIdHash << 5) - productIdHash) + productId.charCodeAt(i);
        productIdHash &= productIdHash;
      }
      productIdHash = Math.abs(productIdHash);

      const tx = await contract.payProduct(productIdHash, { value: valueInWei });
      setTxStatus(`Transaksi dikirim: ${tx.hash.slice(0, 10)}...`);

      const receipt = await tx.wait();
      setTxStatus("Pembayaran berhasil dan sudah terkonfirmasi.");

      await updateBalance(walletAddress);

      setTimeout(() => {
        onSuccess(receipt.hash, walletAddress);
      }, 1500);
    } catch (err: any) {
      let errorMessage = "Pembayaran gagal";
      if (err.code === "ACTION_REJECTED") {
        errorMessage = "Transaksi dibatalkan oleh user";
      } else if (err.message?.includes("insufficient funds")) {
        errorMessage = "Balance tidak cukup untuk transaksi dan gas fee";
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setTxStatus("");
    } finally {
      setLoading(false);
    }
  };

  if (!isConfigured) {
    return (
      <div className="glass-panel p-6">
        <h3 className="text-2xl font-semibold text-slate-50">Pembayaran crypto belum siap</h3>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          Smart contract belum di-deploy. Isi contract address di file `.env`, lalu restart aplikasi untuk mengaktifkan checkout ETH.
        </p>
        <div className="mt-5 rounded-[24px] bg-slate-900 p-5 text-sm text-white">
          <p className="font-semibold">Langkah singkat</p>
          <p className="mt-2 leading-7 text-white/75">
            Compile contract, deploy ke Sepolia, salin address hasil deploy ke `NEXT_PUBLIC_CONTRACT_ADDRESS`, lalu hubungkan MetaMask ke Sepolia Testnet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl font-semibold text-slate-50">Pembayaran Crypto</h3>
          <p className="mt-2 text-sm leading-7 text-slate-300">
            Gunakan ETH di Sepolia untuk uji coba pembayaran blockchain.
          </p>
        </div>
        <span className="status-pill bg-indigo-500/15 text-indigo-300">ETH Sepolia</span>
      </div>

      <div className="mt-5 rounded-[24px] bg-slate-950/55 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Produk</p>
            <p className="mt-2 text-lg font-semibold text-slate-50">{productName}</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Nilai transfer</p>
            <p className="mt-2 text-lg font-semibold text-indigo-300">0.001 ETH</p>
            <p className="text-sm text-slate-500">Sekitar Rp {price.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {isConnected && (
        <div className="mt-5 rounded-[24px] border border-emerald-500/20 bg-emerald-500/10 p-5 text-sm text-slate-200">
          <div className="flex items-center justify-between gap-4">
            <p className="font-semibold text-emerald-300">Wallet terhubung</p>
            <span className="status-pill bg-slate-950/70 text-emerald-300">Aktif</span>
          </div>
          <div className="mt-3 space-y-2">
            <p>Address: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</p>
            <p>Balance: {parseFloat(balance).toFixed(4)} ETH</p>
            <p>Network: {network}</p>
          </div>
        </div>
      )}

      {txStatus && (
        <div className="mt-5 rounded-[24px] border border-sky-200 bg-sky-50 px-5 py-4 text-sm text-sky-700">
          {txStatus}
        </div>
      )}

      {error && (
        <div className="mt-5 rounded-[24px] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!isConnected ? (
        <button onClick={connectWallet} disabled={loading} className="app-button-primary mt-6 w-full">
          {loading ? "Menghubungkan wallet..." : "Connect MetaMask"}
        </button>
      ) : (
        <button onClick={handlePayment} disabled={loading || !!error} className="app-button-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-60">
          {loading ? "Memproses pembayaran..." : "Bayar dengan ETH"}
        </button>
      )}

        <div className="mt-5 rounded-[24px] bg-slate-950/40 px-5 py-4 text-sm leading-7 text-slate-300">
        Pastikan Anda menggunakan Sepolia Testnet dan punya ETH testnet yang cukup untuk nilai transfer dan gas fee.
      </div>
    </div>
  );
}

declare global {
  interface Window {
    ethereum?: any;
  }
}
