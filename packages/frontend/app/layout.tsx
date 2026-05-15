import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StellarPerks",
  description: "Blockchain loyalty rewards on Stellar",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-gray-100 min-h-screen">
        <nav className="border-b border-gray-800 px-6 py-4 flex items-center gap-6">
          <span className="text-xl font-bold text-indigo-400">⭐ StellarPerks</span>
          <a href="/" className="text-sm text-gray-400 hover:text-white">Dashboard</a>
          <a href="/earn" className="text-sm text-gray-400 hover:text-white">Earn</a>
          <a href="/redeem" className="text-sm text-gray-400 hover:text-white">Redeem</a>
          <a href="/analytics" className="text-sm text-gray-400 hover:text-white">Analytics</a>
        </nav>
        <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
