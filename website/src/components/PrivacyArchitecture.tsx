import React from "react";
import { Shield, Lock, HardDrive, Cpu } from "lucide-react";

export const PrivacyArchitecture: React.FC = () => {
  return (
    <section
      id="privacy"
      style={{
        padding: "120px 0 130px 0",
        backgroundColor: "var(--bg-midnight)",
        color: "#ffffff",
        position: "relative",
        overflow: "hidden",
      }}
      className="texture-grid-dark"
    >
      <div className="container">
        {/* Section Sub-badge */}
        <div style={{ textAlign: "center", marginBottom: "22px" }}>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11.5px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "#34d399",
              background: "rgba(16, 185, 129, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.25)",
              padding: "5px 14px",
              borderRadius: "20px",
            }}
          >
            08 // Local Architecture Blueprint
          </span>
        </div>

        {/* Narrative Headline */}
        <div style={{ textAlign: "center", maxWidth: "860px", margin: "0 auto 52px auto" }}>
          <h2 className="headline-editorial" style={{ color: "#ffffff", marginBottom: "20px" }}>
            Your computer is the vault.
            <br />
            <span className="serif-italic" style={{ color: "#a7f3d0" }}>Zero cloud dependencies. Zero telemetry.</span>
          </h2>

          <p className="lead-paragraph-dark" style={{ maxWidth: "660px", margin: "0 auto" }}>
            Revia does not possess a backend server. No personal data, URLs, search queries, or embeddings are ever transmitted across the internet.
          </p>
        </div>

        {/* ====================================================================
            ARCHITECTURAL COMPUTER ENCLOSURE BLUEPRINT SCHEMATIC
            ==================================================================== */}
        <div
          style={{
            maxWidth: "1000px",
            margin: "0 auto",
            background: "linear-gradient(180deg, #111726 0%, #090c13 100%)",
            border: "1.5px solid rgba(52, 211, 153, 0.25)",
            borderRadius: "28px",
            padding: "48px 36px",
            boxShadow: "0 30px 80px rgba(0, 0, 0, 0.6)",
            position: "relative",
            overflow: "hidden",
          }}
          className="specular-top-dark"
        >
          {/* Blueprint Title Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "36px", flexWrap: "wrap", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 10px #10b981" }} />
              <span style={{ fontSize: "12.5px", fontFamily: "var(--font-mono)", fontWeight: 700, color: "#ffffff" }}>
                ISOLATED LOCAL ENVIRONMENT // APPLE SILICON HARDWARE BUS
              </span>
            </div>
            <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "rgba(255, 255, 255, 0.4)" }}>
              STORAGE: ~/Library/Application Support/com.revia.app/
            </div>
          </div>

          {/* 4-Stage Architectural Data Flow Pipeline */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "16px",
              position: "relative",
              marginBottom: "40px",
            }}
            className="blueprint-grid"
          >
            {/* Stage 1 */}
            <div
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "16px",
                padding: "20px 16px",
              }}
            >
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(99, 102, 241, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
                <HardDrive size={18} color="#818cf8" />
              </div>
              <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "#818cf8", marginBottom: "4px" }}>
                INPUT 01
              </div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff", marginBottom: "6px" }}>
                Local Data Scanners
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-dark-secondary)", lineHeight: 1.45 }}>
                Reads local Chrome history database directly from disk without browser plugins.
              </div>
            </div>

            {/* Stage 2 */}
            <div
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "16px",
                padding: "20px 16px",
              }}
            >
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(56, 189, 248, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
                <Cpu size={18} color="#38bdf8" />
              </div>
              <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "#38bdf8", marginBottom: "4px" }}>
                NEURAL 02
              </div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff", marginBottom: "6px" }}>
                FastEmbed On-Device
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-dark-secondary)", lineHeight: 1.45 }}>
                Runs bge-small-en-v1.5 locally via ONNX Runtime without remote AI API calls.
              </div>
            </div>

            {/* Stage 3 */}
            <div
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "16px",
                padding: "20px 16px",
              }}
            >
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(16, 185, 129, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
                <Lock size={18} color="#34d399" />
              </div>
              <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "#34d399", marginBottom: "4px" }}>
                STORAGE 03
              </div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff", marginBottom: "6px" }}>
                Local SQLite VSS
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-dark-secondary)", lineHeight: 1.45 }}>
                Vectors indexed in your user Application Support directory. Zero cloud synchronization.
              </div>
            </div>

            {/* Stage 4 */}
            <div
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "16px",
                padding: "20px 16px",
              }}
            >
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(251, 191, 36, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
                <Shield size={18} color="#fbbf24" />
              </div>
              <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "#fbbf24", marginBottom: "4px" }}>
                CONTROL 04
              </div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff", marginBottom: "6px" }}>
                Instant Local Purge
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-dark-secondary)", lineHeight: 1.45 }}>
                One click in Settings immediately deletes the SQLite file and clears all memory vectors.
              </div>
            </div>
          </div>

          {/* Verified Disclosures Table */}
          <div
            style={{
              background: "rgba(0, 0, 0, 0.4)",
              borderRadius: "16px",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              padding: "20px 24px",
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "20px",
            }}
            className="disclosures-grid"
          >
            <div>
              <div style={{ color: "#34d399", fontWeight: 700, fontSize: "13px", marginBottom: "4px" }}>
                ✓ No Account or Login
              </div>
              <div style={{ fontSize: "11.5px", color: "rgba(255, 255, 255, 0.55)" }}>
                You never create an account. Revia has no user database or authentication servers.
              </div>
            </div>

            <div>
              <div style={{ color: "#34d399", fontWeight: 700, fontSize: "13px", marginBottom: "4px" }}>
                ✓ Works 100% Offline
              </div>
              <div style={{ fontSize: "11.5px", color: "rgba(255, 255, 255, 0.55)" }}>
                Disconnect your Wi-Fi: Revia searches, indexes, and surfaces memories without degradation.
              </div>
            </div>

            <div>
              <div style={{ color: "#34d399", fontWeight: 700, fontSize: "13px", marginBottom: "4px" }}>
                ✓ No Cloud AI Subscriptions
              </div>
              <div style={{ fontSize: "11.5px", color: "rgba(255, 255, 255, 0.55)" }}>
                No monthly API billing or OpenAI rate limits. The model runs on your machine’s silicon.
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .blueprint-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .disclosures-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
};
