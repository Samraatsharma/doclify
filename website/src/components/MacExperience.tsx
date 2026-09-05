import React from "react";
import { Cpu, Zap, Battery, Layers, ShieldCheck } from "lucide-react";
import { CONFIG } from "../config";

export const MacExperience: React.FC = () => {
  return (
    <section
      id="mac"
      style={{
        padding: "110px 0 120px 0",
        backgroundColor: "var(--bg-canvas)",
        position: "relative",
        overflow: "hidden",
      }}
      className="texture-dots-subtle"
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
            09 // Mac Native Architecture
          </span>
        </div>

        {/* Narrative Headline */}
        <div style={{ textAlign: "center", maxWidth: "860px", margin: "0 auto 52px auto" }}>
          <h2 className="headline-editorial" style={{ marginBottom: "20px" }}>
            Engineered for Apple Silicon.
            <br />
            <span className="serif-italic" style={{ color: "var(--text-lead)" }}>Not a bloated 800MB Electron wrapper.</span>
          </h2>

          <p className="lead-paragraph" style={{ maxWidth: "660px", margin: "0 auto" }}>
            Revia is written in Rust and native macOS Cocoa APIs. It operates with the lightweight efficiency of a classic Mac desk accessory.
          </p>
        </div>

        {/* ====================================================================
            FOUR PILLARS OF NATIVE PERFORMANCE
            ==================================================================== */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "20px",
            marginBottom: "48px",
          }}
          className="mac-pillars-grid"
        >
          {/* Pillar 1 */}
          <div className="card-light-editorial" style={{ padding: "28px 24px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
              <Zap size={18} color="#6366f1" />
            </div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-ink)", fontFamily: "var(--font-display)", marginBottom: "4px" }}>
              &lt; 55 MB
            </div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-lead)", marginBottom: "8px" }}>
              Idle Memory Footprint
            </div>
            <div style={{ fontSize: "12.5px", color: "var(--text-muted)", lineHeight: 1.5 }}>
              Runs invisibly in your menu bar without stealing RAM from Xcode, Docker, or your active browser tabs.
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="card-light-editorial" style={{ padding: "28px 24px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
              <Cpu size={18} color="#10b981" />
            </div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-ink)", fontFamily: "var(--font-display)", marginBottom: "4px" }}>
              {CONFIG.zipSize}
            </div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-lead)", marginBottom: "8px" }}>
              Compact Direct ZIP
            </div>
            <div style={{ fontSize: "12.5px", color: "var(--text-muted)", lineHeight: 1.5 }}>
              Compiled with Rust and Tauri v2 directly for Apple Silicon (M1/M2/M3/M4). Unzips directly into Revia.app.
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="card-light-editorial" style={{ padding: "28px 24px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
              <Battery size={18} color="#d97706" />
            </div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-ink)", fontFamily: "var(--font-display)", marginBottom: "4px" }}>
              0.02%
            </div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-lead)", marginBottom: "8px" }}>
              Idle CPU Impact
            </div>
            <div style={{ fontSize: "12.5px", color: "var(--text-muted)", lineHeight: 1.5 }}>
              Zero battery drain on MacBook Air and Pro. Background event loops sleep until keycodes 59/62 are registered.
            </div>
          </div>

          {/* Pillar 4 */}
          <div className="card-light-editorial" style={{ padding: "28px 24px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#fdf4ff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
              <Layers size={18} color="#a855f7" />
            </div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-ink)", fontFamily: "var(--font-display)", marginBottom: "4px" }}>
              Top-Right
            </div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-lead)", marginBottom: "8px" }}>
              420px × 52px Capsule
            </div>
            <div style={{ fontSize: "12.5px", color: "var(--text-muted)", lineHeight: 1.5 }}>
              Positioned automatically on the active display. Dismisses on ESC or click outside without quitting.
            </div>
          </div>
        </div>

        {/* Native Menu Bar Callout Card */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid var(--border-light-medium)",
            borderRadius: "20px",
            padding: "24px 28px",
            boxShadow: "var(--shadow-sm)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "radial-gradient(circle at 35% 30%, #ffffff 0%, #c7d2fe 60%, #6366f1 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#ffffff" }} />
            </div>
            <div>
              <div style={{ fontSize: "14.5px", fontWeight: 700, color: "var(--text-ink)" }}>
                macOS Status Item & System Tray Integration
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                Right-click the menu bar icon anytime to open Settings, pause indexing, re-scan Chrome history, or quit.
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", fontFamily: "var(--font-mono)", color: "#059669" }}>
            <ShieldCheck size={16} />
            <span>macOS 12.0 Monterey through macOS 15 Sequoia</span>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .mac-pillars-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 580px) {
          .mac-pillars-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
};
