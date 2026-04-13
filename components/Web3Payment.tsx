"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";

const CONTRACT_ABI = [
  "function payProduct(uint256 _productId) public payable",
  "function getBalance() public view returns (uint256)",
  "event PaymentReceived(uint256 indexed paymentId, address indexed buyer, uint256 amount, uint256 productId, uint256 timestamp)"
];

type SupportedChainConfig = {
  chainId: bigint;
  chainName: string;
  currencySymbol: string;
  rpcUrl?: string;
  blockExplorerUrl?: string;
};

const KNOWN_CHAINS: Record<string, SupportedChainConfig> = {
  "1": {
    chainId: BigInt(1),
    chainName: "Ethereum Mainnet",
    currencySymbol: "ETH",
    rpcUrl: "https://ethereum-rpc.publicnode.com",
    blockExplorerUrl: "https://etherscan.io",
  },
  "11155111": {
    chainId: BigInt(11155111),
    chainName: "Sepolia Testnet",
    currencySymbol: "ETH",
    rpcUrl: "https://ethereum-sepolia-rpc.publicnode.com",
    blockExplorerUrl: "https://sepolia.etherscan.io",
  },
};

function getConfiguredChain(): SupportedChainConfig {
  const chainIdFromEnv = process.env.NEXT_PUBLIC_CHAIN_ID;
  const chainNameFromEnv = process.env.NEXT_PUBLIC_CHAIN_NAME;
  const currencyFromEnv = process.env.NEXT_PUBLIC_CHAIN_CURRENCY_SYMBOL;
  const rpcUrlFromEnv = process.env.NEXT_PUBLIC_RPC_URL;

  if (chainIdFromEnv && KNOWN_CHAINS[chainIdFromEnv]) {
    const knownChain = KNOWN_CHAINS[chainIdFromEnv];
    return {
      ...knownChain,
      chainName: chainNameFromEnv || knownChain.chainName,
      currencySymbol: currencyFromEnv || knownChain.currencySymbol,
      rpcUrl: rpcUrlFromEnv || knownChain.rpcUrl,
    };
  }

  if (rpcUrlFromEnv?.toLowerCase().includes("sepolia")) {
    return {
      ...KNOWN_CHAINS["11155111"],
      chainName: chainNameFromEnv || KNOWN_CHAINS["11155111"].chainName,
      currencySymbol: currencyFromEnv || KNOWN_CHAINS["11155111"].currencySymbol,
      rpcUrl: rpcUrlFromEnv,
    };
  }

  if (rpcUrlFromEnv?.toLowerCase().includes("mainnet") || rpcUrlFromEnv?.toLowerCase().includes("ethereum-rpc")) {
    return {
      ...KNOWN_CHAINS["1"],
      chainName: chainNameFromEnv || KNOWN_CHAINS["1"].chainName,
      currencySymbol: currencyFromEnv || KNOWN_CHAINS["1"].currencySymbol,
      rpcUrl: rpcUrlFromEnv,
    };
  }

  return {
    ...KNOWN_CHAINS["11155111"],
    chainName: chainNameFromEnv || KNOWN_CHAINS["11155111"].chainName,
    currencySymbol: currencyFromEnv || KNOWN_CHAINS["11155111"].currencySymbol,
    rpcUrl: rpcUrlFromEnv || KNOWN_CHAINS["11155111"].rpcUrl,
  };
}

interface Web3PaymentProps {
  productId: string;
  productName: string;
  price: number;
  onSuccess: (txHash: string, walletAddress: string) => void;
}

