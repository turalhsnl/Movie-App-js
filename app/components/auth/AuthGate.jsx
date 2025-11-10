"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "./AuthProvider";

export default function AuthGate({ children }) {
  const { isReady, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const isLoginRoute = pathname === "/login";

  const currentLocation = useMemo(() => {
    const query = searchParams?.toString();
    return query ? `${pathname}?${query}` : pathname;
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!isReady) return;
    if (isAuthenticated) return;
    if (isLoginRoute) return;
    router.replace(`/login?redirect=${encodeURIComponent(currentLocation)}`);
  }, [isReady, isAuthenticated, isLoginRoute, router, currentLocation]);

  if (isLoginRoute) {
    return <>{children}</>;
  }

  if (!isReady) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-20 text-center text-sm opacity-70">
        Checking your MetaMask session…
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-20 text-center text-sm opacity-70">
        Redirecting to the MetaMask sign-in page…
      </main>
    );
  }

  return <>{children}</>;
}
