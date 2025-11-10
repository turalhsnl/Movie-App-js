"use client";
import { useEffect, useState } from "react";
import {
  connectWallet,
  getConnectedAccount,
  hasMetamask,
  loadPersistedAccount,
  subscribeToAccountChanges,
} from "@/lib/metamask";
import { loadProfile, subscribeToProfileChanges } from "@/lib/metamaskProfiles";

export default function WalletConnect() {
  const [address, setAddress] = useState(null);
  const [hasProvider, setHasProvider] = useState(false);
  const [error, setError] = useState(null);
  const [profileName, setProfileName] = useState("");

  useEffect(() => {
    const available = hasMetamask();
    setHasProvider(available);
    if (!available) return;

    setAddress(loadPersistedAccount());

    getConnectedAccount()
      .then(account => {
        if (account) setAddress(account);
      })
      .catch(() => {
        /* ignored */
      });

    return subscribeToAccountChanges(account => {
      setAddress(account);
    });
  }, []);

  useEffect(() => {
    if (!address) {
      setProfileName("");
      return undefined;
    }

    const updateProfile = () => {
      const profile = loadProfile(address);
      setProfileName(profile?.displayName || "");
    };

    updateProfile();
    return subscribeToProfileChanges(updateProfile);
  }, [address]);

  const handleConnect = async () => {
    setError(null);
    try {
      const account = await connectWallet();
      setAddress(account);
    } catch (err) {
      const message = err?.message || "Failed to connect wallet";
      setError(message);
    }
  };

  if (!hasProvider) {
    return <span className="text-sm opacity-75">MetaMask not detected</span>;
  }

  return (
    <div className="flex flex-col items-end gap-1">
      {address ? (
        <span className="text-sm bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-1" title={address}>
          {profileName ? (
            <>
              <span className="font-medium">{profileName}</span>
              <span className="opacity-70"> ({address.slice(0, 6)}…{address.slice(-4)})</span>
            </>
          ) : (
            `${address.slice(0, 6)}…${address.slice(-4)}`
          )}
        </span>
      ) : (
        <button
          onClick={handleConnect}
          className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3 py-2 text-sm"
        >
          Connect Wallet
        </button>
      )}
      {error ? <span className="text-xs text-red-400">{error}</span> : null}
    </div>
  );
}
