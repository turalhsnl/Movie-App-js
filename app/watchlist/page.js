import WatchlistClient from "./WatchlistClient";

export const metadata = {
  title: "Watchlist | Movie App",
  description: "Movies you saved to watch later.",
};

export default function WatchlistPage() {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Watchlist</h1>
        <p className="opacity-75">Movies you saved to watch later.</p>
      </div>
      <WatchlistClient />
    </section>
  );
}
