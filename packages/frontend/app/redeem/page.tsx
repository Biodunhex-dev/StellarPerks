"use client";
import { useState } from "react";
import { api } from "@/lib/api";

export default function RedeemPage() {
  const [form, setForm] = useState({ programId: "", userPublicKey: "", points: "" });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus("");
    try {
      await api.trackEvent({
        programId: form.programId,
        userPublicKey: form.userPublicKey,
        action: "redeem",
        points: Number(form.points),
      });
      setStatus("✅ Points redeemed successfully!");
      setForm({ programId: "", userPublicKey: "", points: "" });
    } catch (err: unknown) {
      setStatus(`❌ ${err instanceof Error ? err.message : "Error"}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-3xl font-bold mb-2">Redeem Points</h1>
      <p className="text-gray-400 mb-8">Exchange your loyalty points for rewards</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {[
          { label: "Program ID", key: "programId", placeholder: "e.g. coffee-rewards" },
          { label: "Your Public Key", key: "userPublicKey", placeholder: "G..." },
          { label: "Points to Redeem", key: "points", placeholder: "50", type: "number" },
        ].map(({ label, key, placeholder, type }) => (
          <div key={key}>
            <label className="block text-sm text-gray-400 mb-1">{label}</label>
            <input
              type={type || "text"}
              value={form[key as keyof typeof form]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              placeholder={placeholder}
              required
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
            />
          </div>
        ))}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-700 hover:bg-purple-600 disabled:opacity-50 rounded-lg py-2 font-semibold transition"
        >
          {loading ? "Redeeming..." : "Redeem Points"}
        </button>
      </form>

      {status && <p className="mt-4 text-sm">{status}</p>}
    </div>
  );
}
