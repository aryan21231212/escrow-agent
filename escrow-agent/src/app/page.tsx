"use client";

import { useState } from "react";

export default function Home() {
  const [milestoneId, setMilestoneId] = useState("");
  const [workProof, setWorkProof] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ milestoneId, workProof }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setResult({ success: false, error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8 flex flex-col items-center justify-center">
      <div className="max-w-md w-full bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
        <h1 className="text-2xl font-bold mb-2 text-indigo-400">Escrow Agent Dashboard</h1>
        <p className="text-sm text-gray-400 mb-6">Verify work proof and trigger automated Razorpay payouts.</p>

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
              Milestone ID
            </label>
            <input
              type="text"
              required
              placeholder="Paste your milestone ID here"
              value={milestoneId}
              onChange={(e) => setMilestoneId(e.target.value)}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
              Work Proof Link (GitHub Commit / URL)
            </label>
            <input
              type="url"
              required
              placeholder="https://github.com/your-repo/commit/..."
              value={workProof}
              onChange={(e) => setWorkProof(e.target.value)}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 transition font-medium rounded-lg text-sm disabled:opacity-50"
          >
            {loading ? "Verifying & Processing..." : "Verify & Release Funds"}
          </button>
        </form>

        {result && (
          <div className={`mt-6 p-4 rounded-lg text-sm ${result.success ? 'bg-green-900/50 border border-green-700 text-green-200' : 'bg-red-900/50 border border-red-700 text-red-200'}`}>
            <pre className="whitespace-pre-wrap overflow-x-auto">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </div>
    </main>
  );
}