import React from "react";
import { CONFIG } from "../config";
import { GitBranch } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        backgroundColor: "var(--bg-linen)",
        borderTop: "1px solid var(--border-light-medium)",
        padding: "70px 0 50px 0",
        position: "relative",
      }}
    >
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.5fr 1fr 1fr",
            gap: "48px",
            marginBottom: "50px",
          }}
          className="footer-grid"
        >
          {/* Brand & Manifesto Column */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  background: "radial-gradient(circle at 35% 30%, #ffffff 0%, #c7d2fe 60%, #6366f1 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#ffffff" }} />
              </div>
              <span style={{ fontSize: "18px", fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--text-ink)" }}>
                REVIA
              </span>
            </div>

            <p style={{ fontSize: "14px", lineHeight: 1.6, color: "var(--text-body)", maxWidth: "360px", marginBottom: "16px" }}>
              “Your computer remembers, so you don’t have to.” A private, ambient memory assistant for Mac. Built with Rust and local vector intelligence.
            </p>

            <div style={{ fontSize: "12px", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
              No cloud tracking · 100% on-device execution
            </div>
          </div>

          {/* Navigation & Direct Links */}
          <div>
            <div style={{ fontSize: "12px", fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--text-ink)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "16px" }}>
              Explore
            </div>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px", fontSize: "13.5px" }}>
              <li>
                <a href="#story" style={{ color: "var(--text-body)", textDecoration: "none" }}>The Cognitive Gap</a>
              </li>
              <li>
                <a href="#memory-field" style={{ color: "var(--text-body)", textDecoration: "none" }}>Memory Field</a>
              </li>
              <li>
                <a href="#how-it-works" style={{ color: "var(--text-body)", textDecoration: "none" }}>How Revia Works</a>
              </li>
              <li>
                <a href="#search-demo" style={{ color: "var(--text-body)", textDecoration: "none" }}>Interactive Capsule Demo</a>
              </li>
              <li>
                <a href="#voice" style={{ color: "var(--text-body)", textDecoration: "none" }}>Ambient Voice</a>
              </li>
              <li>
                <a href="#ambient" style={{ color: "var(--text-body)", textDecoration: "none" }}>Desktop Continuity</a>
              </li>
            </ul>
          </div>

          {/* Technical Disclosures & Downloads */}
          <div>
            <div style={{ fontSize: "12px", fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--text-ink)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "16px" }}>
              Distribution
            </div>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px", fontSize: "13.5px" }}>
              <li>
                <a href={CONFIG.releaseDownloadUrl} download={CONFIG.zipFilename} style={{ color: "var(--accent-violet)", textDecoration: "none", fontWeight: 600 }}>
                  Download Direct ZIP (v{CONFIG.version})
                </a>
              </li>
              <li>
                <a href={CONFIG.githubReleasePageUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-body)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <GitBranch size={14} />
                  <span>GitHub Repository</span>
                </a>
              </li>
              <li>
                <a href="#privacy" style={{ color: "var(--text-body)", textDecoration: "none" }}>Local Security Architecture</a>
              </li>
              <li>
                <a href="#faq" style={{ color: "var(--text-body)", textDecoration: "none" }}>Technical FAQ</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Editorial Colophon */}
        <div
          style={{
            borderTop: "1px solid var(--border-light-subtle)",
            paddingTop: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "14px",
            fontSize: "12px",
            color: "var(--text-muted)",
          }}
        >
          <div>
            © {new Date().getFullYear()} Revia. Released under MIT / Open local-first principles.
          </div>

          <div style={{ fontFamily: "var(--font-mono)", display: "flex", gap: "16px" }}>
            <span>SHA-256: {CONFIG.zipSha256.slice(0, 16)}...</span>
            <span>ARM64 (Apple Silicon)</span>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
        }
      `}</style>
    </footer>
  );
};
