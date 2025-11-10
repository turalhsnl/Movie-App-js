"use client";
import { useCallback } from "react";
import { useAuth } from "./auth/AuthProvider";

export default function WalletConnect() {
  const { account, profile, hasProvider, connect, disconnect, isConnecting, error, setError, isAuthenticated } = useAuth();

  const handleConnect = useCallback(async () => {
    setError(null);
    try {
      await connect();
    } catch {
      // error handled by auth context
    }
  }, [connect, setError]);

  const handleDisconnect = useCallback(() => {
    disconnect();
  }, [disconnect]);

  if (!hasProvider) {
    return <span className="text-sm opacity-75">MetaMask not detected</span>;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-end gap-1">
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isConnecting ? "Connecting…" : "Connect Wallet"}
        </button>
        {error ? <span className="text-xs text-red-400">{error}</span> : null}
      </div>
    );
  }

  const label = profile?.displayName || (account ? `${account.slice(0, 6)}…${account.slice(-4)}` : "Connected");

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2 text-sm bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-1" title={account || undefined}>
        <span className="font-medium">{label}</span>
        <button
          type="button"
          onClick={handleDisconnect}
          className="text-xs font-medium underline opacity-70 hover:opacity-100"
        >
          Sign out
        </button>
      </div>
      {error ? <span className="text-xs text-red-400">{error}</span> : null}
    </div>
  );
}
