import React from "react";
import { Shield, Lock, HardDrive, CheckCircle2, AlertCircle } from "lucide-react";
import { ReviaOrb } from "./ReviaOrb";

export const PrivacySection: React.FC = () => {
  return (
    <section
      id="privacy"
      style={{
        padding: "100px 0 110px 0",
        background: "linear-gradient(180deg, #030508 0%, #070c14 50%, #030508 100%)",
        borderTop: "1px solid var(--border-hairline)",
        borderBottom: "1px solid var(--border-hairline)",
        position: "relative",
      }}
    >
      <div className="container" style={{ maxWidth: "980px" }}>
        {/* Section Header */}
        <div style={{ textAlign: "center", maxWidth: "720px", margin: "0 auto 56px auto" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 12px",
              borderRadius: "20px",
              background: "rgba(16, 185, 129, 0.08)",
              border: "1px solid rgba(16, 185, 129, 0.25)",
              fontSize: "12px",
              fontWeight: 600,
              color: "var(--accent-emerald)",
              marginBottom: "16px",
            }}
          >
            <Shield size={13} />
            <span>Privacy Architecture & Disclosures</span>
          </div>

          <h2 className="headline-section" style={{ marginBottom: "16px" }}>
            Your memories <span className="text-gradient-cyan">stay yours</span>.
          </h2>

          <p className="subheadline-lead">
            Revia's memory store, full-text index, and vector retrieval engine run directly on your Mac. No cloud account or external AI subscription required.
          </p>
        </div>

        {/* 4-Stage On-Device Data Flow Diagram */}
        <div
          style={{
            background: "linear-gradient(180deg, #0b0f19 0%, #06080d 100%)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "24px",
            padding: "40px 32px",
            boxShadow: "0 24px 60px rgba(0, 0, 0, 0.7)",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "16px",
            }}
            className="privacy-flow-grid"
          >
            {/* STAGE 1 */}
            <div
              style={{
                padding: "20px 16px",
                borderRadius: "14px",
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid var(--border-hairline)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: "rgba(255, 255, 255, 0.06)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 12px auto",
                  color: "#ffffff",
                }}
              >
                <HardDrive size={18} />
              </div>
              <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--accent-cyan)", marginBottom: "4px" }}>
                01 · SOURCE
              </div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff", marginBottom: "4px" }}>
                Your Mac
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-tertiary)", lineHeight: "1.4" }}>
                Read-only snapshot of local Chrome database
              </div>
            </div>

            {/* STAGE 2 */}
            <div
              style={{
                padding: "20px 16px",
                borderRadius: "14px",
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid var(--border-hairline)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: "rgba(56, 189, 248, 0.1)",
                  border: "1px solid rgba(56, 189, 248, 0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 12px auto",
                  color: "var(--accent-cyan)",
                }}
              >
                <Lock size={18} />
              </div>
              <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--accent-cyan)", marginBottom: "4px" }}>
                02 · STORAGE
              </div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff", marginBottom: "4px" }}>
                Local SQLite
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-tertiary)", lineHeight: "1.4" }}>
                Stored strictly in Application Support/com.revia.app
              </div>
            </div>

            {/* STAGE 3 */}
            <div
              style={{
                padding: "20px 16px",
                borderRadius: "14px",
                background: "rgba(56, 189, 248, 0.04)",
                border: "1px solid rgba(56, 189, 248, 0.3)",
                textAlign: "center",
              }}
            >
              <div style={{ marginBottom: "10px" }}>
                <ReviaOrb state="searching" size={38} />
              </div>
              <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--accent-cyan)", marginBottom: "4px" }}>
                03 · INTELLIGENCE
              </div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--accent-cyan)", marginBottom: "4px" }}>
                ONNX Vectors
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                On-device FastEmbed runs embeddings locally
              </div>
            </div>

            {/* STAGE 4 */}
            <div
              style={{
                padding: "20px 16px",
                borderRadius: "14px",
                background: "rgba(16, 185, 129, 0.04)",
                border: "1px solid rgba(16, 185, 129, 0.25)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: "rgba(16, 185, 129, 0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 12px auto",
                  color: "var(--accent-emerald)",
                }}
              >
                <CheckCircle2 size={18} />
              </div>
              <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--accent-emerald)", marginBottom: "4px" }}>
                04 · RETRIEVAL
              </div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--accent-emerald)", marginBottom: "4px" }}>
                Instant Results
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-tertiary)", lineHeight: "1.4" }}>
                Zero outbound network calls for core search
              </div>
            </div>
          </div>
        </div>

        {/* Honest Technical Disclosures (No false marketing claims!) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
          }}
          className="privacy-disclosure-grid"
        >
          <div
            style={{
              padding: "24px",
              borderRadius: "16px",
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--accent-emerald)", fontWeight: 700, fontSize: "14px", marginBottom: "8px" }}>
              <CheckCircle2 size={16} />
              <span>What Never Leaves Your Mac</span>
            </div>
            <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
              Your memories stay on your computer. Your browsing history, visited URLs, indexed page text, search queries, and local semantic embeddings are never uploaded to any remote server or ad broker. Optional product analytics are separate from your private memories.
            </p>
          </div>

          <div
            style={{
              padding: "24px",
              borderRadius: "16px",
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--accent-amber)", fontWeight: 700, fontSize: "14px", marginBottom: "8px" }}>
              <AlertCircle size={16} />
              <span>Accurate Speech Disclosure</span>
            </div>
            <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
              When using voice input, Revia utilizes the native macOS Speech Recognition framework. Depending on your macOS settings and model support, Apple’s speech service may perform on-device transcription or process speech via system speech endpoints per Apple’s standard platform privacy policy.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 800px) {
          .privacy-flow-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .privacy-disclosure-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 480px) {
          .privacy-flow-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
};
