"use client";

import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"client" | "developer">("client");

  // Client State
  const [clientEmail, setClientEmail] = useState("client@company.com");
  const [vendorEmail, setVendorEmail] = useState("developer@agency.com");
  const [title, setTitle] = useState("Hospital Bed Availability Dashboard");
  const [terms, setTerms] = useState("Build dual-dashboard with real-time bed updates and Supabase schema.");
  const [amount, setAmount] = useState(7500);
  const [milestoneDesc, setMilestoneDesc] = useState("Complete backend API routes and Prisma schema");
  const [creationResult, setCreationResult] = useState<any>(null);
  const [creating, setCreating] = useState(false);

  // Developer State
  const [milestoneId, setMilestoneId] = useState("");
  const [workProof, setWorkProof] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  // --- Decorative-only state (cursor trail + stamp effects). Does not touch app logic. ---
  const [trail, setTrail] = useState({ x: 0, y: 0 });
  const [cursorMode, setCursorMode] = useState<"default" | "text" | "button">("default");
  const [stamps, setStamps] = useState<{ id: number; x: number; y: number }[]>([]);
  const stampIdRef = useRef(0);
  const [sealVisible, setSealVisible] = useState(false);
  const prevSuccessRef = useRef(false);

  useEffect(() => {
    const succeeded = !!creationResult?.success;
    if (succeeded && !prevSuccessRef.current) {
      setSealVisible(true);
      const t = setTimeout(() => setSealVisible(false), 2600);
      return () => clearTimeout(t);
    }
    prevSuccessRef.current = succeeded;
  }, [creationResult]);

  const handleRootMouseMove = (e: React.MouseEvent) => {
    setTrail({ x: e.clientX, y: e.clientY });
  };

  const handleRootClick = (e: React.MouseEvent) => {
    const id = ++stampIdRef.current;
    setStamps((s) => [...s, { id, x: e.clientX, y: e.clientY }]);
    setTimeout(() => {
      setStamps((s) => s.filter((st) => st.id !== id));
    }, 650);
  };

  const interactiveEnter = (mode: "text" | "button") => () => setCursorMode(mode);
  const interactiveLeave = () => setCursorMode("default");

  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreationResult(null);

    try {
      const res = await fetch("/api/contracts", {
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
      if (data.success && data.milestone) {
        setMilestoneId(data.milestone.id);
      }
    } catch (err: any) {
      setCreationResult({ success: false, error: err.message });
    } finally {
      setCreating(false);
    }
  };

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
    <main
      className="ledger-app min-h-screen flex flex-col items-center justify-between px-6 py-14 md:px-16 md:py-20"
      onMouseMove={handleRootMouseMove}
      onClick={handleRootClick}
    >
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Public+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap");

        :root {
          --desk: #1b160f;
          --desk-grain: #241d13;
          --paper: #f6efdd;
          --paper-edge: #dccfa8;
          --paper-edge-2: #c9ba8e;
          --ink: #1e2b22;
          --ink-soft: #445044;
          --wax: #7a2020;
          --wax-bright: #9c3030;
          --brass: #a9822e;
        }

        .ledger-app {
          background-color: var(--desk);
          position: relative;
          font-family: "Public Sans", sans-serif;
          color: var(--ink);
          overflow-x: hidden;
        }

        /* Paper-grain texture via SVG noise -- no gradients used anywhere in this file. */
        .ledger-app::before {
          content: "";
          position: fixed;
          inset: 0;
          pointer-events: none;
          opacity: 0.5;
          mix-blend-mode: overlay;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.35'/></svg>");
        }

        .ledger-serif {
          font-family: "Fraunces", serif;
          font-optical-sizing: auto;
        }

        .ledger-mono {
          font-family: "IBM Plex Mono", monospace;
        }

        /* Decorative trailing ink dot -- follows the real cursor, never replaces it. */
        .ink-trail {
          position: fixed;
          top: 0;
          left: 0;
          width: 26px;
          height: 26px;
          margin-left: -13px;
          margin-top: -13px;
          border-radius: 50%;
          pointer-events: none;
          z-index: 60;
          border: 1.5px solid var(--brass);
          transition: transform 0.16s cubic-bezier(0.22, 1, 0.36, 1), width 0.2s ease, height 0.2s ease,
            border-color 0.2s ease, background-color 0.2s ease;
        }
        .ink-trail.mode-text {
          width: 3px;
          height: 26px;
          margin-left: -1.5px;
          border-radius: 2px;
          border-color: var(--ink-soft);
          background: var(--ink-soft);
        }
        .ink-trail.mode-button {
          width: 46px;
          height: 46px;
          margin-left: -23px;
          margin-top: -23px;
          border-color: var(--wax);
          background-color: rgba(122, 32, 32, 0.12);
        }

        @media (prefers-reduced-motion: reduce) {
          .ink-trail {
            display: none;
          }
        }
        @media (hover: none) {
          .ink-trail {
            display: none;
          }
        }

        /* Click stamp ripple */
        .click-stamp {
          position: fixed;
          top: 0;
          left: 0;
          width: 10px;
          height: 10px;
          margin-left: -5px;
          margin-top: -5px;
          border-radius: 50%;
          border: 1.5px solid var(--brass);
          pointer-events: none;
          z-index: 55;
          animation: stampRipple 0.6s ease-out forwards;
        }
        @keyframes stampRipple {
          0% {
            transform: scale(1);
            opacity: 0.9;
          }
          100% {
            transform: scale(7);
            opacity: 0;
          }
        }

        /* Document entrance: paper settles onto the desk once on load */
        .ledger-sheet {
          animation: settleIn 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes settleIn {
          0% {
            opacity: 0;
            transform: translateY(28px) rotate(-0.8deg) scale(0.985);
          }
          100% {
            opacity: 1;
            transform: translateY(0) rotate(0deg) scale(1);
          }
        }

        /* Folder-style tabs */
        .folder-tab {
          font-family: "Public Sans", sans-serif;
          font-weight: 600;
          font-size: 0.95rem;
          padding: 0.85rem 1.6rem 0.7rem;
          border: 1px solid var(--paper-edge-2);
          border-bottom: none;
          border-radius: 10px 10px 0 0;
          background: var(--desk-grain);
          color: #cbbf9c;
          position: relative;
          top: 3px;
          transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), background-color 0.25s ease, color 0.2s ease;
          cursor: pointer;
        }
        .folder-tab.active {
          background: var(--paper);
          color: var(--ink);
          top: 0;
          transform: translateY(0);
        }
        .folder-tab:not(.active):hover {
          transform: translateY(-3px);
          color: var(--paper);
        }

        .ledger-page {
          animation: pageTurn 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes pageTurn {
          0% {
            opacity: 0;
            transform: perspective(900px) rotateY(-4deg) translateX(-6px);
          }
          100% {
            opacity: 1;
            transform: perspective(900px) rotateY(0deg) translateX(0);
          }
        }

        /* Ledger-line fields: underline only, ink draws in on focus */
        .field-wrap {
          position: relative;
          border-bottom: 1.5px solid var(--paper-edge-2);
        }
        .field-underline {
          position: absolute;
          left: 0;
          bottom: -1.5px;
          height: 2px;
          width: 100%;
          background: var(--wax);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .field-wrap:focus-within .field-underline {
          transform: scaleX(1);
        }
        .ledger-input,
        .ledger-textarea {
          background: transparent;
          border: none;
          outline: none;
          width: 100%;
          padding: 0.6rem 0.15rem 0.8rem;
          font-family: "Public Sans", sans-serif;
          font-size: 1.05rem;
          color: var(--ink);
        }
        .ledger-input::placeholder,
        .ledger-textarea::placeholder {
          color: #8c8368;
        }

        .field-label {
          display: block;
          font-family: "Public Sans", sans-serif;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--ink-soft);
          letter-spacing: 0.01em;
          margin-bottom: 0.35rem;
        }

        /* Wax-seal button */
        .seal-button {
          font-family: "Public Sans", sans-serif;
          font-weight: 600;
          font-size: 1.05rem;
          color: var(--paper);
          background: var(--wax);
          border: none;
          border-radius: 6px;
          padding: 1rem 1.5rem;
          transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.2s ease,
            box-shadow 0.2s ease;
          box-shadow: 0 1px 0 rgba(0, 0, 0, 0.25);
        }
        .seal-button:not(:disabled):hover {
          background: var(--wax-bright);
        }
        .seal-button:not(:disabled):active {
          transform: scale(0.96);
        }
        .seal-button:disabled {
          opacity: 0.6;
        }

        .ledger-result {
          font-family: "IBM Plex Mono", monospace;
          font-size: 0.85rem;
          line-height: 1.6;
          animation: unfoldResult 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes unfoldResult {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Wax seal stamp animation on successful contract lock */
        .wax-seal-overlay {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          z-index: 70;
        }
        .wax-seal-medal {
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background: var(--wax);
          border: 6px solid #5c1717;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          animation: sealStamp 0.5s cubic-bezier(0.2, 1.4, 0.4, 1) both, sealFade 0.5s ease 2.1s both;
        }
        @keyframes sealStamp {
          0% {
            transform: scale(2.4) rotate(-8deg);
            opacity: 0;
          }
          65% {
            transform: scale(0.94) rotate(1deg);
            opacity: 1;
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }
        @keyframes sealFade {
          to {
            opacity: 0;
            transform: scale(1.05);
          }
        }
        .wax-seal-text {
          font-family: "Fraunces", serif;
          font-weight: 600;
          font-size: 1.15rem;
          color: var(--paper);
          letter-spacing: 0.04em;
        }

        @media (prefers-reduced-motion: reduce) {
          .ledger-sheet,
          .ledger-page,
          .ledger-result,
          .wax-seal-medal,
          .click-stamp {
            animation: none !important;
          }
        }
      `}</style>

      {/* Decorative cursor trail (does not replace the real cursor) */}
      <div
        className={`ink-trail ${cursorMode === "text" ? "mode-text" : cursorMode === "button" ? "mode-button" : ""}`}
        style={{ transform: `translate(${trail.x}px, ${trail.y}px)` }}
      />
      {stamps.map((s) => (
        <div key={s.id} className="click-stamp" style={{ transform: `translate(${s.x}px, ${s.y}px)` }} />
      ))}

      {sealVisible && (
        <div className="wax-seal-overlay">
          <div className="wax-seal-medal">
            <span className="wax-seal-text">Funds Locked</span>
          </div>
        </div>
      )}

      <div className="max-w-3xl w-full mx-auto">
        {/* Header */}
        <header className="mb-10 text-center">
          <h1 className="ledger-serif text-4xl md:text-5xl font-semibold text-[#F1E9D2] tracking-tight">
            The Escrow Ledger
          </h1>
          <p className="text-[#B7AC88] mt-3 text-base">
            Funds are held on record and released only once an agent verifies the work.
          </p>
        </header>

        {/* Folder tabs */}
        <div className="flex gap-2 px-2">
          <button
            className={`folder-tab ${activeTab === "client" ? "active" : ""}`}
            onClick={() => setActiveTab("client")}
            onMouseEnter={interactiveEnter("button")}
            onMouseLeave={interactiveLeave}
          >
            Client
          </button>
          <button
            className={`folder-tab ${activeTab === "developer" ? "active" : ""}`}
            onClick={() => setActiveTab("developer")}
            onMouseEnter={interactiveEnter("button")}
            onMouseLeave={interactiveLeave}
          >
            Developer
          </button>
        </div>

        {/* Paper sheet */}
        <section
          className="ledger-sheet"
          style={{
            background: "var(--paper)",
            borderRadius: "4px 12px 12px 12px",
            border: "1px solid var(--paper-edge-2)",
            boxShadow: "0 1px 0 var(--paper-edge), 0 2px 0 var(--paper-edge-2), 0 30px 60px rgba(0,0,0,0.45)",
          }}
        >
          <div key={activeTab} className="ledger-page p-8 md:p-12">
            {activeTab === "client" && (
              <>
                <div className="mb-8">
                  <h2 className="ledger-serif text-2xl text-[var(--ink)]">Open a new agreement</h2>
                  <p className="text-[var(--ink-soft)] text-sm mt-1.5">
                    Lock the client's funds against a milestone. Nothing releases until it's verified.
                  </p>
                </div>

                <form onSubmit={handleCreateContract} className="space-y-7">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                    <div className="field-wrap">
                      <label className="field-label">Client email</label>
                      <input
                        type="email"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        onFocus={interactiveEnter("text")}
                        onBlur={interactiveLeave}
                        required
                        className="ledger-input"
                      />
                      <span className="field-underline" />
                    </div>
                    <div className="field-wrap">
                      <label className="field-label">Developer email</label>
                      <input
                        type="email"
                        value={vendorEmail}
                        onChange={(e) => setVendorEmail(e.target.value)}
                        onFocus={interactiveEnter("text")}
                        onBlur={interactiveLeave}
                        required
                        className="ledger-input"
                      />
                      <span className="field-underline" />
                    </div>
                  </div>

                  <div className="field-wrap">
                    <label className="field-label">Project title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      onFocus={interactiveEnter("text")}
                      onBlur={interactiveLeave}
                      required
                      className="ledger-input"
                    />
                    <span className="field-underline" />
                  </div>

                  <div className="field-wrap">
                    <label className="field-label">Scope and terms</label>
                    <textarea
                      value={terms}
                      onChange={(e) => setTerms(e.target.value)}
                      onFocus={interactiveEnter("text")}
                      onBlur={interactiveLeave}
                      rows={3}
                      required
                      className="ledger-textarea"
                    />
                    <span className="field-underline" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                    <div className="field-wrap">
                      <label className="field-label">Milestone description</label>
                      <input
                        type="text"
                        value={milestoneDesc}
                        onChange={(e) => setMilestoneDesc(e.target.value)}
                        onFocus={interactiveEnter("text")}
                        onBlur={interactiveLeave}
                        required
                        className="ledger-input"
                      />
                      <span className="field-underline" />
                    </div>
                    <div className="field-wrap">
                      <label className="field-label">Amount (INR)</label>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        onFocus={interactiveEnter("text")}
                        onBlur={interactiveLeave}
                        required
                        className="ledger-input ledger-mono"
                      />
                      <span className="field-underline" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={creating}
                    onMouseEnter={interactiveEnter("button")}
                    onMouseLeave={interactiveLeave}
                    className="seal-button w-full mt-4"
                  >
                    {creating ? "Locking funds…" : "Lock funds and open agreement"}
                  </button>
                </form>

                {creationResult && (
                  <div
                    className="ledger-result mt-8 p-5 rounded"
                    style={{
                      background: creationResult.success ? "#EFE7CE" : "#F3DEDE",
                      border: `1px solid ${creationResult.success ? "var(--paper-edge-2)" : "#C99"}`,
                      color: creationResult.success ? "var(--ink)" : "var(--wax)",
                    }}
                  >
                    <pre className="whitespace-pre-wrap overflow-x-auto">{JSON.stringify(creationResult, null, 2)}</pre>
                    {creationResult.success && (
                      <button
                        onClick={() => setActiveTab("developer")}
                        onMouseEnter={interactiveEnter("button")}
                        onMouseLeave={interactiveLeave}
                        className="mt-4 px-4 py-2 rounded text-sm font-semibold"
                        style={{ background: "var(--ink)", color: "var(--paper)", fontFamily: "'Public Sans', sans-serif" }}
                      >
                        Continue to developer portal
                      </button>
                    )}
                  </div>
                )}
              </>
            )}

            {activeTab === "developer" && (
              <>
                <div className="mb-8">
                  <h2 className="ledger-serif text-2xl text-[var(--ink)]">Submit your work</h2>
                  <p className="text-[var(--ink-soft)] text-sm mt-1.5">
                    Point the agent at the proof. It verifies the milestone and releases payment on its own.
                  </p>
                </div>

                <form onSubmit={handleVerifyWork} className="space-y-7">
                  <div className="field-wrap">
                    <label className="field-label">Milestone ID</label>
                    <input
                      type="text"
                      value={milestoneId}
                      onChange={(e) => setMilestoneId(e.target.value)}
                      onFocus={interactiveEnter("text")}
                      onBlur={interactiveLeave}
                      placeholder="Paste the milestone ID from the client agreement"
                      required
                      className="ledger-input ledger-mono"
                    />
                    <span className="field-underline" />
                  </div>

                  <div className="field-wrap">
                    <label className="field-label">Work proof (GitHub commit or PR)</label>
                    <input
                      type="text"
                      value={workProof}
                      onChange={(e) => setWorkProof(e.target.value)}
                      onFocus={interactiveEnter("text")}
                      onBlur={interactiveLeave}
                      placeholder="https://github.com/organization/repository/commit/…"
                      required
                      className="ledger-input"
                    />
                    <span className="field-underline" />
                  </div>

                  <button
                    type="submit"
                    disabled={verifying}
                    onMouseEnter={interactiveEnter("button")}
                    onMouseLeave={interactiveLeave}
                    className="seal-button w-full mt-4"
                  >
                    {verifying ? "Verifying and releasing…" : "Submit deliverable and release payment"}
                  </button>
                </form>

                {verificationResult && (
                  <div
                    className="ledger-result mt-8 p-5 rounded"
                    style={{
                      background: verificationResult.success ? "#EFE7CE" : "#F3DEDE",
                      border: `1px solid ${verificationResult.success ? "var(--paper-edge-2)" : "#C99"}`,
                      color: verificationResult.success ? "var(--ink)" : "var(--wax)",
                    }}
                  >
                    <pre className="whitespace-pre-wrap overflow-x-auto">{JSON.stringify(verificationResult, null, 2)}</pre>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>

      <footer className="mt-14 text-center text-sm text-[#877D5E] w-full max-w-3xl border-t border-[#3A3222] pt-6">
        Every entry in this ledger is hash-chained and can be independently verified.
      </footer>
    </main>
  );
}