import React, { useState } from "react";
import { CONFIG, getVisitorPlatform } from "../config";
import { Download, Copy, Check, Terminal, ShieldAlert, Monitor, Apple } from "lucide-react";

export const DownloadSection: React.FC = () => {
  const visitor = getVisitorPlatform();
  const [activePlatform, setActivePlatform] = useState<"mac" | "windows">(
    visitor.isMac ? "mac" : "windows"
  );
  const [copiedSha, setCopiedSha] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  const activeDownloadUrl =
    activePlatform === "mac" ? CONFIG.releaseDownloadUrl : (CONFIG.windowsDownloadUrl || "/downloads/Revia_Windows_x64.zip");
  const activeFilename =
    activePlatform === "mac" ? CONFIG.zipFilename : (CONFIG.windowsFilename || "Revia_Windows_x64.zip");
  const activeSha256 =
    activePlatform === "mac" ? CONFIG.zipSha256 : (CONFIG.windowsSha256 || "");
  const activeSize =
    activePlatform === "mac" ? CONFIG.zipSize : (CONFIG.windowsSize || "12.6 MB");

  const curlCommand = `curl -O https://revia.app${activeDownloadUrl}`;

  const copyToClipboard = (text: string, type: "sha" | "curl") => {
    navigator.clipboard.writeText(text);
    if (type === "sha") {
      setCopiedSha(true);
      setTimeout(() => setCopiedSha(false), 2000);
    } else {
      setCopiedCurl(true);
      setTimeout(() => setCopiedCurl(false), 2000);
    }
  };

  return (
    <section
      id="download"
      style={{
        padding: "120px 0 130px 0",
        backgroundColor: "var(--bg-linen)",
        position: "relative",
        borderTop: "1px solid var(--border-light-medium)",
        overflow: "hidden",
      }}
      className="texture-grid-subtle"
    >
      <div className="container" style={{ maxWidth: "920px" }}>
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
            10 // Free Beta Distribution
          </span>
        </div>

        {/* Narrative Headline */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h2 className="headline-editorial" style={{ marginBottom: "18px" }}>
            Give your computer a memory.
          </h2>
          <p className="lead-paragraph" style={{ maxWidth: "620px", margin: "0 auto" }}>
            Download Revia v1.5. Available for macOS Apple Silicon and Windows x64. Completely free during the public beta with zero tracking or registration.
          </p>
        </div>

        {/* Platform Selector Switcher */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            marginBottom: "32px",
          }}
        >
          <button
            onClick={() => setActivePlatform("mac")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 22px",
              borderRadius: "14px",
              border: activePlatform === "mac" ? "1.5px solid var(--text-ink)" : "1px solid var(--border-light-strong)",
              background: activePlatform === "mac" ? "var(--text-ink)" : "#ffffff",
              color: activePlatform === "mac" ? "#ffffff" : "var(--text-body)",
              fontWeight: 600,
              fontSize: "14px",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <Apple size={16} />
            <span>macOS (Apple Silicon)</span>
          </button>

          <button
            onClick={() => setActivePlatform("windows")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 22px",
              borderRadius: "14px",
              border: activePlatform === "windows" ? "1.5px solid var(--text-ink)" : "1px solid var(--border-light-strong)",
              background: activePlatform === "windows" ? "var(--text-ink)" : "#ffffff",
              color: activePlatform === "windows" ? "#ffffff" : "var(--text-body)",
              fontWeight: 600,
              fontSize: "14px",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <Monitor size={16} />
            <span>Windows (x64 Beta)</span>
          </button>
        </div>

        {/* ====================================================================
            PRIMARY DOWNLOAD CARD
            ==================================================================== */}
        <div
          style={{
            background: "#ffffff",
            border: "1.5px solid var(--border-light-strong)",
            borderRadius: "24px",
            padding: "48px 36px",
            boxShadow: "var(--shadow-xl)",
            textAlign: "center",
            position: "relative",
            marginBottom: "36px",
          }}
          className="specular-top-light"
        >
          {/* Primary Action Button */}
          <div style={{ marginBottom: "20px" }}>
            <a
              href={activeDownloadUrl}
              download={activeFilename}
              className="btn-dark"
              style={{
                fontSize: "17px",
                padding: "16px 36px",
                borderRadius: "14px",
                boxShadow: "0 10px 30px rgba(17, 20, 26, 0.25)",
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <Download size={20} />
              <span>
                {activePlatform === "mac" ? "Download Revia for Mac" : "Download Revia for Windows"}
              </span>
            </a>
          </div>

          {/* Quick Alternate Download Link */}
          <div style={{ marginBottom: "24px", fontSize: "13px", color: "var(--text-muted)" }}>
            Looking for the other platform?{" "}
            <a
              href={activePlatform === "mac" ? CONFIG.windowsDownloadUrl : CONFIG.releaseDownloadUrl}
              download={activePlatform === "mac" ? CONFIG.windowsFilename : CONFIG.zipFilename}
              style={{ color: "var(--accent-violet)", fontWeight: 600, textDecoration: "underline" }}
            >
              {activePlatform === "mac" ? "Download for Windows (x64)" : "Download for macOS (Apple Silicon)"}
            </a>
          </div>

          <div
            style={{
              fontSize: "12.5px",
              fontFamily: "var(--font-mono)",
              color: "var(--text-muted)",
              marginBottom: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            <span>v{CONFIG.version} Beta</span>
            <span>·</span>
            <span>{activePlatform === "mac" ? "Apple Silicon (M1/M2/M3/M4, aarch64)" : "Windows 10 / 11 (x64, 64-bit)"}</span>
            <span>·</span>
            <span>{activeSize}</span>
            <span>·</span>
            <span>Direct ZIP ({activePlatform === "mac" ? "Revia.app inside" : "Revia.exe inside"})</span>
          </div>

          {/* SHA-256 Checksum Box */}
          <div
            style={{
              background: "var(--bg-ivory)",
              border: "1px solid var(--border-light-medium)",
              borderRadius: "14px",
              padding: "16px 20px",
              textAlign: "left",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              marginBottom: "28px",
            }}
          >
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "4px" }}>
                SHA-256 Verification Checksum ({activeFilename})
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                  color: "var(--text-ink)",
                  fontWeight: 600,
                  wordBreak: "break-all",
                }}
              >
                {activeSha256}
              </div>
            </div>

            <button
              onClick={() => copyToClipboard(activeSha256, "sha")}
              style={{
                background: "#ffffff",
                border: "1px solid var(--border-light-medium)",
                borderRadius: "8px",
                padding: "8px 14px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--text-lead)",
                cursor: "pointer",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {copiedSha ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
              <span>{copiedSha ? "Copied" : "Copy"}</span>
            </button>
          </div>

          {/* Curl Terminal Box */}
          <div
            style={{
              background: "#0c0f16",
              borderRadius: "14px",
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              textAlign: "left",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", overflow: "hidden" }}>
              <Terminal size={14} color="#38bdf8" />
              <code style={{ fontSize: "12px", fontFamily: "var(--font-mono)", color: "#e2e8f0", whiteSpace: "nowrap" }}>
                {curlCommand}
              </code>
            </div>

            <button
              onClick={() => copyToClipboard(curlCommand, "curl")}
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                border: "none",
                borderRadius: "6px",
                padding: "6px 12px",
                fontSize: "11px",
                fontFamily: "var(--font-mono)",
                color: "#ffffff",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {copiedCurl ? "Copied" : "Copy curl"}
            </button>
          </div>
        </div>

        {/* ====================================================================
            HONEST INSTALLATION & SECURITY GUIDANCE
            ==================================================================== */}
        {activePlatform === "mac" ? (
          <div
            style={{
              background: "#ffffff",
              border: "1px solid var(--border-light-medium)",
              borderRadius: "18px",
              padding: "24px 28px",
              display: "flex",
              alignItems: "flex-start",
              gap: "16px",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div style={{ padding: "8px", borderRadius: "10px", background: "#fef3c7", color: "#d97706", flexShrink: 0 }}>
              <ShieldAlert size={20} />
            </div>

            <div style={{ fontSize: "13px", lineHeight: 1.6, color: "var(--text-body)" }}>
              <strong style={{ color: "var(--text-ink)", display: "block", marginBottom: "4px" }}>
                Free Beta for Apple Silicon
              </strong>
              macOS may ask you to approve Revia the first time you open it because this beta is not yet notarized by Apple.
              <div style={{ marginTop: "10px" }}>
                <span style={{ fontWeight: 600, color: "var(--text-ink)" }}>If macOS blocks Revia:</span>
                <ol style={{ paddingLeft: "18px", marginTop: "4px", marginBottom: "8px" }}>
                  <li>Open Revia once.</li>
                  <li>Open <strong>System Settings → Privacy & Security</strong>.</li>
                  <li>Scroll down to find the message about Revia.</li>
                  <li>Choose <strong>Open Anyway</strong>.</li>
                  <li>Open Revia again.</li>
                </ol>
                <em>Alternatively:</em> In Finder, right-click (or Control-click) <strong>Revia.app</strong>, choose <strong>Open</strong>, and click <strong>Open</strong>.
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              background: "#ffffff",
              border: "1px solid var(--border-light-medium)",
              borderRadius: "18px",
              padding: "24px 28px",
              display: "flex",
              alignItems: "flex-start",
              gap: "16px",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div style={{ padding: "8px", borderRadius: "10px", background: "#eff6ff", color: "#2563eb", flexShrink: 0 }}>
              <ShieldAlert size={20} />
            </div>

            <div style={{ fontSize: "13px", lineHeight: 1.6, color: "var(--text-body)" }}>
              <strong style={{ color: "var(--text-ink)", display: "block", marginBottom: "4px" }}>
                Free Windows Beta Instructions
              </strong>
              <ol style={{ paddingLeft: "18px", marginTop: "8px", marginBottom: "8px" }}>
                <li>Download Revia for Windows (ZIP).</li>
                <li>Extract <strong>Revia_Windows_x64.zip</strong> to your preferred folder.</li>
                <li>Open <strong>Revia.exe</strong>.</li>
                <li>Complete the quick first-run setup.</li>
                <li>
                  If Windows displays a standard SmartScreen warning, review it and choose <strong>More info → Run anyway</strong> if you trust the beta source.
                </li>
              </ol>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "6px" }}>
                Default shortcut on Windows: <strong>Alt + Space</strong>. You can customize this or summon Revia from the system tray.
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
