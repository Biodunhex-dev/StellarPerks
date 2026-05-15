"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Analytics {
  totalIssued: number;
  totalRedeemed: number;
  outstanding: number;
  eventCount: number;
}

export default function Dashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getAnalytics().then(setAnalytics).catch((e) => setError(e.message));
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
      <p className="text-gray-400 mb-8">Overview of your loyalty program activity</p>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Points Issued", value: analytics?.totalIssued ?? "—" },
          { label: "Points Redeemed", value: analytics?.totalRedeemed ?? "—" },
          { label: "Outstanding", value: analytics?.outstanding ?? "—" },
          { label: "Total Events", value: analytics?.eventCount ?? "—" },
        ].map((stat) => (
          <div key={stat.label} className="bg-gray-900 rounded-xl p-5 border border-gray-800">
            <p className="text-sm text-gray-400">{stat.label}</p>
            <p className="text-2xl font-bold text-indigo-400 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <a href="/earn" className="bg-indigo-600 hover:bg-indigo-500 rounded-xl p-6 block transition">
          <h2 className="text-lg font-semibold mb-1">Issue Points</h2>
          <p className="text-sm text-indigo-200">Award loyalty points to users on-chain</p>
        </a>
        <a href="/redeem" className="bg-purple-700 hover:bg-purple-600 rounded-xl p-6 block transition">
          <h2 className="text-lg font-semibold mb-1">Redeem Points</h2>
          <p className="text-sm text-purple-200">Let users redeem their earned rewards</p>
        </a>
      </div>
    </div>
  );
}
