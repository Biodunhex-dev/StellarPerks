"use client";
import { useState } from "react";
import { api } from "@/lib/api";

export default function EarnPage() {
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
        action: "issue",
        points: Number(form.points),
      });
      setStatus("✅ Points issued and recorded successfully!");
      setForm({ programId: "", userPublicKey: "", points: "" });
    } catch (err: unknown) {
      setStatus(`❌ ${err instanceof Error ? err.message : "Error"}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-3xl font-bold mb-2">Issue Points</h1>
      <p className="text-gray-400 mb-8">Award loyalty points to a user for their activity</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {[
          { label: "Program ID", key: "programId", placeholder: "e.g. coffee-rewards" },
          { label: "User Public Key", key: "userPublicKey", placeholder: "G..." },
          { label: "Points", key: "points", placeholder: "100", type: "number" },
        ].map(({ label, key, placeholder, type }) => (
          <div key={key}>
            <label className="block text-sm text-gray-400 mb-1">{label}</label>
            <input
              type={type || "text"}
              value={form[key as keyof typeof form]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              placeholder={placeholder}
              required
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        ))}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg py-2 font-semibold transition"
        >
          {loading ? "Issuing..." : "Issue Points"}
        </button>
      </form>

      {status && <p className="mt-4 text-sm">{status}</p>}
    </div>
  );
}
