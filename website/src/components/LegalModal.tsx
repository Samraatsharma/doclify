import React, { useEffect } from "react";
import { X, Shield, FileText, Lock } from "lucide-react";

export type LegalDocType = "privacy" | "terms";

interface LegalModalProps {
  isOpen: boolean;
  docType: LegalDocType;
  onClose: () => void;
  onSwitchDoc: (type: LegalDocType) => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  docType,
  onClose,
  onSwitchDoc,
}) => {
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

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="presentation"
      style={{ padding: "20px" }}
    >
      <div
        className="glass-capsule"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-modal-title"
        style={{
          width: "100%",
          maxWidth: "760px",
          maxHeight: "88vh",
          display: "flex",
          flexDirection: "column",
          background: "#ffffff",
          color: "var(--text-ink)",
          borderRadius: "24px",
          border: "1px solid var(--border-light-medium)",
          boxShadow: "0 30px 90px rgba(0, 0, 0, 0.25), 0 0 1px rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
          animation: "fadeIn 0.2s ease",
        }}
      >
        {/* Modal Header Bar */}
        <div
          style={{
            padding: "20px 28px",
            borderBottom: "1px solid var(--border-light-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "var(--bg-ivory)",
          }}
        >
          {/* Document Switcher Tabs */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={() => onSwitchDoc("privacy")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                padding: "8px 16px",
                borderRadius: "10px",
                border: "none",
                background: docType === "privacy" ? "#ffffff" : "transparent",
                color: docType === "privacy" ? "var(--text-ink)" : "var(--text-muted)",
                fontWeight: docType === "privacy" ? 700 : 500,
                fontSize: "13.5px",
                boxShadow: docType === "privacy" ? "0 2px 6px rgba(0, 0, 0, 0.06)" : "none",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <Shield size={15} color={docType === "privacy" ? "var(--accent-violet)" : "currentColor"} />
              <span>Privacy Policy</span>
            </button>

            <button
              onClick={() => onSwitchDoc("terms")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                padding: "8px 16px",
                borderRadius: "10px",
                border: "none",
                background: docType === "terms" ? "#ffffff" : "transparent",
                color: docType === "terms" ? "var(--text-ink)" : "var(--text-muted)",
                fontWeight: docType === "terms" ? 700 : 500,
                fontSize: "13.5px",
                boxShadow: docType === "terms" ? "0 2px 6px rgba(0, 0, 0, 0.06)" : "none",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <FileText size={15} color={docType === "terms" ? "var(--accent-violet)" : "currentColor"} />
              <span>Terms of Service</span>
            </button>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="Close legal modal"
            style={{
              background: "rgba(17, 20, 26, 0.05)",
              border: "none",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-body)",
              cursor: "pointer",
              transition: "background 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(17, 20, 26, 0.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(17, 20, 26, 0.05)")}
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div
          style={{
            padding: "36px 36px 48px 36px",
            overflowY: "auto",
            lineHeight: 1.65,
            fontSize: "14px",
            color: "var(--text-body)",
          }}
        >
          {docType === "privacy" ? (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "var(--accent-emerald)",
                    background: "rgba(16, 185, 129, 0.1)",
                    padding: "3px 10px",
                    borderRadius: "12px",
                  }}
                >
                  On-Device Guarantee
                </span>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  Effective Date: September 2026
                </span>
              </div>

              <h2
                id="legal-modal-title"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "26px",
                  fontWeight: 800,
                  color: "var(--text-ink)",
                  marginBottom: "8px",
                }}
              >
                Revia Privacy Policy
              </h2>

              <p style={{ fontSize: "15px", color: "var(--text-lead)", marginBottom: "24px" }}>
                Revia is designed around a single core conviction: <strong>Your memories stay on your computer.</strong>
              </p>

              <hr style={{ border: "none", borderTop: "1px solid var(--border-light-subtle)", margin: "24px 0" }} />

              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-ink)", marginBottom: "8px" }}>
                1. 100% On-Device Data Storage
              </h3>
              <p style={{ marginBottom: "16px" }}>
                All indexed memories, visited page text extracts, URL references, timestamps, and vector embeddings generated by Revia reside exclusively on your local storage drive:
              </p>
              <ul style={{ paddingLeft: "20px", marginBottom: "20px" }}>
                <li><strong>macOS:</strong> <code>~/Library/Application Support/com.revia.app/revia.db</code></li>
                <li><strong>Windows:</strong> <code>%APPDATA%\com.revia.app\revia.db</code></li>
              </ul>
              <p style={{ marginBottom: "20px" }}>
                Revia does not maintain cloud database clusters, central vector stores, or remote sync servers. When you query Revia, your computer matches vectors locally using embedded SQLite VSS on your CPU/GPU silicon.
              </p>

              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-ink)", marginBottom: "8px" }}>
                2. No Accounts or Identity Tracking
              </h3>
              <p style={{ marginBottom: "20px" }}>
                Revia does not require or offer user account registration. There are no logins, passwords, email collections, user profiles, or behavioral ad tracking identifiers associated with your installation.
              </p>

              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-ink)", marginBottom: "8px" }}>
                3. Telemetry and Product Analytics Disclosures
              </h3>
              <p style={{ marginBottom: "20px" }}>
                <strong>Optional product analytics are separate from your private memories.</strong> If diagnostic or crash reporting is enabled, it transmits strictly non-identifying telemetry (e.g., application version, operating system release, crash trace call stacks). Revia never includes memory contents, query strings, URLs, page titles, or vector embeddings in diagnostic telemetry.
              </p>

              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-ink)", marginBottom: "8px" }}>
                4. Data Erasure and User Control
              </h3>
              <p style={{ marginBottom: "20px" }}>
                You retain total sovereignty over your indexed data. At any time, you can trigger an instant purge from Revia Settings or directly remove the local database file. Deleting the application or database removes all stored memories immediately and irrevocably from your device.
              </p>

              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-ink)", marginBottom: "8px" }}>
                5. Regulatory Compliance (GDPR & CCPA)
              </h3>
              <p style={{ marginBottom: "20px" }}>
                Because Revia processes and stores personal browsing context strictly within your private device enclosure and never transmits it to our servers or third parties, Revia complies with the principles of privacy-by-design under the General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA).
              </p>
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "var(--accent-violet)",
                    background: "rgba(99, 102, 241, 0.1)",
                    padding: "3px 10px",
                    borderRadius: "12px",
                  }}
                >
                  Software Agreement
                </span>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  Effective Date: September 2026
                </span>
              </div>

              <h2
                id="legal-modal-title"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "26px",
                  fontWeight: 800,
                  color: "var(--text-ink)",
                  marginBottom: "8px",
                }}
              >
                Revia Terms of Service
              </h2>

              <p style={{ fontSize: "15px", color: "var(--text-lead)", marginBottom: "24px" }}>
                By downloading, installing, or using Revia, you agree to the following terms governing the software.
              </p>

              <hr style={{ border: "none", borderTop: "1px solid var(--border-light-subtle)", margin: "24px 0" }} />

              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-ink)", marginBottom: "8px" }}>
                1. License & Local Use
              </h3>
              <p style={{ marginBottom: "20px" }}>
                Revia is granted to you as a local desktop software tool for personal or internal commercial productivity. You are free to run the software on compatible macOS and Windows hardware in accordance with open local-first software principles.
              </p>

              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-ink)", marginBottom: "8px" }}>
                2. User Responsibility & Local Security
              </h3>
              <p style={{ marginBottom: "20px" }}>
                Revia executes queries and indexes memory on your local machine. You are solely responsible for managing file access permissions on your operating system, maintaining appropriate system backups, and ensuring that access to your user account is secured.
              </p>

              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-ink)", marginBottom: "8px" }}>
                3. Disclaimer of Warranty
              </h3>
              <p style={{ marginBottom: "20px" }}>
                Revia is provided &ldquo;as is&rdquo;, without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose, and noninfringement.
              </p>

              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-ink)", marginBottom: "8px" }}>
                4. Limitation of Liability
              </h3>
              <p style={{ marginBottom: "20px" }}>
                In no event shall the authors, contributors, or copyright holders be liable for any claim, damages, data loss, or other liability, whether in an action of contract, tort, or otherwise, arising from, out of, or in connection with the software or the use or other dealings in the software.
              </p>

              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-ink)", marginBottom: "8px" }}>
                5. Project Governance & Updates
              </h3>
              <p style={{ marginBottom: "20px" }}>
                Revia updates may introduce performance improvements, model weight refinements, and interface features. Source code and release notes are publicly verifiable on GitHub at <code>Samraatsharma/doclify</code>.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer Note */}
        <div
          style={{
            padding: "16px 28px",
            borderTop: "1px solid var(--border-light-subtle)",
            background: "var(--bg-ivory)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "12px",
            color: "var(--text-muted)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Lock size={13} color="var(--accent-emerald)" />
            <span>Open, verifiable local architecture</span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "var(--text-ink)",
              color: "#ffffff",
              border: "none",
              padding: "6px 16px",
              borderRadius: "8px",
              fontSize: "12.5px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
