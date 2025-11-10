"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  clearPersistedAccount,
  connectWallet,
  getConnectedAccount,
  hasMetamask,
  loadPersistedAccount,
  subscribeToAccountChanges,
} from "@/lib/metamask";
import { loadProfile, saveProfile } from "@/lib/metamaskProfiles";

const statusTone = {
  success: "text-emerald-400",
  error: "text-red-400",
  info: "text-sky-400",
};

export default function LoginPage() {
  const [hasProvider, setHasProvider] = useState(false);
  const [address, setAddress] = useState(null);
  const [profileName, setProfileName] = useState("");
  const [status, setStatus] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const applyAccount = useCallback(account => {
    setAddress(account);
    if (account) {
      const profile = loadProfile(account);
      setProfileName(profile?.displayName || "");
    } else {
      setProfileName("");
    }
  }, []);

  useEffect(() => {
    const available = hasMetamask();
    setHasProvider(available);
    if (!available) return undefined;

    const persisted = loadPersistedAccount();
    if (persisted) {
      applyAccount(persisted);
    }

    getConnectedAccount()
      .then(account => {
        if (account) {
          applyAccount(account);
        }
      })
      .catch(() => {
        /* ignore lookup errors */
      });

    return subscribeToAccountChanges(nextAccount => {
      applyAccount(nextAccount);
      setStatus(null);
    });
  }, [applyAccount]);

  const handleConnect = async () => {
    setStatus(null);
    setIsConnecting(true);
    try {
      const account = await connectWallet();
      applyAccount(account);
      setStatus({ type: "success", message: "Wallet connected" });
    } catch (err) {
      setStatus({ type: "error", message: err?.message || "Failed to connect wallet" });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSaveProfile = event => {
    event.preventDefault();
    if (!address) {
      setStatus({ type: "error", message: "Connect your wallet before saving a profile." });
      return;
    }

    setIsSaving(true);
    const trimmed = profileName.trim();
    try {
      const ok = saveProfile(address, { displayName: trimmed });
      if (!ok) {
        throw new Error("Failed to persist profile");
      }
      setProfileName(trimmed);
      setStatus({
        type: "success",
        message: trimmed ? "Profile saved." : "Profile cleared.",
      });
    } catch {
      setStatus({
        type: "error",
        message: "We couldn't save your profile. Check your browser storage permissions and try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = () => {
    clearPersistedAccount();
    applyAccount(null);
    setStatus({ type: "info", message: "Disconnected from MetaMask." });
  };

  const statusClass = status ? statusTone[status.type] || "text-sky-400" : "";

  const connectLabel = useMemo(() => {
    if (isConnecting) return "Connecting…";
    if (address) return "Reconnect wallet";
    return "Connect wallet";
  }, [address, isConnecting]);

  return (
    <section className="max-w-2xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">MetaMask Sign In</h1>
        <p className="opacity-80">
          Link your MetaMask wallet to personalise your watchlist and keep your preferences stored securely on your
          device.
        </p>
      </div>

      {!hasProvider ? (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-5 space-y-2">
          <p className="font-semibold text-amber-300">MetaMask is not available in this browser.</p>
          <p className="text-sm opacity-90">
            Install the
            {" "}
            <a
              href="https://metamask.io/download/"
              className="underline hover:opacity-80"
              rel="noreferrer"
              target="_blank"
            >
              MetaMask extension
            </a>
            {" "}
            and refresh this page to continue.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 space-y-5">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">Wallet status</h2>
            {address ? (
              <p className="text-sm opacity-80">
                Connected as
                {" "}
                <span className="font-mono text-neutral-100">{address}</span>
              </p>
            ) : (
              <p className="text-sm opacity-80">You are not connected yet.</p>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleConnect}
              disabled={isConnecting}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {connectLabel}
            </button>
            {address ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-xl border border-neutral-700 px-4 py-2 text-sm font-medium transition hover:border-neutral-500 hover:bg-neutral-800"
              >
                Sign out
              </button>
            ) : null}
          </div>

          {status ? <p className={`text-sm ${statusClass}`}>{status.message}</p> : null}

          {address ? (
            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div className="space-y-1">
                <label htmlFor="displayName" className="text-sm font-medium">
                  Display name
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={profileName}
                  onChange={event => setProfileName(event.target.value)}
                  placeholder="e.g. Movie Buff"
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
                />
                <p className="text-xs opacity-70">
                  This nickname is stored locally with your wallet address so we can greet you across the app.
                </p>
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "Saving…" : "Save profile"}
              </button>
            </form>
          ) : (
            <p className="text-sm opacity-70">
              Once you connect your wallet you can create a profile name that appears next to your address in the
              header.
            </p>
          )}
        </div>
      )}

      <div className="space-y-2 text-sm opacity-70">
        <p>
          Your connection data never leaves this browser. We only use it to remember which movies you save to your
          watchlist.
        </p>
        <p>
          Want to start exploring? Visit the
          {" "}
          <Link href="/">popular movies page</Link>
          {" "}
          or build a curated list in your
          {" "}
          <Link href="/watchlist">watchlist</Link>
          .
        </p>
      </div>
    </section>
  );
}
