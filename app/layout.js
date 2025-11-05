import "./globals.css";
import Header from "./components/Header";

export const metadata = {
  title: "Movie App (JS)",
  description: "TMDB + localStorage + MetaMask",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-neutral-900 text-neutral-100">
        <Header />
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
