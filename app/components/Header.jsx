"use client";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { FaBookmark, FaFilm, FaHeart, FaUserCircle } from "react-icons/fa";
import WalletConnect from "./WalletConnect";
import { useAuth } from "./auth/AuthProvider";

export default function Header() {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();

  const shouldHide = useMemo(() => {
    if (!isAuthenticated) return true;
    return pathname === "/login";
  }, [isAuthenticated, pathname]);

  if (shouldHide) {
    return null;
  }
  return (
    <header className="border-b border-neutral-800">
      <div className="container flex items-center justify-between py-4 gap-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg"><FaFilm /><span>MovieApp</span></Link>
        <Suspense
          fallback={
            <div
              className="w-full max-w-xl rounded-xl bg-neutral-900 border border-neutral-800 px-4 py-2 opacity-70"
              aria-hidden
            />
          }
        >
          <SearchBar />
        </Suspense>
        <nav className="flex items-center gap-4">
          <Link href="/watchlist" className="inline-flex items-center gap-2 hover:opacity-80"><FaBookmark /><span className="hidden sm:inline">Watchlist</span></Link>
          <Link href="/liked" className="inline-flex items-center gap-2 hover:opacity-80"><FaHeart /><span className="hidden sm:inline">Liked</span></Link>
          <Link href="/login" className="inline-flex items-center gap-2 hover:opacity-80">
            <FaUserCircle />
            <span className="hidden sm:inline">{isAuthenticated ? "MetaMask Profile" : "MetaMask Login"}</span>
          </Link>
          <WalletConnect />
        </nav>
      </div>
    </header>
  );
}
function SearchBar() {
  const router = useRouter();
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get("q") || "");
  useEffect(() => {
    const t = setTimeout(() => { if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`); }, 400);
    return () => clearTimeout(t);
  }, [q, router]);
  return <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search movies..." className="w-full max-w-xl rounded-xl bg-neutral-900 border border-neutral-800 px-4 py-2 outline-none focus:ring-2 ring-neutral-700" />;
}
