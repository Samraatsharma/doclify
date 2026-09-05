import { Database, MessageSquare, Zap, Mic, Keyboard } from "lucide-react";
import { ReviaOrb } from "./ReviaOrb";

export const Features: React.FC = () => {
  return (
    <section id="features" className="section-spacing" style={{ position: "relative" }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: "center", maxWidth: "700px", margin: "0 auto 64px auto" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 12px",
              borderRadius: "20px",
              background: "rgba(56, 189, 248, 0.08)",
              border: "1px solid rgba(56, 189, 248, 0.2)",
              fontSize: "12px",
              fontWeight: 600,
              color: "var(--accent-cyan)",
              marginBottom: "16px",
            }}
          >
            <span>Core Architecture</span>
          </div>

          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", marginBottom: "16px" }}>
            Engineered for speed, privacy, and <span className="gradient-text-accent">frictionless recall</span>.
          </h2>
          <p style={{ fontSize: "16px", lineHeight: "1.6" }}>
            Revia is not another cloud SaaS. It is an on-device personal memory index built natively for the Mac.
          </p>
        </div>

        {/* Asymmetrical Editorial Bento Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(12, 1fr)",
            gap: "24px",
          }}
        >
          {/* Bento Item 1: Large Featured Card (8 cols) - Remember what you saw */}
          <div
            className="glass-panel"
            style={{
              gridColumn: "span 8",
              borderRadius: "24px",
              padding: "40px 36px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ maxWidth: "480px", zIndex: 1 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "var(--accent-cyan)",
                  fontSize: "12px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "14px",
                }}
              >
                <Database size={15} />
                <span>On-Device Memory Snapshot</span>
              </div>

              <h3 style={{ fontSize: "26px", color: "#ffffff", marginBottom: "12px", lineHeight: "1.25" }}>
                Remember what you saw, automatically.
              </h3>

              <p style={{ fontSize: "15px", lineHeight: "1.6", color: "var(--text-secondary)", marginBottom: "24px" }}>
                Revia keeps a private local memory of the things you browse so you can find them later. No manual bookmarking, no copy-pasting links into notes, and no cloud syncing.
              </p>
            </div>

            {/* Visual Representation of Chrome Read-Only Ingestion */}
            <div
              style={{
                background: "rgba(8, 11, 18, 0.85)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "14px",
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                color: "var(--text-tertiary)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--accent-emerald)" }} />
                <span style={{ color: "#ffffff", fontWeight: 500 }}>Google Chrome History Snapshot</span>
              </div>
              <span style={{ color: "var(--accent-cyan)" }}>Read-Only · Zero Locks · Local SQLite</span>
            </div>
          </div>

          {/* Bento Item 2: Medium Card (4 cols) - Ask Naturally */}
          <div
            className="glass-panel"
            style={{
              gridColumn: "span 4",
              borderRadius: "24px",
              padding: "36px 28px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#a78bfa",
                  fontSize: "12px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "14px",
                }}
              >
                <MessageSquare size={15} />
                <span>Conceptual Queries</span>
              </div>

              <h3 style={{ fontSize: "22px", color: "#ffffff", marginBottom: "12px" }}>
                Ask naturally.
              </h3>

              <p style={{ fontSize: "14px", lineHeight: "1.6", color: "var(--text-secondary)", marginBottom: "20px" }}>
                You don’t need the exact title or URL. Describe what you remember in everyday language.
              </p>
            </div>

            {/* Simulated Query Quote Bubble */}
            <div
              style={{
                background: "rgba(168, 85, 247, 0.08)",
                border: "1px solid rgba(168, 85, 247, 0.2)",
                borderRadius: "12px",
                padding: "12px 14px",
                fontSize: "12.5px",
                color: "#e9d5ff",
                fontStyle: "italic",
              }}
            >
              "That React authentication article I saw last week..."
            </div>
          </div>

          {/* Bento Item 3: Medium Card (4 cols) - Search Instantly */}
          <div
            className="glass-panel"
            style={{
              gridColumn: "span 4",
              borderRadius: "24px",
              padding: "36px 28px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#38bdf8",
                  fontSize: "12px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "14px",
                }}
              >
                <Zap size={15} />
                <span>Hybrid Intelligence</span>
              </div>

              <h3 style={{ fontSize: "22px", color: "#ffffff", marginBottom: "12px" }}>
                Search instantly.
              </h3>

              <p style={{ fontSize: "14px", lineHeight: "1.6", color: "var(--text-secondary)" }}>
                Revia combines FTS5 full-text indexing, on-device ONNX dense embeddings, and temporal parsing for multi-dimensional search under 5ms.
              </p>
            </div>

            <div style={{ marginTop: "24px", display: "flex", gap: "8px" }}>
              <span className="glass-pill" style={{ padding: "4px 10px", borderRadius: "8px", fontSize: "11px", color: "var(--text-secondary)" }}>FTS5 BM25</span>
              <span className="glass-pill" style={{ padding: "4px 10px", borderRadius: "8px", fontSize: "11px", color: "var(--text-secondary)" }}>Vector Cosine</span>
              <span className="glass-pill" style={{ padding: "4px 10px", borderRadius: "8px", fontSize: "11px", color: "var(--text-secondary)" }}>Recency Boost</span>
            </div>
          </div>

          {/* Bento Item 4: Medium Card (4 cols) - Speak or Type */}
          <div
            className="glass-panel"
            style={{
              gridColumn: "span 4",
              borderRadius: "24px",
              padding: "36px 28px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#34d399",
                  fontSize: "12px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "14px",
                }}
              >
                <Mic size={15} />
                <span>Voice & Speech</span>
              </div>

              <h3 style={{ fontSize: "22px", color: "#ffffff", marginBottom: "12px" }}>
                Speak or type.
              </h3>

              <p style={{ fontSize: "14px", lineHeight: "1.6", color: "var(--text-secondary)" }}>
                Tap the microphone or hold your voice key to tell Revia what you're looking for. Native macOS dictation integration keeps speech on-device.
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "20px" }}>
              <ReviaOrb state="listening" size={36} audioLevel={0.5} />
              <span style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>Audio-reactive 3D orb responds to your voice</span>
            </div>
          </div>

          {/* Bento Item 5: Medium Card (4 cols) - Always within reach */}
          <div
            className="glass-panel"
            style={{
              gridColumn: "span 4",
              borderRadius: "24px",
              padding: "36px 28px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#fbbf24",
                  fontSize: "12px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "14px",
                }}
              >
                <Keyboard size={15} />
                <span>Global Invocation</span>
              </div>

              <h3 style={{ fontSize: "22px", color: "#ffffff", marginBottom: "12px" }}>
                Always within reach.
              </h3>

              <p style={{ fontSize: "14px", lineHeight: "1.6", color: "var(--text-secondary)" }}>
                Summon Revia from anywhere with double-tap Control or Option+Space. Revia floats near the top-right of your active monitor.
              </p>
            </div>

            {/* Keycaps Visual */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "20px" }}>
              <div
                style={{
                  background: "var(--bg-pill)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "8px",
                  padding: "6px 12px",
                  fontSize: "14px",
                  fontFamily: "var(--font-mono)",
                  fontWeight: 700,
                  color: "#ffffff",
                  boxShadow: "0 3px 0 rgba(0, 0, 0, 0.4)",
                }}
              >
                ⌃ Control
              </div>
              <span style={{ color: "var(--text-tertiary)" }}>+</span>
              <div
                style={{
                  background: "var(--bg-pill)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "8px",
                  padding: "6px 12px",
                  fontSize: "14px",
                  fontFamily: "var(--font-mono)",
                  fontWeight: 700,
                  color: "#ffffff",
                  boxShadow: "0 3px 0 rgba(0, 0, 0, 0.4)",
                }}
              >
                ⌃ Control
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          #features .glass-panel {
            grid-column: span 12 !important;
          }
        }
      `}</style>
    </section>
  );
};
