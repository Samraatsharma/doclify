import React, { useState } from "react";
import { Sparkles, Zap } from "lucide-react";

export const ShortcutVisual: React.FC = () => {
  const [tapState, setTapState] = useState<0 | 1 | 2>(0);
  const [activated, setActivated] = useState(false);

  const triggerDoubleTap = () => {
    setTapState(1);
    setTimeout(() => {
      setTapState(2);
      setActivated(true);
      setTimeout(() => {
        setTapState(0);
        setTimeout(() => setActivated(false), 2400);
      }, 500);
    }, 220);
  };

  return (
    <section
      id="shortcut"
      style={{
        padding: "110px 0 120px 0",
        backgroundColor: "var(--bg-sand)",
        position: "relative",
        overflow: "hidden",
      }}
      className="texture-grid-subtle"
    >
      <div className="container">
        {/* Section Sub-badge */}
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
              padding: "5px 14px",
              borderRadius: "20px",
              border: "1px solid var(--border-light-medium)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            07 // Tactile Invocation
          </span>
        </div>

        {/* Narrative Headline */}
        <div style={{ textAlign: "center", maxWidth: "860px", margin: "0 auto 52px auto" }}>
          <h2 className="headline-editorial" style={{ marginBottom: "20px" }}>
            Summon in two keystrokes.
            <br />
            <span className="serif-italic" style={{ color: "var(--text-lead)" }}>Anywhere on your Mac.</span>
          </h2>

          <p className="lead-paragraph" style={{ maxWidth: "660px", margin: "0 auto" }}>
            No finger gymnastics. No awkward four-key chords. Double-tap your physical Control key, and Revia materializes instantly.
          </p>
        </div>

        {/* ====================================================================
            LARGE-SCALE PHYSICAL KEYCAP VISUALIZATION
            ==================================================================== */}
        <div
          style={{
            maxWidth: "780px",
            margin: "0 auto",
            background: "#ffffff",
            border: "1px solid var(--border-light-medium)",
            borderRadius: "28px",
            padding: "54px 36px",
            boxShadow: "var(--shadow-lg)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "relative",
          }}
          className="specular-top-light"
        >
          {/* Twin Sculpted Keycaps */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "28px",
              marginBottom: "36px",
              cursor: "pointer",
            }}
            onClick={triggerDoubleTap}
            title="Click to simulate double-tap"
          >
            {/* Keycap 1 */}
            <div
              style={{
                width: "120px",
                height: "120px",
                background: "linear-gradient(180deg, #ffffff 0%, #e2e8f0 100%)",
                border: "2px solid #cbd5e1",
                borderBottom: "6px solid #94a3b8",
                borderRadius: "22px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px",
                boxShadow: tapState >= 1 ? "0 2px 4px rgba(0,0,0,0.2)" : "0 14px 30px rgba(0,0,0,0.12)",
                transform: tapState >= 1 ? "translateY(5px)" : "translateY(0)",
                transition: "all 0.12s cubic-bezier(0.16, 1, 0.3, 1)",
                userSelect: "none",
              }}
            >
              <div style={{ fontSize: "12px", fontFamily: "var(--font-mono)", color: "#64748b", fontWeight: 700, alignSelf: "flex-start" }}>
                control
              </div>
              <div style={{ fontSize: "38px", fontWeight: 800, color: "var(--text-ink)", lineHeight: 1 }}>
                ⌃
              </div>
              <div style={{ fontSize: "10px", fontFamily: "var(--font-mono)", color: "#94a3b8" }}>
                TAP 1
              </div>
            </div>

            {/* Sequence Connector */}
            <div style={{ fontSize: "24px", color: "var(--border-light-strong)", fontWeight: 300 }}>
              +
            </div>

            {/* Keycap 2 */}
            <div
              style={{
                width: "120px",
                height: "120px",
                background: "linear-gradient(180deg, #ffffff 0%, #e2e8f0 100%)",
                border: "2px solid #cbd5e1",
                borderBottom: "6px solid #94a3b8",
                borderRadius: "22px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px",
                boxShadow: tapState === 2 ? "0 2px 4px rgba(0,0,0,0.2)" : "0 14px 30px rgba(0,0,0,0.12)",
                transform: tapState === 2 ? "translateY(5px)" : "translateY(0)",
                transition: "all 0.12s cubic-bezier(0.16, 1, 0.3, 1)",
                userSelect: "none",
              }}
            >
              <div style={{ fontSize: "12px", fontFamily: "var(--font-mono)", color: "#64748b", fontWeight: 700, alignSelf: "flex-start" }}>
                control
              </div>
              <div style={{ fontSize: "38px", fontWeight: 800, color: "var(--text-ink)", lineHeight: 1 }}>
                ⌃
              </div>
              <div style={{ fontSize: "10px", fontFamily: "var(--font-mono)", color: "#94a3b8" }}>
                TAP 2
              </div>
            </div>
          </div>

          {/* Interactive Trigger Button */}
          <button
            onClick={triggerDoubleTap}
            className="btn-dark"
            style={{ marginBottom: "28px" }}
          >
            <Zap size={15} />
            <span>Simulate Physical Double-Tap</span>
          </button>

          {/* Activation Feedback Signal */}
          {activated && (
            <div
              style={{
                background: "rgba(99, 102, 241, 0.1)",
                border: "1px solid rgba(99, 102, 241, 0.35)",
                borderRadius: "14px",
                padding: "12px 20px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                color: "var(--accent-violet)",
                fontSize: "13px",
                fontWeight: 600,
                marginBottom: "28px",
                animation: "fadeIn 0.2s ease forwards",
              }}
            >
              <Sparkles size={16} />
              <span>EventTap dispatched: 420x52 Revia Capsule summoned at top-right display!</span>
            </div>
          )}

          {/* Technical Specifications Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "16px",
              width: "100%",
              borderTop: "1px solid var(--border-light-subtle)",
              paddingTop: "24px",
            }}
            className="specs-grid"
          >
            <div>
              <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginBottom: "4px" }}>
                HARDWARE CADENCE
              </div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-ink)" }}>
                50ms – 550ms
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Prevents accidental triggers</div>
            </div>

            <div>
              <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginBottom: "4px" }}>
                VIRTUAL KEYCODES
              </div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-ink)" }}>
                59 (Left) / 62 (Right)
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Supports both sides of keyboard</div>
            </div>

            <div>
              <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginBottom: "4px" }}>
                SYSTEM OVERHEAD
              </div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#059669" }}>
                &lt; 0.05% CPU
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Native CoreGraphics EventTap</div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .specs-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
        }
      `}</style>
    </section>
  );
};
