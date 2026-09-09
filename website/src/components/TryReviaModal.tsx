import React, { useState, useEffect } from "react";
import { ReviaOrb, type OrbState } from "./ReviaOrb";
import { X, Sparkles, ExternalLink, ShieldAlert } from "lucide-react";

interface TryReviaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_QUERIES = [
  {
    query: "That React authentication article I saw last week",
    results: [
      {
        title: "Modern Next.js & React Session Authentication",
        domain: "authjs.dev",
        time: "Last Tuesday · 4:18 PM",
        matchReason: "Matches concept: React session protection & JWT tokens",
      },
      {
        title: "JWT vs HttpOnly Cookies in SPA Architecture",
        domain: "developer.mozilla.org",
        time: "6 days ago · 11:05 AM",
        matchReason: "Matches concept: client-side authentication storage",
      },
    ],
  },
  {
    query: "Find that GitHub issue about the deployment problem I saw yesterday",
    results: [
      {
        title: "Issue #142: Docker deployment memory leak on ARM64",
        domain: "github.com",
        time: "Yesterday · 3:45 PM",
        matchReason: "Matches concept: container deployment failure & memory limit",
      },
      {
        title: "Fix: macOS Rosetta compilation failure in CI pipeline",
        domain: "github.com",
        time: "Yesterday · 1:20 PM",
        matchReason: "Matches concept: deployment script crash",
      },
    ],
  },
  {
    query: "That article about electric cars battery technology",
    results: [
      {
        title: "Solid-State vs Lithium-Ion Battery Technology Comparison",
        domain: "electrek.co",
        time: "3 days ago · 6:20 PM",
        matchReason: "Matches concept: EV battery chemistry & range analysis",
      },
      {
        title: "Top 10 Long Range EVs for 2026 Evaluated",
        domain: "caranddriver.com",
        time: "4 days ago · 1:12 PM",
        matchReason: "Matches concept: electric vehicle energy density",
      },
    ],
  },
];

export const TryReviaModal: React.FC<TryReviaModalProps> = ({ isOpen, onClose }) => {
  const [inputQuery, setInputQuery] = useState(PRESET_QUERIES[0].query);
  const [activePresetIndex, setActivePresetIndex] = useState(0);
  const [simState, setSimState] = useState<OrbState>("results");
  const [selectedResultIndex, setSelectedResultIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelectPreset = (idx: number) => {
    setActivePresetIndex(idx);
    setInputQuery(PRESET_QUERIES[idx].query);
    setSimState("searching");
    setTimeout(() => {
      setSimState("results");
      setSelectedResultIndex(0);
    }, 500);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSimState("searching");
    setTimeout(() => {
      setSimState("results");
      setSelectedResultIndex(0);
    }, 600);
  };

  const currentResults = PRESET_QUERIES[activePresetIndex].results;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="glass-capsule"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="simulation-modal-title"
        style={{
          width: "100%",
          maxWidth: "600px",
          background: "rgba(11, 15, 25, 0.98)",
          borderRadius: "24px",
          border: "1px solid var(--border-subtle)",
          padding: "28px",
          boxShadow: "0 30px 80px rgba(0, 0, 0, 0.9), 0 0 1px rgba(255, 255, 255, 0.3)",
          position: "relative",
          animation: "fadeIn 0.2s ease",
        }}
      >
        {/* Modal Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Sparkles size={16} style={{ color: "var(--accent-cyan)" }} />
            <span id="simulation-modal-title" style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff" }}>
              Interactive Revia Simulation
            </span>
          </div>

          <button
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.06)",
              border: "none",
              borderRadius: "50%",
              width: "28px",
              height: "28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-secondary)",
              cursor: "pointer",
            }}
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>

        {/* Clear Simulation Disclosure Label (Requirement 7) */}
        <div
          style={{
            background: "rgba(56, 189, 248, 0.08)",
            border: "1px solid rgba(56, 189, 248, 0.25)",
            borderRadius: "10px",
            padding: "10px 14px",
            fontSize: "12px",
            color: "#bae6fd",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <ShieldAlert size={15} style={{ color: "var(--accent-cyan)", flexShrink: 0 }} />
          <span>
            <strong>Simulation Sandbox:</strong> This browser demo tests Revia's conceptual query matching against sample data. It does not access your private browsing history.
          </span>
        </div>

        {/* Query Input Box */}
        <form onSubmit={handleFormSubmit} style={{ marginBottom: "16px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "rgba(0, 0, 0, 0.6)",
              border: "1px solid var(--border-medium)",
              borderRadius: "14px",
              padding: "10px 14px",
            }}
          >
            <ReviaOrb state={simState} size={24} />
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Describe what you remember..."
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#ffffff",
                fontSize: "14px",
                fontFamily: "inherit",
              }}
            />
            <button
              type="submit"
              style={{
                background: "var(--bg-pill)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "6px",
                color: "var(--text-secondary)",
                padding: "4px 8px",
                fontSize: "11px",
                cursor: "pointer",
              }}
            >
              Search
            </button>
          </div>
        </form>

        {/* Realistic Presets */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "11px", color: "var(--text-tertiary)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Or try a sample human query:
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {PRESET_QUERIES.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectPreset(idx)}
                style={{
                  textAlign: "left",
                  background: activePresetIndex === idx ? "rgba(56, 189, 248, 0.12)" : "rgba(255, 255, 255, 0.03)",
                  border: activePresetIndex === idx ? "1px solid rgba(56, 189, 248, 0.4)" : "1px solid var(--border-hairline)",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  fontSize: "12.5px",
                  color: activePresetIndex === idx ? "#ffffff" : "var(--text-secondary)",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                "{p.query}"
              </button>
            ))}
          </div>
        </div>

        {/* Results Simulation Display */}
        {simState === "searching" ? (
          <div style={{ padding: "20px", textAlign: "center", color: "var(--accent-cyan)", fontSize: "13px" }}>
            <Sparkles size={16} className="spin-icon" style={{ marginBottom: "8px" }} />
            <div>Running on-device vector similarity & BM25 ranking...</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ fontSize: "11px", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Matched Memory Results:
            </div>
            {currentResults.map((res, i) => (
              <div
                key={i}
                onClick={() => setSelectedResultIndex(i)}
                style={{
                  padding: "10px 14px",
                  borderRadius: "10px",
                  background: selectedResultIndex === i ? "rgba(56, 189, 248, 0.14)" : "rgba(255, 255, 255, 0.02)",
                  border: selectedResultIndex === i ? "1px solid rgba(56, 189, 248, 0.4)" : "1px solid var(--border-hairline)",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ fontSize: "13.5px", fontWeight: 600, color: "#ffffff" }}>
                    {res.title}
                  </span>
                  <ExternalLink size={12} style={{ color: "var(--text-tertiary)" }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "11.5px", color: "var(--text-tertiary)", marginBottom: "4px" }}>
                  <span>{res.domain}</span>
                  <span>·</span>
                  <span>{res.time}</span>
                </div>
                <div style={{ fontSize: "11px", color: "var(--accent-cyan)" }}>
                  {res.matchReason}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
