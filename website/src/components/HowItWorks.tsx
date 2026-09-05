import React, { useState } from "react";
import { Brain, Cpu, ExternalLink, ArrowRight, CornerDownLeft } from "lucide-react";

interface Step {
  num: string;
  title: string;
  tagline: string;
  lead: string;
  details: string[];
  visualType: "thought" | "summon" | "vector" | "open";
}

const STEPS: Step[] = [
  {
    num: "01",
    title: "Remember Something",
    tagline: "The cognitive thought in natural human terms",
    lead: "You recall a fragment: “that conversation about Docker pruning” or “the article explaining SameSite cookies from Tuesday”. You don’t need the URL, title, or exact filename.",
    details: [
      "Natural language phrasing accepted",
      "Relative timeframes understood ('yesterday', 'last week')",
      "No manual tagging or bookmark organization required"
    ],
    visualType: "thought",
  },
  {
    num: "02",
    title: "Tell Revia",
    tagline: "Summon the ambient capsule without context switching",
    lead: "Press Double-Control (⌃ ⌃) or click the menu bar. The compact 420px × 52px capsule materializes at the top-right of your display. Type 3 or 4 words, or speak naturally via voice.",
    details: [
      "Zero app-switching: stays above Chrome, VS Code, or Terminal",
      "Dismisses immediately on ESC or clicking outside",
      "Instant response with zero cloud loading spinners"
    ],
    visualType: "summon",
  },
  {
    num: "03",
    title: "Local Vector Search",
    tagline: "On-device neural embeddings & SQLite VSS search",
    lead: "Revia runs an optimized FastEmbed model on Apple Silicon to compute a semantic vector embedding of your thought. It performs a cosine distance search across your local SQLite vector index in ~8ms.",
    details: [
      "100% on-device embedding generation via FastEmbed",
      "Hybrid vector + FTS5 full-text ranking",
      "Zero byte of data leaves your Mac’s local SSD"
    ],
    visualType: "vector",
  },
  {
    num: "04",
    title: "Reopen & Continue",
    tagline: "Instant jump directly back to what you needed",
    lead: "The highest-confidence memories surface with source domains, timestamps, and contextual snippets. Hit Return or click to reopen the exact webpage or file and continue your flow.",
    details: [
      "Opens directly in your default browser or viewer",
      "Highlights contextual paragraph snippet",
      "Preserves original scroll and tab state"
    ],
    visualType: "open",
  },
];

