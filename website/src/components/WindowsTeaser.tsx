import React, { useState } from "react";
import { Monitor, Bell, Check, Download } from "lucide-react";
import { CONFIG } from "../config";

export const WindowsTeaser: React.FC = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
    }
  };

  return (
    <section
      style={{
        padding: "80px 0 90px 0",
        backgroundColor: "var(--bg-canvas)",
        borderTop: "1px solid var(--border-light-subtle)",
        position: "relative",
      }}
    >
      <div className="container" style={{ maxWidth: "760px", textAlign: "center" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "4px 12px",
            borderRadius: "20px",
            background: "rgba(17, 20, 26, 0.04)",
            border: "1px solid var(--border-light-medium)",
            fontSize: "12px",
            fontFamily: "var(--font-mono)",
            color: "var(--text-muted)",
            marginBottom: "16px",
          }}
        >
          <Monitor size={14} />
          <span>Windows Beta Release</span>
        </div>

        <h3
          style={{
            fontSize: "26px",
            fontWeight: 700,
            color: "var(--text-ink)",
            marginBottom: "12px",
          }}
        >
          Revia for Windows is live.
        </h3>

        <p style={{ fontSize: "15px", color: "var(--text-body)", lineHeight: 1.5, marginBottom: "28px" }}>
          Experience Revia's on-device memory on Windows 10 & 11 (64-bit). Fast local SQLite FTS5 index, background tray assistant, and Alt+Space instant summon.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: "14px", flexWrap: "wrap", marginBottom: "32px" }}>
          <a
            href={CONFIG.windowsDownloadUrl || "/downloads/Revia_Windows_x64.zip"}
            download={CONFIG.windowsFilename || "Revia_Windows_x64.zip"}
            className="btn-dark"
            style={{
              padding: "12px 26px",
              fontSize: "14px",
              borderRadius: "12px",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Download size={16} />
            <span>Download Windows Beta ({CONFIG.windowsSize || "12.6 MB"})</span>
          </a>

          <a
            href="#download"
            style={{
              padding: "12px 22px",
              fontSize: "14px",
              borderRadius: "12px",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "#ffffff",
              border: "1px solid var(--border-light-strong)",
              color: "var(--text-lead)",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            <span>View Checksum & Instructions</span>
          </a>
        </div>

        <div style={{ fontSize: "12.5px", color: "var(--text-muted)", marginBottom: "12px" }}>
          Want updates for Windows ARM64 (Copilot+ PCs)?
        </div>

        {subscribed ? (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              background: "#ecfdf5",
              border: "1px solid #a7f3d0",
              borderRadius: "12px",
              color: "#065f46",
              fontSize: "13.5px",
              fontWeight: 600,
            }}
          >
            <Check size={16} />
            <span>You're on the list! We'll notify you when ARM64 builds are available.</span>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              maxWidth: "420px",
              margin: "0 auto",
              flexWrap: "wrap",
            }}
          >
            <input
              type="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                flex: 1,
                minWidth: "220px",
                padding: "9px 14px",
                borderRadius: "10px",
                border: "1px solid var(--border-light-strong)",
                background: "#ffffff",
                fontSize: "13.5px",
                outline: "none",
                fontFamily: "var(--font-body)",
              }}
            />
            <button
              type="submit"
              className="btn-secondary"
              style={{
                padding: "9px 18px",
                fontSize: "13px",
                borderRadius: "10px",
                background: "#ffffff",
                border: "1px solid var(--border-light-strong)",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontWeight: 600,
              }}
            >
              <Bell size={13} />
              <span>Notify Me</span>
            </button>
          </form>
        )}
      </div>
    </section>
  );
};
