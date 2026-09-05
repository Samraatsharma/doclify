import React, { useState, useEffect } from "react";
import { ReviaMemoryCore } from "./ReviaMemoryCore";
import { CONFIG } from "../config";
import { Download, Sparkles, ExternalLink, CornerDownLeft } from "lucide-react";

interface HeroProps {
  onOpenTryRevia: () => void;
  onExploreStory: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenTryRevia, onExploreStory }) => {
  // Choreographed 10-second product demonstration lifecycle
  // 0: quiet desktop (0-2s)
  // 1: shortcut summon (2-3s)
  // 2: typing query (3-5.5s)
  // 3: searching vector index (5.5-6.5s)
  // 4: memory result surfaces (6.5-8.5s)
  // 5: result focused & opened (8.5-10s)
  const [demoPhase, setDemoPhase] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);
  const [typedCount, setTypedCount] = useState(0);

  const demoQuery = "that github issue about the auth cookie bug last week";

  useEffect(() => {
    let timer: any;
    let active = true;

    const runDemoLoop = async () => {
      // Phase 0: Desktop quiet
      setDemoPhase(0);
      setTypedCount(0);
      await new Promise((r) => (timer = setTimeout(r, 1800)));
      if (!active) return;

      // Phase 1: Shortcut trigger
      setDemoPhase(1);
      await new Promise((r) => (timer = setTimeout(r, 900)));
      if (!active) return;

      // Phase 2: Typing query
      setDemoPhase(2);
      for (let i = 1; i <= demoQuery.length; i++) {
        if (!active) return;
        setTypedCount(i);
        await new Promise((r) => (timer = setTimeout(r, 38)));
      }
      await new Promise((r) => (timer = setTimeout(r, 450)));
      if (!active) return;

      // Phase 3: Searching
      setDemoPhase(3);
      await new Promise((r) => (timer = setTimeout(r, 1100)));
      if (!active) return;

      // Phase 4: Result surfaces
      setDemoPhase(4);
      await new Promise((r) => (timer = setTimeout(r, 2000)));
      if (!active) return;

      // Phase 5: Focused / Return
      setDemoPhase(5);
      await new Promise((r) => (timer = setTimeout(r, 2000)));
      if (!active) return;

      runDemoLoop();
    };

    runDemoLoop();

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, []);

  return (
    <section
      style={{
        position: "relative",
        paddingTop: "140px",
        paddingBottom: "80px",
        backgroundColor: "var(--bg-canvas)",
        overflow: "hidden",
      }}
      className="texture-grid-subtle"
    >
      <div className="container">
        {/* Editorial Pill */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "26px" }}>
          <div
            onClick={onExploreStory}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "5px 14px",
              borderRadius: "20px",
              background: "#ffffff",
              border: "1px solid var(--border-light-medium)",
              boxShadow: "var(--shadow-sm)",
              fontSize: "12px",
              fontFamily: "var(--font-mono)",
              color: "var(--text-ink)",
              cursor: "pointer",
            }}
          >
            <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981" }} />
            <span style={{ fontWeight: 700 }}>REVIA 1.5</span>
            <span style={{ color: "var(--border-light-strong)" }}>|</span>
            <span style={{ color: "var(--text-body)" }}>Private Local Memory for Mac</span>
          </div>
        </div>

        {/* Large Editorial Headline */}
        <div style={{ textAlign: "center", maxWidth: "900px", margin: "0 auto 36px auto" }}>
          <h1 className="headline-hero" style={{ marginBottom: "22px" }}>
            Your computer remembers.
            <br />
            <span className="serif-italic" style={{ color: "var(--text-lead)" }}>You don’t have to.</span>
          </h1>

          <p className="lead-paragraph" style={{ maxWidth: "680px", margin: "0 auto 34px auto" }}>
            Revia is a private, ambient memory assistant for Mac. Find that article, pull request, PDF, or discussion you saw days ago — even when you can’t recall where you saw it.
          </p>

          {/* Action CTAs */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "14px", flexWrap: "wrap" }}>
            <a
              href={CONFIG.releaseDownloadUrl}
              download={CONFIG.zipFilename}
              className="btn-dark"
            >
              <Download size={16} />
              <span>Download for Mac</span>
            </a>

            <button
              onClick={onOpenTryRevia}
              className="btn-light"
            >
              <Sparkles size={15} color="#6366f1" />
              <span>Try Interactive Simulator</span>
            </button>
          </div>

          <div
            style={{
              marginTop: "16px",
              fontSize: "12px",
              fontFamily: "var(--font-mono)",
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            <span>Apple Silicon (M1/M2/M3/M4)</span>
            <span>·</span>
            <span>Free Direct ZIP ({CONFIG.zipSize})</span>
            <span>·</span>
            <span>100% Local Execution</span>
          </div>
        </div>

        {/* ====================================================================
            HERO DUAL SHOWCASE: REVIA MEMORY CORE + AUTHENTIC PRODUCT DEMO
            ==================================================================== */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.15fr",
            gap: "36px",
            alignItems: "center",
            marginTop: "48px",
            maxWidth: "1140px",
            margin: "48px auto 0 auto",
          }}
          className="hero-grid"
        >
          {/* Left Column: Revia Memory Core Object */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid var(--border-light-subtle)",
              borderRadius: "24px",
              padding: "36px 24px",
              boxShadow: "var(--shadow-md)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              minHeight: "440px",
            }}
            className="specular-top-light"
          >
            {/* Technical Sub-badge */}
            <div
              style={{
                position: "absolute",
                top: "16px",
                left: "20px",
                fontSize: "11px",
                fontFamily: "var(--font-mono)",
                color: "var(--text-whisper)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              REVIA // CORE OBJECT
            </div>

            <ReviaMemoryCore
              size={320}
              interactive={true}
              state={demoPhase === 3 ? "searching" : "ambient"}
            />

            <div
              style={{
                marginTop: "16px",
                textAlign: "center",
                fontFamily: "var(--font-mono)",
                fontSize: "11.5px",
                color: "var(--text-muted)",
              }}
            >
              {demoPhase === 3 ? (
                <span style={{ color: "#0284c7", fontWeight: 600 }}>• Neural vector similarity matching active...</span>
              ) : (
                <span>Hover to perturb memory field · Gyroscopic inertial tracking</span>
              )}
            </div>
          </div>

          {/* Right Column: Authentic Mac Screen Simulation (420x52 Capsule Top-Right) */}
          <div
            style={{
              background: "linear-gradient(180deg, #181c26 0%, #0d1017 100%)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "24px",
              boxShadow: "0 28px 70px rgba(17, 20, 26, 0.25), 0 2px 8px rgba(0, 0, 0, 0.15)",
              overflow: "hidden",
              minHeight: "440px",
              display: "flex",
              flexDirection: "column",
              position: "relative",
            }}
            className="specular-top-dark"
          >
            {/* Simulated macOS Menu Bar */}
            <div
              style={{
                height: "32px",
                background: "rgba(255, 255, 255, 0.04)",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 16px",
                fontSize: "11.5px",
                color: "rgba(255, 255, 255, 0.55)",
                fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <span style={{ color: "#ffffff", fontWeight: 700 }}></span>
                <span style={{ color: "#ffffff", fontWeight: 600 }}>Finder</span>
                <span>File</span>
                <span>Edit</span>
                <span>View</span>
                <span>Window</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {/* Active Revia Menu Bar Icon */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    background: demoPhase >= 1 ? "rgba(99, 102, 241, 0.28)" : "transparent",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    color: demoPhase >= 1 ? "#c7d2fe" : "rgba(255, 255, 255, 0.6)",
                  }}
                >
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#818cf8" }} />
                  <span style={{ fontSize: "10.5px", fontWeight: 600 }}>Revia</span>
                </div>
                <span>Thu 18:42</span>
              </div>
            </div>

            {/* Desktop Wallpaper Body */}
            <div
              style={{
                flex: 1,
                padding: "24px",
                position: "relative",
                background: "radial-gradient(ellipse at 80% 20%, rgba(99, 102, 241, 0.12) 0%, transparent 60%)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              {/* Shortcut Trigger HUD (Top Center) */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  opacity: demoPhase === 1 ? 1 : 0.4,
                  transition: "opacity 0.2s ease",
                }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "rgba(255, 255, 255, 0.06)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "8px",
                    padding: "4px 10px",
                    fontSize: "11px",
                    fontFamily: "var(--font-mono)",
                    color: demoPhase === 1 ? "#38bdf8" : "rgba(255, 255, 255, 0.5)",
                  }}
                >
                  <span style={{ background: "rgba(255, 255, 255, 0.12)", padding: "2px 5px", borderRadius: "4px" }}>⌃</span>
                  <span style={{ background: "rgba(255, 255, 255, 0.12)", padding: "2px 5px", borderRadius: "4px" }}>⌃</span>
                  <span>Double-Tap Control</span>
                </div>
              </div>

              {/* =======================================================
                  THE ACTUAL COMPACT REVIA CAPSULE (TOP-RIGHT DISPLAYED)
                  ======================================================= */}
              <div
                style={{
                  position: "absolute",
                  top: "24px",
                  right: "24px",
                  width: "420px",
                  maxWidth: "calc(100% - 48px)",
                  zIndex: 20,
                  opacity: demoPhase >= 1 ? 1 : 0,
                  transform: demoPhase >= 1 ? "translateY(0)" : "translateY(-12px)",
                  transition: "all 0.28s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                {/* Horizontal 52px Capsule */}
                <div
                  style={{
                    height: "52px",
                    background: "rgba(15, 20, 30, 0.95)",
                    border: "1px solid rgba(255, 255, 255, 0.16)",
                    borderRadius: "26px",
                    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(99, 102, 241, 0.2)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    display: "flex",
                    alignItems: "center",
                    padding: "0 14px",
                    gap: "12px",
                  }}
                >
                  {/* Miniature Animated Core */}
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      background: "radial-gradient(circle at 35% 30%, #ffffff 0%, #c7d2fe 60%, #6366f1 100%)",
                      boxShadow: "0 0 12px rgba(99, 102, 241, 0.5)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ffffff" }} />
                  </div>

                  {/* Search Query Text Input */}
                  <div
                    style={{
                      flex: 1,
                      fontFamily: "var(--font-body)",
                      fontSize: "13.5px",
                      color: "#ffffff",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {demoPhase === 1 ? (
                      <span style={{ color: "rgba(255, 255, 255, 0.35)" }}>What do you remember?</span>
                    ) : (
                      <span>{demoQuery.slice(0, typedCount)}</span>
                    )}
                    {demoPhase === 2 && (
                      <span style={{ borderRight: "2px solid #38bdf8", marginLeft: "2px", animation: "waveBar 0.8s infinite" }} />
                    )}
                  </div>

                  {/* Searching Indicator or Return Key */}
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                    {demoPhase === 3 ? (
                      <div
                        style={{
                          fontSize: "11px",
                          fontFamily: "var(--font-mono)",
                          color: "#38bdf8",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#38bdf8", animation: "breathingPulse 1s infinite" }} />
                        <span>Vector match</span>
                      </div>
                    ) : (
                      <div
                        style={{
                          padding: "3px 6px",
                          borderRadius: "6px",
                          background: "rgba(255, 255, 255, 0.08)",
                          color: "rgba(255, 255, 255, 0.4)",
                          fontSize: "10.5px",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        <CornerDownLeft size={12} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Result Card Dropping Down (Phases 4 & 5) */}
                {demoPhase >= 4 && (
                  <div
                    style={{
                      marginTop: "8px",
                      background: demoPhase === 5 ? "rgba(22, 29, 44, 0.98)" : "rgba(16, 21, 32, 0.95)",
                      border: demoPhase === 5 ? "1px solid #6366f1" : "1px solid rgba(255, 255, 255, 0.12)",
                      borderRadius: "16px",
                      padding: "14px 16px",
                      boxShadow: "0 14px 36px rgba(0, 0, 0, 0.5)",
                      animation: "fadeIn 0.25s ease forwards",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "#818cf8", fontWeight: 600 }}>github.com</span>
                        <span style={{ color: "rgba(255, 255, 255, 0.2)" }}>·</span>
                        <span style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.45)" }}>3 days ago</span>
                      </div>

                      <div
                        style={{
                          fontSize: "10.5px",
                          fontFamily: "var(--font-mono)",
                          color: "#10b981",
                          background: "rgba(16, 185, 129, 0.15)",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          fontWeight: 600,
                        }}
                      >
                        98.4% Match
                      </div>
                    </div>

                    <div style={{ fontWeight: 600, fontSize: "13px", color: "#ffffff", marginBottom: "4px" }}>
                      Issue #412: Auth cookie partitioned attribute in Chrome 128
                    </div>

                    <div style={{ fontSize: "11.5px", color: "rgba(255, 255, 255, 0.6)", lineHeight: 1.4 }}>
                      “...explaining the difference between CHIPS cookies and standard SameSite=Lax credentials during cross-origin auth flows...”
                    </div>

                    {demoPhase === 5 && (
                      <div
                        style={{
                          marginTop: "10px",
                          paddingTop: "8px",
                          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          fontSize: "11px",
                          color: "#38bdf8",
                        }}
                      >
                        <span>Opening in default browser...</span>
                        <ExternalLink size={12} />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* In-scene Explanation Label */}
              <div
                style={{
                  background: "rgba(0, 0, 0, 0.4)",
                  backdropFilter: "blur(8px)",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  maxWidth: "260px",
                  fontSize: "11.5px",
                  color: "rgba(255, 255, 255, 0.65)",
                  lineHeight: 1.45,
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                }}
              >
                <div style={{ color: "#ffffff", fontWeight: 600, marginBottom: "2px" }}>Ambient Top-Right Capsule</div>
                Invoked by physical ⌃ ⌃ from any app. Automatically hides on ESC without disrupting workflow.
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
};
