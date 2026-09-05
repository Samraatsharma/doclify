import React, { useState } from "react";
import { Compass } from "lucide-react";

interface Fragment {
  id: string;
  text: string;
  source: string;
  tag: string;
  x: number;
  y: number;
}

const FRAGMENTS: Fragment[] = [
  { id: "1", text: "that article about SQLite query planning and WAL indices", source: "towardsdatascience.com", tag: "Reading", x: 12, y: 15 },
  { id: "2", text: "the auth cookie conversation in PR #412", source: "github.com", tag: "Code", x: 68, y: 18 },
  { id: "3", text: "that PDF chart comparing solid-state battery chemistry", source: "downloads/battery-eval.pdf", tag: "Document", x: 18, y: 72 },
  { id: "4", text: "the Figma color tokens Maya shared in Slack", source: "figma.com", tag: "Design", x: 74, y: 68 },
  { id: "5", text: "the docker compose command for pruning named volumes", source: "stackoverflow.com", tag: "Terminal", x: 42, y: 44 },
  { id: "6", text: "the receipt invoice for the Apple Developer renewal", source: "mail.google.com", tag: "Receipt", x: 82, y: 40 },
];

export const ProblemStory: React.FC = () => {
  const [converged, setConverged] = useState(false);
  const [activeFragment, setActiveFragment] = useState<string | null>(null);

  return (
    <section
      id="story"
      style={{
        padding: "110px 0 120px 0",
        backgroundColor: "var(--bg-linen)",
        position: "relative",
        overflow: "hidden",
      }}
      className="texture-dots-subtle"
    >
      <div className="container">
        {/* Editorial Sub-badge */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11.5px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--accent-violet)",
              background: "#ffffff",
              padding: "5px 12px",
              borderRadius: "20px",
              border: "1px solid var(--border-light-medium)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            01 // The Cognitive Gap
          </span>
        </div>

        {/* Narrative Headline */}
        <div style={{ textAlign: "center", maxWidth: "840px", margin: "0 auto 54px auto" }}>
          <h2 className="headline-editorial" style={{ marginBottom: "20px" }}>
            You remember the thing.
            <br />
            <span className="serif-italic" style={{ color: "var(--text-lead)" }}>Not where you saw it.</span>
          </h2>

          <p className="lead-paragraph" style={{ maxWidth: "660px", margin: "0 auto" }}>
            Human memory does not organize information by URL paths, file extensions, or exact keywords. You remember concepts, emotions, and rough timeframes.
          </p>
        </div>

        {/* ====================================================================
            SCATTERED MEMORY FIELD CONVERGENCE CANVAS
            ==================================================================== */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid var(--border-light-medium)",
            borderRadius: "24px",
            padding: "48px 32px",
            boxShadow: "var(--shadow-md)",
            position: "relative",
            minHeight: "420px",
            marginBottom: "56px",
            overflow: "hidden",
          }}
          className="specular-top-light"
        >
          {/* Canvas Controls Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "36px",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-ink)" }}>
                Scattered Cognitive Memory Fragments
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                Click "Connect Memories" to simulate Revia's associative vector synthesis.
              </div>
            </div>

            <button
              onClick={() => setConverged(!converged)}
              className="btn-dark"
              style={{
                padding: "8px 18px",
                fontSize: "13px",
                borderRadius: "10px",
              }}
            >
              <Compass size={14} />
              <span>{converged ? "Reset Scattered State" : "Connect Memories with Revia"}</span>
            </button>
          </div>

          {/* Convergence Node (Central Core) */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "radial-gradient(circle at 35% 30%, #ffffff 0%, #c7d2fe 60%, #6366f1 100%)",
              boxShadow: converged
                ? "0 0 50px rgba(99, 102, 241, 0.6), 0 0 0 8px rgba(99, 102, 241, 0.15)"
                : "0 4px 16px rgba(17, 20, 26, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
              zIndex: 10,
            }}
          >
            <span style={{ fontSize: "11px", fontWeight: 800, fontFamily: "var(--font-mono)", color: "#ffffff" }}>
              REVIA
            </span>
          </div>

          {/* Interactive Floating Shards */}
          <div style={{ position: "relative", width: "100%", height: "260px" }}>
            {FRAGMENTS.map((f, i) => {
              // When converged, cluster towards center (50%, 50%)
              const posX = converged ? 50 + (i % 2 === 0 ? -18 : 18) + (i * 2 - 5) : f.x;
              const posY = converged ? 50 + (i < 3 ? -22 : 22) : f.y;

              const isHovered = activeFragment === f.id;

              return (
                <div
                  key={f.id}
                  onMouseEnter={() => setActiveFragment(f.id)}
                  onMouseLeave={() => setActiveFragment(null)}
                  style={{
                    position: "absolute",
                    left: `${posX}%`,
                    top: `${posY}%`,
                    transform: "translate(-50%, -50%)",
                    background: isHovered || converged ? "#ffffff" : "rgba(255, 255, 255, 0.85)",
                    border: isHovered
                      ? "1.5px solid #6366f1"
                      : converged
                      ? "1.5px solid rgba(99, 102, 241, 0.4)"
                      : "1px solid var(--border-light-medium)",
                    borderRadius: "12px",
                    padding: "10px 14px",
                    boxShadow: isHovered || converged ? "var(--shadow-md)" : "var(--shadow-sm)",
                    cursor: "pointer",
                    transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                    maxWidth: "240px",
                    zIndex: isHovered ? 20 : 5,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span
                      style={{
                        fontSize: "9.5px",
                        fontFamily: "var(--font-mono)",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        color: "#6366f1",
                        fontWeight: 700,
                      }}
                    >
                      {f.tag}
                    </span>
                    <span style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                      {f.source}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "var(--text-ink)",
                      lineHeight: 1.35,
                    }}
                  >
                    “{f.text}”
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ====================================================================
            TWO PARADIGMS CONTRAST: KEYWORD TRAP VS ASSOCIATIVE MEMORY
            ==================================================================== */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "28px",
          }}
          className="contrast-grid"
        >
          {/* The Keyword Trap (What people suffer today) */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid var(--border-light-medium)",
              borderRadius: "20px",
              padding: "32px 28px",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
              <span
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  background: "#fee2e2",
                  color: "#dc2626",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: 700,
                }}
              >
                ✕
              </span>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-ink)" }}>
                The Traditional Keyword Trap
              </h3>
            </div>

            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "12px" }}>
              <li style={{ fontSize: "14px", color: "var(--text-body)", display: "flex", gap: "10px" }}>
                <span style={{ color: "#ef4444" }}>•</span>
                <span><strong>Exact string matching:</strong> If the article wrote "latency" and you type "speed", browser history returns zero results.</span>
              </li>
              <li style={{ fontSize: "14px", color: "var(--text-body)", display: "flex", gap: "10px" }}>
                <span style={{ color: "#ef4444" }}>•</span>
                <span><strong>Siloed search bars:</strong> Chrome history doesn’t know what you opened in Safari, Preview, VS Code, or Slack.</span>
              </li>
              <li style={{ fontSize: "14px", color: "var(--text-body)", display: "flex", gap: "10px" }}>
                <span style={{ color: "#ef4444" }}>•</span>
                <span><strong>20-tab chaos:</strong> Leaving 40 browser tabs open indefinitely as makeshift "bookmarks" because finding them again is impossible.</span>
              </li>
            </ul>
          </div>

          {/* Revia Associative Recall */}
          <div
            style={{
              background: "linear-gradient(180deg, #ffffff 0%, #f0eeff 100%)",
              border: "1px solid rgba(99, 102, 241, 0.3)",
              borderRadius: "20px",
              padding: "32px 28px",
              boxShadow: "0 8px 24px rgba(99, 102, 241, 0.08)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
              <span
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  background: "#dcfce7",
                  color: "#16a34a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: 700,
                }}
              >
                ✓
              </span>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-ink)" }}>
                Revia Associative Recall
              </h3>
            </div>

            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "12px" }}>
              <li style={{ fontSize: "14px", color: "var(--text-body)", display: "flex", gap: "10px" }}>
                <span style={{ color: "#16a34a" }}>•</span>
                <span><strong>Conceptual semantic matching:</strong> Searches the mathematical meaning of your memory, not brittle character strings.</span>
              </li>
              <li style={{ fontSize: "14px", color: "var(--text-body)", display: "flex", gap: "10px" }}>
                <span style={{ color: "#16a34a" }}>•</span>
                <span><strong>Temporal intelligence:</strong> Understands queries like "last Tuesday", "yesterday afternoon", or "before the weekend".</span>
              </li>
              <li style={{ fontSize: "14px", color: "var(--text-body)", display: "flex", gap: "10px" }}>
                <span style={{ color: "#16a34a" }}>•</span>
                <span><strong>Instant ambient access:</strong> Double-tap Control, type 4 words, press Return, and close the tab without anxiety.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 840px) {
          .contrast-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
};
