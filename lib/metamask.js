const STORAGE_KEY = "metamask:primaryAccount";

const isBrowser = () => typeof window !== "undefined";

const normalizeAddress = address => (typeof address === "string" ? address.toLowerCase() : null);

const setPersistedAccount = account => {
  if (!isBrowser()) return;
  if (account) {
    window.localStorage.setItem(STORAGE_KEY, account);
  } else {
    window.localStorage.removeItem(STORAGE_KEY);
  }
};

export const hasMetamask = () => {
  return isBrowser() && !!window.ethereum;
};

export const getMetamaskProvider = () => {
  if (!hasMetamask()) return null;
  return window.ethereum;
};

export const loadPersistedAccount = () => {
  if (!isBrowser()) return null;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored ? normalizeAddress(stored) : null;
};

export const clearPersistedAccount = () => setPersistedAccount(null);

export const getConnectedAccount = async () => {
  const provider = getMetamaskProvider();
  if (!provider) return null;
  const accounts = await provider.request({ method: "eth_accounts" });
  const account = normalizeAddress(accounts?.[0]);
  setPersistedAccount(account);
  return account;
};

export const connectWallet = async () => {
  const provider = getMetamaskProvider();
  if (!provider) throw new Error("MetaMask provider not available");
  const accounts = await provider.request({ method: "eth_requestAccounts" });
  const account = normalizeAddress(accounts?.[0]);
  if (!account) {
    throw new Error("No MetaMask accounts were returned");
  }
  setPersistedAccount(account);
  return account;
};

export const subscribeToAccountChanges = callback => {
  const provider = getMetamaskProvider();
  if (!provider?.on) return () => {};

  const handler = accounts => {
    const account = normalizeAddress(accounts?.[0]);
    setPersistedAccount(account);
    callback?.(account);
  };

  provider.on("accountsChanged", handler);
  return () => provider.removeListener?.("accountsChanged", handler);
};
