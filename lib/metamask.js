const STORAGE_KEY = "metamask:primaryAccount";

const isBrowser = () => typeof window !== "undefined";

export const normalizeAddress = address => (typeof address === "string" ? address.toLowerCase() : null);

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

let connectPromise = null;

const normaliseMetamaskError = error => {
  if (!error) {
    return new Error("Unknown MetaMask error");
  }

  const code = typeof error.code === "number" ? error.code : null;
  const message = typeof error.message === "string" ? error.message : "";
  const lowerMessage = message.toLowerCase();

  if (code === -32002 || lowerMessage.includes("request already pending")) {
    return new Error(
      "MetaMask already has a pending request. Open the extension to finish the previous action before trying again.",
    );
  }

  if (lowerMessage.includes("incoming request")) {
    return new Error("MetaMask is still handling another request. Please approve or reject it, then try again.");
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error(message || "Failed to communicate with MetaMask");
};

export const connectWallet = async () => {
  const provider = getMetamaskProvider();
  if (!provider) throw new Error("MetaMask provider not available");

  if (!connectPromise) {
    connectPromise = provider
      .request({ method: "eth_requestAccounts" })
      .then(accounts => {
        const account = normalizeAddress(accounts?.[0]);
        if (!account) {
          throw new Error("No MetaMask accounts were returned");
        }
        setPersistedAccount(account);
        return account;
      })
      .catch(error => {
        throw normaliseMetamaskError(error);
      })
      .finally(() => {
        connectPromise = null;
      });
  }

  return connectPromise;
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
