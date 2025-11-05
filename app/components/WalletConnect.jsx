"use client";
import { useEffect, useState } from "react";

export default function WalletConnect() {
  const [address, setAddress] = useState(null);
  const hasProvider = typeof window !== "undefined" && window.ethereum;

  useEffect(() => {
    if (!hasProvider) return;
    window.ethereum.request({ method: "eth_accounts" }).then(accs => setAddress(accs?.[0] || null));
    const onChange = (accs)=> setAddress(accs?.[0] || null);
    window.ethereum.on?.("accountsChanged", onChange);
    return () => window.ethereum?.removeListener?.("accountsChanged", onChange);
  }, [hasProvider]);

  const connect = async () => {
    if (!hasProvider) return;
    const accs = await window.ethereum.request({ method: "eth_requestAccounts" });
    setAddress(accs?.[0] || null);
  };

  if (!hasProvider) return <span className="text-sm opacity-75">MetaMask not detected</span>;
  return address
    ? <span className="text-sm bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-1">{address.slice(0,6)}…{address.slice(-4)}</span>
    : <button onClick={connect} className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3 py-2 text-sm">Connect Wallet</button>;
}
