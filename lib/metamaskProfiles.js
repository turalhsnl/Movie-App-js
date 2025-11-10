"use client";

import { normalizeAddress } from "./metamask";

const PROFILE_STORAGE_KEY = "metamask:userProfiles";

const isBrowser = () => typeof window !== "undefined";

const listeners = new Set();

const notifyListeners = () => {
  for (const listener of listeners) {
    try {
      listener();
    } catch {
      // ignore listener errors to avoid breaking notification flow
    }
  }
};

const readProfiles = () => {
  if (!isBrowser()) return {};
  try {
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed;
  } catch {
    return {};
  }
};

const writeProfiles = value => {
  if (!isBrowser()) return false;
  try {
    window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(value));
    notifyListeners();
    return true;
  } catch {
    return false;
  }
};

export const loadProfile = address => {
  const normalized = normalizeAddress(address);
  if (!normalized) return null;
  const profiles = readProfiles();
  const profile = profiles[normalized];
  if (!profile || typeof profile !== "object") return null;
  const displayName = typeof profile.displayName === "string" ? profile.displayName.trim() : "";
  if (!displayName) return null;
  return { displayName };
};

export const saveProfile = (address, profile) => {
  const normalized = normalizeAddress(address);
  if (!normalized) return false;
  const profiles = readProfiles();
  const displayName = typeof profile?.displayName === "string" ? profile.displayName.trim() : "";
  if (!displayName) {
    if (profiles[normalized]) {
      delete profiles[normalized];
      return writeProfiles(profiles);
    }
    return true;
  }
  profiles[normalized] = { displayName };
  return writeProfiles(profiles);
};

export const subscribeToProfileChanges = callback => {
  if (typeof callback !== "function") return () => {};
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
};
