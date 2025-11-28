import LikedClient from "./LikedClient";

export const metadata = {
  title: "Liked Movies | Movie App",
  description: "Movies you have liked.",
};

export default function LikedPage() {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Liked Movies</h1>
        <p className="opacity-75">Movies you marked with a heart.</p>
      </div>
      <LikedClient />
    </section>
  );
}
