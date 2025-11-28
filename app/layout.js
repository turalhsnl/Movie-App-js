import "./globals.css";
import { Suspense } from "react";
import Header from "./components/Header";
import AuthGate from "./components/auth/AuthGate";
import { AuthProvider } from "./components/auth/AuthProvider";
import { WatchlistProvider } from "./components/watchlist/useWatchList";
import { LikesProvider } from "./components/likes/useLikes";

export const metadata = {
  title: "Movie App (JS)",
  description: "TMDB + localStorage + MetaMask",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-neutral-900 text-neutral-100">
        <AuthProvider>
          <WatchlistProvider>
            <LikesProvider>
              <Suspense fallback={null}>
                <Header />
              </Suspense>
              <Suspense fallback={<main className="mx-auto max-w-6xl px-4 py-6">Loading…</main>}>
                <AuthGate>
                  <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
                </AuthGate>
              </Suspense>
            </LikesProvider>
          </WatchlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
