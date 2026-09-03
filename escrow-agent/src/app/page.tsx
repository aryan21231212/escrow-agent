"use client"

import { useState, useEffect } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"client" | "developer">("client");

  // Client State
  const [clientEmail, setClientEmail] = useState("client@example.com");
  const [vendorEmail, setVendorEmail] = useState("vendor@example.com");
  const [title, setTitle] = useState("Hospital Bed Availability Dashboard");
  const [terms, setTerms] = useState("Build dual-dashboard with real-time bed updates.");
  const [amount, setAmount] = useState(5000);
  const [milestoneDesc, setMilestoneDesc] = useState("Complete API routes and database schema");
  const [creationResult, setCreationResult] = useState<any>(null);
  const [creating, setCreating] = useState(false);

  // Developer State
  const [milestoneId, setMilestoneId] = useState("");
  const [workProof, setWorkProof] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  // Handle Client Creating a Task/Contract
  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreationResult(null);

    try {
      const res = await fetch("/api/contract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientEmail,
          vendorEmail,
          title,
          plainTerms: terms,
          totalAmount: Number(amount),
          milestoneDescription: milestoneDesc,
          milestoneAmount: Number(amount),
        }),
      });
      const data = await res.json();
      setCreationResult(data);
      if (data.success) {
        // Automatically set the milestone ID for quick testing in developer view
        setMilestoneId(data.milestone.id);
      }
    } catch (err: any) {
      setCreationResult({ success: false, error: err.message });
    } finally {
      setCreating(false);
    }
  };

  // Handle Developer Submitting Work Proof
  const handleVerifyWork = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    setVerificationResult(null);

    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ milestoneId, workProof }),
      });
      const data = await res.json();
      setVerificationResult(data);
    } catch (err: any) {
      setVerificationResult({ success: false, error: err.message });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6 md:p-12 flex flex-col items-center">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-indigo-400 tracking-tight">AI Escrow Agent Platform</h1>
          <p className="text-sm text-gray-400 mt-1">Autonomous milestone verification & automated Razorpay payouts.</p>
        </div>

        {/* Role Switcher Tabs */}
        <div className="flex bg-gray-900 p-1.5 rounded-xl border border-gray-800 mb-8">
          <button
            onClick={() => setActiveTab("client")}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition ${
              activeTab === "client" ? "bg-indigo-600 text-white shadow" : "text-gray-400 hover:text-white"
            }`}
          >
            Client View (Post Task & Fund)
          </button>
          <button
            onClick={() => setActiveTab("developer")}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition ${
              activeTab === "developer" ? "bg-indigo-600 text-white shadow" : "text-gray-400 hover:text-white"
            }`}
          >
            Developer View (Submit Work & Get Paid)
          </button>
        </div>

        {/* CLIENT VIEW */}
        {activeTab === "client" && (
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-xl">
            <h2 className="text-xl font-bold text-indigo-300 mb-2">Create Escrow Task & Milestone</h2>
            <p className="text-xs text-gray-400 mb-6">As a client, define the project scope, assign a developer, and lock funds into escrow.</p>

            <form onSubmit={handleCreateContract} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Client Email</label>
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Developer Email</label>
                  <input
                    type="email"
                    value={vendorEmail}
                    onChange={(e) => setVendorEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Project Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Terms & Scope</label>
                <textarea
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  rows={2}
                  required
                  className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Milestone Description</label>
                  <input
                    type="text"
                    value={milestoneDesc}
                    onChange={(e) => setMilestoneDesc(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Escrow Amount (INR)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 font-medium rounded-xl text-sm transition disabled:opacity-50 mt-2"
              >
                {creating ? "Locking Funds in Escrow..." : "Create Task & Lock Funds in Escrow"}
              </button>
            </form>

            {creationResult && (
              <div className={`mt-6 p-4 rounded-xl text-sm ${creationResult.success ? 'bg-green-950/60 border border-green-800 text-green-200' : 'bg-red-950/60 border border-red-800 text-red-200'}`}>
                <pre className="whitespace-pre-wrap overflow-x-auto text-xs">{JSON.stringify(creationResult, null, 2)}</pre>
                {creationResult.success && (
                  <button
                    onClick={() => setActiveTab("developer")}
                    className="mt-3 px-3 py-1.5 bg-green-700 hover:bg-green-600 text-xs font-semibold rounded-lg text-white transition block"
                  >
                    Switch to Developer View to Submit Work →
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* DEVELOPER VIEW */}
        {activeTab === "developer" && (
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-xl">
            <h2 className="text-xl font-bold text-indigo-300 mb-2">Submit Work Proof for Milestone</h2>
            <p className="text-xs text-gray-400 mb-6">As a developer, submit your GitHub commit or deliverable link to trigger AI verification and instant payout.</p>

            <form onSubmit={handleVerifyWork} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Milestone ID</label>
                <input
                  type="text"
                  value={milestoneId}
                  onChange={(e) => setMilestoneId(e.target.value)}
                  placeholder="Paste milestone ID from client task creation"
                  required
                  className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-sm font-mono text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Work Proof Link (GitHub Commit / PR)</label>
                <input
                  type="text"
                  value={workProof}
                  onChange={(e) => setWorkProof(e.target.value)}
                  placeholder="https://github.com/username/repo/commit/..."
                  required
                  className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={verifying}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 font-medium rounded-xl text-sm transition disabled:opacity-50 mt-2"
              >
                {verifying ? "Gemini AI Inspecting Work..." : "Submit Proof & Trigger Payout"}
              </button>
            </form>

            {verificationResult && (
              <div className={`mt-6 p-4 rounded-xl text-sm ${verificationResult.success ? 'bg-green-950/60 border border-green-800 text-green-200' : 'bg-red-950/60 border border-red-800 text-red-200'}`}>
                <pre className="whitespace-pre-wrap overflow-x-auto text-xs">{JSON.stringify(verificationResult, null, 2)}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}