export default function Web3Payment({ productId, productName, price, onSuccess }: Web3PaymentProps) {
  const configuredChain = getConfiguredChain();
  const configuredChainId = configuredChain.chainId;
  const configuredChainName = configuredChain.chainName;
  const configuredCurrencySymbol = configuredChain.currencySymbol;
  const displayNetworkLabel = process.env.NEXT_PUBLIC_NETWORK_LABEL || "Ethereum";
  const fixedEthAmount = "0.001";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isConfigured, setIsConfigured] = useState(true);
  const [balance, setBalance] = useState("0");
  const [network, setNetwork] = useState("");
  const [txStatus, setTxStatus] = useState("");

  const switchNetwork = async () => {
    if (!window.ethereum) {
      setError("MetaMask tidak terdeteksi");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: ethers.toBeHex(Number(configuredChainId)) }],
      });

      await checkNetwork();
      if (walletAddress) {
        await updateBalance(walletAddress);
      }
    } catch (err: any) {
      if (err?.code === 4902 && configuredChain.rpcUrl) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: ethers.toBeHex(Number(configuredChainId)),
              chainName: configuredChainName,
              nativeCurrency: {
                name: configuredCurrencySymbol,
                symbol: configuredCurrencySymbol,
                decimals: 18,
              },
              rpcUrls: [configuredChain.rpcUrl],
              blockExplorerUrls: configuredChain.blockExplorerUrl ? [configuredChain.blockExplorerUrl] : undefined,
            }],
          });

          await checkNetwork();
          if (walletAddress) {
            await updateBalance(walletAddress);
          }
        } catch (addError: any) {
          setError(addError?.message || `Gagal menambahkan ${configuredChainName} ke MetaMask`);
        }
      } else {
        setError(err?.message || "Gagal menyinkronkan jaringan wallet");
      }
    } finally {
      setLoading(false);
    }
  };

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

      if (currentNetwork.chainId !== configuredChainId) {
        setError("Jaringan wallet belum sesuai untuk checkout ETH ini.");
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

      if (currentNetwork.chainId !== configuredChainId) {
        throw new Error("Jaringan wallet belum sesuai untuk checkout ETH ini.");
      }

      const currentBalance = await provider.getBalance(walletAddress);
      const valueInWei = ethers.parseEther(fixedEthAmount);

      if (currentBalance < valueInWei) {
        throw new Error(`Balance tidak cukup. Minimal ${fixedEthAmount} ${configuredCurrencySymbol} ditambah gas fee`);
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
      <div className="glass-panel border border-white/6 bg-[#141416]/50 p-5 sm:p-6">
        <h3 className="text-xl font-semibold text-slate-50">Pembayaran crypto belum siap</h3>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Smart contract belum di-deploy. Isi contract address di file `.env`, lalu restart aplikasi untuk mengaktifkan checkout ETH.
        </p>
        <div className="mt-4 rounded-[22px] border border-white/8 bg-slate-900/70 p-4 text-sm text-white">
          <p className="font-semibold">Langkah singkat</p>
          <p className="mt-2 leading-6 text-white/75">
            Compile contract, deploy ke jaringan Ethereum yang dipakai aplikasi, salin address hasil deploy ke `NEXT_PUBLIC_CONTRACT_ADDRESS`, lalu hubungkan MetaMask ke jaringan yang sesuai.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel border border-white/6 bg-[#141416]/50 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-slate-50">Pembayaran crypto</h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Gunakan wallet Ethereum untuk menyelesaikan pembayaran blockchain secara langsung.
          </p>
        </div>
        <span className="status-pill bg-indigo-500/15 text-indigo-300">{displayNetworkLabel}</span>
      </div>

      <div className="mt-5 rounded-[22px] border border-white/8 bg-slate-950/45 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Produk</p>
            <p className="mt-1.5 text-base font-semibold text-slate-50">{productName}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Nilai transfer</p>
            <p className="mt-1.5 text-base font-semibold text-indigo-300">{fixedEthAmount} {configuredCurrencySymbol}</p>
            <p className="text-sm text-slate-500">Sekitar Rp {price.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {isConnected && (
        <div className="mt-4 rounded-[22px] border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-slate-200">
          <div className="flex items-center justify-between gap-4">
            <p className="font-semibold text-emerald-300">Wallet terhubung</p>
            <span className="status-pill bg-slate-950/70 text-emerald-300">Aktif</span>
          </div>
          <div className="mt-3 space-y-2">
            <p>Address: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</p>
            <p>Balance: {parseFloat(balance).toFixed(4)} {configuredCurrencySymbol}</p>
            <p>Network: {network}</p>
          </div>
        </div>
      )}

      {txStatus && (
        <div className="mt-4 rounded-[22px] border border-sky-500/20 bg-sky-500/10 px-4 py-4 text-sm text-sky-200">
          {txStatus}
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-[22px] border border-red-500/20 bg-red-500/10 px-4 py-4 text-sm text-red-200">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p>{error}</p>
            {isConnected && network !== "" && (
              <button
                type="button"
                onClick={switchNetwork}
                disabled={loading}
                className="rounded-full border border-red-300/20 bg-red-950/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-red-100 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Menyinkronkan..." : "Sinkronkan jaringan"}
              </button>
            )}
          </div>
        </div>
      )}

      {!isConnected ? (
        <button onClick={connectWallet} disabled={loading} className="app-button-primary mt-5 w-full sm:w-auto">
          {loading ? "Menghubungkan wallet..." : "Connect MetaMask"}
        </button>
      ) : (
        <button onClick={handlePayment} disabled={loading || !!error} className="app-button-primary mt-5 w-full disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">
          {loading ? "Memproses pembayaran..." : "Bayar dengan ETH"}
        </button>
      )}

    </div>
  );
}

declare global {
  interface Window {
    ethereum?: any;
  }
}
