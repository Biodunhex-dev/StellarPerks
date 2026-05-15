"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Event {
  id: string;
  programId: string;
  userPublicKey: string;
  action: string;
  points: number;
  createdAt: string;
}

export default function AnalyticsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [analytics, setAnalytics] = useState<{ totalIssued: number; totalRedeemed: number; outstanding: number; eventCount: number } | null>(null);
  const [programId, setProgramId] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [evts, stats] = await Promise.all([
        api.getEvents(programId || undefined),
        api.getAnalytics(programId || undefined),
      ]);
      setEvents(evts);
      setAnalytics(stats);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Analytics</h1>
      <p className="text-gray-400 mb-6">Track loyalty program activity and trends</p>

      <div className="flex gap-3 mb-6">
        <input
          value={programId}
          onChange={(e) => setProgramId(e.target.value)}
          placeholder="Filter by Program ID (optional)"
          className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 flex-1"
        />
        <button onClick={load} className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg transition">
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Issued", value: analytics.totalIssued },
            { label: "Redeemed", value: analytics.totalRedeemed },
            { label: "Outstanding", value: analytics.outstanding },
            { label: "Events", value: analytics.eventCount },
          ].map((s) => (
            <div key={s.label} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
              <p className="text-xs text-gray-400">{s.label}</p>
              <p className="text-xl font-bold text-indigo-400">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-800">
            <tr>
              {["Program", "User", "Action", "Points", "Date"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-gray-400 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-500">No events yet</td></tr>
            ) : (
              events.map((e) => (
                <tr key={e.id} className="border-t border-gray-800 hover:bg-gray-800/50">
                  <td className="px-4 py-3">{e.programId}</td>
                  <td className="px-4 py-3 font-mono text-xs">{e.userPublicKey.slice(0, 12)}…</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${e.action === "issue" ? "bg-green-900 text-green-300" : "bg-orange-900 text-orange-300"}`}>
                      {e.action}
                    </span>
                  </td>
                  <td className="px-4 py-3">{e.points}</td>
                  <td className="px-4 py-3 text-gray-400">{new Date(e.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