export const HowItWorks: React.FC = () => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const current = STEPS[activeStepIndex];

  return (
    <section
      id="how-it-works"
      style={{
        padding: "110px 0 120px 0",
        backgroundColor: "var(--bg-canvas)",
        position: "relative",
        overflow: "hidden",
      }}
      className="texture-grid-subtle"
    >
      <div className="container">
        {/* Section Pill Badge */}
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
            03 // The Visual Journey
          </span>
        </div>

        {/* Narrative Headline */}
        <div style={{ textAlign: "center", maxWidth: "840px", margin: "0 auto 52px auto" }}>
          <h2 className="headline-editorial" style={{ marginBottom: "20px" }}>
            From vague thought to open tab
            <br />
            <span className="serif-italic" style={{ color: "var(--text-lead)" }}>in 1.8 seconds.</span>
          </h2>

          <p className="lead-paragraph" style={{ maxWidth: "660px", margin: "0 auto" }}>
            An intentional 4-stage pipeline connecting human intuition directly to your computer’s history.
          </p>
        </div>

        {/* ====================================================================
            INTERACTIVE 4-STAGE PIPELINE NAVIGATOR
            ==================================================================== */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "12px",
            marginBottom: "36px",
          }}
          className="steps-nav-grid"
        >
          {STEPS.map((step, idx) => {
            const isActive = idx === activeStepIndex;
            return (
              <button
                key={step.num}
                onClick={() => setActiveStepIndex(idx)}
                style={{
                  background: isActive ? "#ffffff" : "rgba(17, 20, 26, 0.03)",
                  border: isActive ? "1.5px solid #6366f1" : "1px solid var(--border-light-subtle)",
                  borderRadius: "16px",
                  padding: "16px 14px",
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                  boxShadow: isActive ? "var(--shadow-md)" : "none",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: isActive ? "#6366f1" : "var(--text-muted)",
                    marginBottom: "6px",
                  }}
                >
                  PHASE {step.num}
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: isActive ? "var(--text-ink)" : "var(--text-body)",
                  }}
                >
                  {step.title}
                </div>
              </button>
            );
          })}
        </div>

        {/* ====================================================================
            STAGE DETAIL & INTERACTIVE DIAGRAM CARD
            ==================================================================== */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid var(--border-light-medium)",
            borderRadius: "24px",
            padding: "44px 36px",
            boxShadow: "var(--shadow-lg)",
            display: "grid",
            gridTemplateColumns: "1.1fr 1fr",
            gap: "48px",
            alignItems: "center",
          }}
          className="stage-detail-grid specular-top-light"
        >
          {/* Left: Editorial Explanations */}
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                fontWeight: 700,
                color: "#6366f1",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "12px",
              }}
            >
              <span>STAGE {current.num}</span>
              <span>—</span>
              <span>{current.tagline}</span>
            </div>

            <h3
              style={{
                fontSize: "28px",
                fontWeight: 800,
                color: "var(--text-ink)",
                marginBottom: "16px",
                letterSpacing: "-0.03em",
              }}
            >
              {current.title}
            </h3>

            <p style={{ fontSize: "16px", lineHeight: 1.6, color: "var(--text-body)", marginBottom: "24px" }}>
              {current.lead}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {current.details.map((detail, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "13.5px", color: "var(--text-lead)" }}>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#6366f1", marginTop: "8px", flexShrink: 0 }} />
                  <span>{detail}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "32px", display: "flex", gap: "12px" }}>
              <button
                onClick={() => setActiveStepIndex((prev) => (prev + 1) % STEPS.length)}
                className="btn-dark"
                style={{ padding: "9px 20px", fontSize: "13.5px" }}
              >
                <span>Next Stage: {STEPS[(activeStepIndex + 1) % STEPS.length].title}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Right: Live Stage Visualization Diagram */}
          <div
            style={{
              background: "linear-gradient(180deg, #131722 0%, #0c0f16 100%)",
              borderRadius: "20px",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              padding: "32px 24px",
              minHeight: "360px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              overflow: "hidden",
            }}
            className="specular-top-dark"
          >
            {/* Visual 01: Cognitive Thought Bubble */}
            {current.visualType === "thought" && (
              <div style={{ textAlign: "center", width: "100%" }}>
                <div
                  style={{
                    width: "72px",
                    height: "72px",
                    borderRadius: "50%",
                    background: "rgba(99, 102, 241, 0.2)",
                    border: "1px solid rgba(99, 102, 241, 0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 24px auto",
                  }}
                >
                  <Brain size={36} color="#818cf8" />
                </div>
                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.14)",
                    borderRadius: "14px",
                    padding: "14px 18px",
                    color: "#ffffff",
                    fontSize: "13px",
                    fontFamily: "var(--font-mono)",
                    maxWidth: "280px",
                    margin: "0 auto",
                  }}
                >
                  “I remember reading about SQLite WAL checkpointing Tuesday...”
                </div>
              </div>
            )}

            {/* Visual 02: Ambient Top-Right Capsule Summon */}
            {current.visualType === "summon" && (
              <div style={{ width: "100%", maxWidth: "320px" }}>
                <div style={{ textAlign: "center", marginBottom: "16px", fontSize: "11px", fontFamily: "var(--font-mono)", color: "#38bdf8" }}>
                  ⌃ ⌃ SHORTCUT ACTIVATED
                </div>
                <div
                  style={{
                    height: "48px",
                    background: "rgba(15, 20, 30, 0.95)",
                    border: "1px solid rgba(56, 189, 248, 0.4)",
                    borderRadius: "24px",
                    display: "flex",
                    alignItems: "center",
                    padding: "0 14px",
                    gap: "10px",
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
                  }}
                >
                  <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#6366f1" }} />
                  <span style={{ fontSize: "12.5px", color: "#ffffff", flex: 1 }}>sqlite wal checkpoint</span>
                  <CornerDownLeft size={14} color="#94a3b8" />
                </div>
              </div>
            )}

            {/* Visual 03: Vector Search Neural Index */}
            {current.visualType === "vector" && (
              <div style={{ textAlign: "center", width: "100%" }}>
                <div
                  style={{
                    width: "72px",
                    height: "72px",
                    borderRadius: "50%",
                    background: "rgba(16, 185, 129, 0.2)",
                    border: "1px solid rgba(16, 185, 129, 0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px auto",
                  }}
                >
                  <Cpu size={36} color="#34d399" />
                </div>
                <div style={{ fontSize: "12px", fontFamily: "var(--font-mono)", color: "#34d399", marginBottom: "6px" }}>
                  Apple Silicon NPU · FastEmbed
                </div>
                <div style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.5)", fontFamily: "var(--font-mono)" }}>
                  Cosine Distance &lt; 0.12 · 7.4ms
                </div>
              </div>
            )}

            {/* Visual 04: Open What You Needed */}
            {current.visualType === "open" && (
              <div style={{ width: "100%", maxWidth: "300px" }}>
                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    borderRadius: "14px",
                    padding: "16px",
                    color: "#ffffff",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10.5px", color: "#818cf8", fontFamily: "var(--font-mono)", marginBottom: "4px" }}>
                    <span>towardsdatascience.com</span>
                    <span>Tuesday</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: "13px", marginBottom: "6px" }}>
                    SQLite WAL Mode & Write Concurrency
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#38bdf8" }}>
                    <span>Tab restored</span>
                    <ExternalLink size={12} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .steps-nav-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .stage-detail-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
};
