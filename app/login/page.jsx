"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../components/auth/AuthProvider";
import { saveProfile } from "@/lib/metamaskProfiles";

const statusTone = {
  success: "text-emerald-400",
  error: "text-red-400",
  info: "text-sky-400",
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={<main className="max-w-4xl space-y-6">Checking your MetaMask sign-in page…</main>}
    >
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const {
    account,
    profile,
    hasProvider,
    connect,
    disconnect,
    isConnecting,
    isAuthenticated,
    error,
    setError,
  } = useAuth();
  const [profileName, setProfileName] = useState(profile?.displayName || "");
  const [status, setStatus] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams?.get("redirect") || "/";
  const safeRedirect = redirectParam.startsWith("/") && redirectParam !== "/login" ? redirectParam : "/";
  const hasRedirect = searchParams?.has("redirect");

  useEffect(() => {
    setProfileName(profile?.displayName || "");
  }, [profile?.displayName]);

  const handleConnect = useCallback(async () => {
    setStatus(null);
    setError(null);
    try {
      await connect();
      setStatus({ type: "success", message: "Wallet connected." });
    } catch (err) {
      setStatus({ type: "error", message: err?.message || "Failed to connect wallet." });
    }
  }, [connect, setError]);

  const handleSaveProfile = event => {
    event.preventDefault();
    if (!account) {
      setStatus({ type: "error", message: "Connect your wallet before saving a profile." });
      return;
    }

    setIsSaving(true);
    const trimmed = profileName.trim();
    try {
      const ok = saveProfile(account, { displayName: trimmed });
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

  const handleSignOut = useCallback(() => {
    disconnect();
    setStatus({ type: "info", message: "Disconnected from MetaMask." });
  }, [disconnect]);

  const handleContinue = useCallback(() => {
    if (!isAuthenticated) return;
    router.replace(safeRedirect);
  }, [isAuthenticated, router, safeRedirect]);

  useEffect(() => {
    if (!isAuthenticated || !hasRedirect) {
      return;
    }

    setStatus(previous => {
      if (previous?.type === "error") {
        return previous;
      }
      return { type: "success", message: "Wallet connected. Redirecting you to the app…" };
    });

    const timeout = setTimeout(() => {
      router.replace(safeRedirect);
    }, 800);

    return () => clearTimeout(timeout);
  }, [hasRedirect, isAuthenticated, router, safeRedirect]);

  const statusClass = status ? statusTone[status.type] || "text-sky-400" : "";

  const connectLabel = useMemo(() => {
    if (isConnecting) return "Connecting…";
    if (account) return "Reconnect wallet";
    return "Connect wallet";
  }, [account, isConnecting]);

  return (
    <section className="max-w-4xl space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">MetaMask Sign In</h1>
        <p className="opacity-80">
          Link your MetaMask wallet to personalise your watchlist and keep your preferences stored securely on your device.
        </p>
      </div>

      {!hasProvider ? (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-5 space-y-2">
          <p className="font-semibold text-amber-300">MetaMask is not available in this browser.</p>
          <p className="text-sm opacity-90">
            Install the{" "}
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
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">Log in with MetaMask</h2>
              <p className="text-sm opacity-80">
                Connect your wallet to access the Movie App dashboard and sync your personalised watchlist.
              </p>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4 space-y-2">
              <p className="text-sm font-medium">Connection status</p>
              {account ? (
                <p className="text-xs font-mono break-all text-emerald-300">{account}</p>
              ) : (
                <p className="text-sm opacity-75">You are not connected yet.</p>
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
              {account ? (
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="rounded-xl border border-neutral-700 px-4 py-2 text-sm font-medium transition hover:border-neutral-500 hover:bg-neutral-800"
                >
                  Disconnect
                </button>
              ) : null}
            </div>

            {status ? <p className={`text-sm ${statusClass}`}>{status.message}</p> : null}
            {error ? <p className="text-sm text-red-400">{error}</p> : null}

            <button
              type="button"
              onClick={handleContinue}
              disabled={!isAuthenticated}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {hasRedirect ? "Redirecting…" : "Continue to app"}
            </button>
            <p className="text-xs opacity-70">
              {hasRedirect
                ? "Hang tight—once your wallet is linked we’ll take you back to where you left off."
                : `You’ll be redirected to ${safeRedirect === "/" ? "the home page" : safeRedirect} after connecting.`}
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">Create your profile</h2>
              <p className="text-sm opacity-80">
                Save a display name so we can greet you inside the app. It stays on this device alongside your wallet address.
              </p>
            </div>

            {account ? (
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
              <div className="rounded-xl border border-dashed border-neutral-700 p-4 text-sm opacity-70">
                Connect your wallet first to unlock profile personalisation.
              </div>
            )}
          </div>
        </div>
      )}

      <div className="space-y-2 text-sm opacity-70">
        <p>
          Your connection data never leaves this browser. We only use it to remember which movies you save to your watchlist.
        </p>
        <p>
          Want to start exploring? Visit the{" "}
          <Link href="/">popular movies page</Link>
          {" "}
          or build a curated list in your{" "}
          <Link href="/watchlist">watchlist</Link>
          .
        </p>
      </div>
    </section>
  );
}
