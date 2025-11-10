"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  clearPersistedAccount,
  connectWallet,
  getConnectedAccount,
  hasMetamask,
  loadPersistedAccount,
  normalizeAddress,
  subscribeToAccountChanges,
} from "@/lib/metamask";
import { loadProfile, subscribeToProfileChanges } from "@/lib/metamaskProfiles";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [profile, setProfile] = useState(null);
  const [hasProvider, setHasProvider] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const available = hasMetamask();
    setHasProvider(available);
    if (!available) {
      setIsReady(true);
      return undefined;
    }

    const applyAccount = nextAccount => {
      const normalised = normalizeAddress(nextAccount);
      setAccount(normalised);
      setProfile(normalised ? loadProfile(normalised) : null);
    };

    const persisted = loadPersistedAccount();
    if (persisted) {
      applyAccount(persisted);
    }

    let cancelled = false;
    getConnectedAccount()
      .then(current => {
        if (cancelled) return;
        if (current) {
          applyAccount(current);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsReady(true);
        }
      });

    const unsubscribe = subscribeToAccountChanges(applyAccount);

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    if (!account) {
      setProfile(null);
      return undefined;
    }

    const updateProfile = () => {
      setProfile(loadProfile(account) || null);
    };

    updateProfile();
    return subscribeToProfileChanges(updateProfile);
  }, [account]);

  const connect = useCallback(async () => {
    setError(null);
    setIsConnecting(true);
    try {
      const nextAccount = await connectWallet();
      const normalised = normalizeAddress(nextAccount);
      setAccount(normalised);
      setProfile(normalised ? loadProfile(normalised) : null);
      return normalised;
    } catch (err) {
      const message = err?.message || "Failed to connect wallet";
      setError(message);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    clearPersistedAccount();
    setAccount(null);
    setProfile(null);
    setError(null);
  }, []);

  const value = useMemo(
    () => ({
      account,
      profile,
      hasProvider,
      isReady,
      isAuthenticated: !!account,
      isConnecting,
      error,
      connect,
      disconnect,
      setError,
    }),
    [account, profile, hasProvider, isReady, isConnecting, error, connect, disconnect, setError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
