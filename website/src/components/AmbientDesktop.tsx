import React, { useState } from "react";
import { Terminal, Code, Globe, X } from "lucide-react";

export const AmbientDesktop: React.FC = () => {
  const [activeApp, setActiveApp] = useState<"vscode" | "chrome" | "terminal">("vscode");
  const [capsuleVisible, setCapsuleVisible] = useState(true);

  return (
    <section
      id="ambient"
      style={{
        padding: "110px 0 120px 0",
        backgroundColor: "var(--bg-ivory)",
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
            06 // Ambient Intelligence
          </span>
        </div>

        {/* Narrative Headline */}
        <div style={{ textAlign: "center", maxWidth: "860px", margin: "0 auto 52px auto" }}>
          <h2 className="headline-editorial" style={{ marginBottom: "20px" }}>
            Stay where you are.
            <br />
            <span className="serif-italic" style={{ color: "var(--text-lead)" }}>You don’t switch into Revia. Revia comes to you.</span>
          </h2>

          <p className="lead-paragraph" style={{ maxWidth: "660px", margin: "0 auto" }}>
            Revia is not another heavy electron app you must Cmd+Tab into. It floats as an ambient 52px system capsule directly in the corner of your active screen, answers your thought, and dissolves.
          </p>
        </div>

        {/* App Switcher Pills (Demonstrating multi-app stability) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            marginBottom: "32px",
          }}
        >
          <button
            onClick={() => setActiveApp("vscode")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 16px",
              borderRadius: "10px",
              background: activeApp === "vscode" ? "var(--text-ink)" : "#ffffff",
              color: activeApp === "vscode" ? "#ffffff" : "var(--text-lead)",
              border: activeApp === "vscode" ? "1px solid var(--text-ink)" : "1px solid var(--border-light-medium)",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <Code size={14} />
            <span>Working in VS Code</span>
          </button>

          <button
            onClick={() => setActiveApp("chrome")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 16px",
              borderRadius: "10px",
              background: activeApp === "chrome" ? "var(--text-ink)" : "#ffffff",
              color: activeApp === "chrome" ? "#ffffff" : "var(--text-lead)",
              border: activeApp === "chrome" ? "1px solid var(--text-ink)" : "1px solid var(--border-light-medium)",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <Globe size={14} />
            <span>Browsing in Chrome</span>
          </button>

          <button
            onClick={() => setActiveApp("terminal")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 16px",
              borderRadius: "10px",
              background: activeApp === "terminal" ? "var(--text-ink)" : "#ffffff",
              color: activeApp === "terminal" ? "#ffffff" : "var(--text-lead)",
              border: activeApp === "terminal" ? "1px solid var(--text-ink)" : "1px solid var(--border-light-medium)",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <Terminal size={14} />
            <span>Terminal Shell</span>
          </button>
        </div>

        {/* ====================================================================
            SIMULATED DESKTOP WORKSPACE WITH TOP-RIGHT REVIA CAPSULE
            ==================================================================== */}
        <div
          style={{
            maxWidth: "1080px",
            margin: "0 auto",
            background: "#0c0f17",
            borderRadius: "24px",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            boxShadow: "0 30px 80px rgba(17, 20, 26, 0.25)",
            overflow: "hidden",
            position: "relative",
            minHeight: "480px",
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
              padding: "0 18px",
              fontSize: "11.5px",
              color: "rgba(255, 255, 255, 0.6)",
              fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <span style={{ color: "#ffffff", fontWeight: 700 }}></span>
              <span style={{ color: "#ffffff", fontWeight: 600 }}>
                {activeApp === "vscode" ? "Code" : activeApp === "chrome" ? "Chrome" : "Terminal"}
              </span>
              <span>File</span>
              <span>Edit</span>
              <span>Selection</span>
              <span>View</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  background: "rgba(99, 102, 241, 0.25)",
                  padding: "2px 7px",
                  borderRadius: "4px",
                  color: "#c7d2fe",
                }}
              >
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#818cf8" }} />
                <span style={{ fontSize: "10.5px", fontWeight: 600 }}>Revia</span>
              </div>
              <span>100%</span>
              <span>18:44</span>
            </div>
          </div>

          {/* Desktop Content Canvas */}
          <div
            style={{
              padding: "28px",
              minHeight: "440px",
              position: "relative",
              background: "radial-gradient(ellipse at 75% 15%, rgba(99, 102, 241, 0.1) 0%, transparent 60%)",
            }}
          >
            {/* Active Underlying Application Mockup */}
            <div
              style={{
                width: "68%",
                background: "#161b26",
                borderRadius: "14px",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                overflow: "hidden",
                boxShadow: "0 20px 50px rgba(0, 0, 0, 0.4)",
              }}
            >
              {/* App Window Title Bar */}
              <div
                style={{
                  height: "36px",
                  background: "rgba(255, 255, 255, 0.03)",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
                  display: "flex",
                  alignItems: "center",
                  padding: "0 14px",
                  gap: "8px",
                }}
              >
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ef4444" }} />
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#f59e0b" }} />
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#10b981" }} />
                <div style={{ marginLeft: "12px", fontSize: "11px", color: "rgba(255, 255, 255, 0.4)", fontFamily: "var(--font-mono)" }}>
                  {activeApp === "vscode" ? "revia/src-tauri/src/modifier_tap.rs — Code" : activeApp === "chrome" ? "GitHub Pull Requests · Chrome (24 tabs)" : "zsh — 80x24"}
                </div>
              </div>

              {/* Code / App Content */}
              <div style={{ padding: "20px", fontFamily: "var(--font-mono)", fontSize: "12px", color: "#94a3b8", lineHeight: 1.6 }}>
                {activeApp === "vscode" && (
                  <div>
                    <div style={{ color: "#6366f1" }}>// Physical keycode 59 (Left Control) and 62 (Right Control)</div>
                    <div><span style={{ color: "#f43f5e" }}>fn</span> <span style={{ color: "#38bdf8" }}>detect_double_tap</span>(keycode: u16) -&gt; <span style={{ color: "#38bdf8" }}>bool</span> &#123;</div>
                    <div style={{ paddingLeft: "20px" }}>let diff = now.duration_since(last_press);</div>
                    <div style={{ paddingLeft: "20px" }}><span style={{ color: "#f43f5e" }}>if</span> diff &gt;= Duration::from_millis(50) && diff &lt;= Duration::from_millis(550) &#123;</div>
                    <div style={{ paddingLeft: "40px", color: "#10b981" }}>summon_ambient_capsule();</div>
                    <div style={{ paddingLeft: "20px" }}>&#125;</div>
                    <div>&#125;</div>
                  </div>
                )}
                {activeApp === "chrome" && (
                  <div>
                    <div style={{ color: "#38bdf8", fontWeight: 700, fontSize: "14px", marginBottom: "8px" }}>Pull Request #412: Cookie CHIPS SameSite Fix</div>
                    <div>Opened by @samraatsharma · 14 commits · Review requested from @engineers</div>
                    <div style={{ marginTop: "12px", padding: "10px", background: "rgba(255, 255, 255, 0.03)", borderRadius: "6px" }}>
                      “...verifying partitioned credential propagation across cross-origin iframes...”
                    </div>
                  </div>
                )}
                {activeApp === "terminal" && (
                  <div>
                    <div><span style={{ color: "#10b981" }}>➜ doclify</span> git status</div>
                    <div>On branch main · working tree clean</div>
                    <div style={{ marginTop: "8px" }}><span style={{ color: "#10b981" }}>➜ doclify</span> cargo test</div>
                    <div style={{ color: "#38bdf8" }}>running 11 tests ... ok. 11 passed; 0 failed</div>
                  </div>
                )}
              </div>
            </div>

            {/* =======================================================
                THE TOP-RIGHT AMBIENT CAPSULE OVERLAY
                ======================================================= */}
            {capsuleVisible ? (
              <div
                style={{
                  position: "absolute",
                  top: "24px",
                  right: "24px",
                  width: "420px",
                  maxWidth: "calc(100% - 48px)",
                  zIndex: 30,
                  animation: "fadeIn 0.25s ease forwards",
                }}
              >
                {/* 52px High Capsule */}
                <div
                  style={{
                    height: "52px",
                    background: "rgba(12, 16, 25, 0.96)",
                    borderRadius: "26px",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(99, 102, 241, 0.3)",
                    backdropFilter: "blur(24px)",
                    WebkitBackdropFilter: "blur(24px)",
                    display: "flex",
                    alignItems: "center",
                    padding: "0 14px",
                    gap: "12px",
                  }}
                >
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

                  <span style={{ fontSize: "13.5px", color: "#ffffff", flex: 1, fontFamily: "var(--font-body)" }}>
                    the auth cookie PR thread
                  </span>

                  <button
                    onClick={() => setCapsuleVisible(false)}
                    style={{
                      background: "rgba(255, 255, 255, 0.08)",
                      border: "none",
                      borderRadius: "50%",
                      width: "24px",
                      height: "24px",
                      color: "rgba(255, 255, 255, 0.6)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    title="Press ESC to dismiss"
                  >
                    <X size={12} />
                  </button>
                </div>

                {/* Capsule Quick Result */}
                <div
                  style={{
                    marginTop: "8px",
                    background: "rgba(17, 23, 36, 0.98)",
                    border: "1px solid rgba(99, 102, 241, 0.4)",
                    borderRadius: "16px",
                    padding: "16px",
                    boxShadow: "0 14px 40px rgba(0, 0, 0, 0.6)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "4px" }}>
                    <span style={{ color: "#818cf8", fontFamily: "var(--font-mono)", fontWeight: 700 }}>github.com</span>
                    <span style={{ color: "#10b981", fontFamily: "var(--font-mono)" }}>98.6% match</span>
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#ffffff", marginBottom: "4px" }}>
                    PR #412: Support Partitioned CHIPS Cookies in Safari 18
                  </div>
                  <div style={{ fontSize: "11.5px", color: "#94a3b8", lineHeight: 1.4 }}>
                    Hit Return to jump into browser, or ESC to dismiss without touching your editor.
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setCapsuleVisible(true)}
                style={{
                  position: "absolute",
                  top: "24px",
                  right: "24px",
                  background: "rgba(99, 102, 241, 0.2)",
                  border: "1px solid #6366f1",
                  borderRadius: "10px",
                  padding: "8px 16px",
                  color: "#ffffff",
                  fontSize: "12px",
                  fontFamily: "var(--font-mono)",
                  cursor: "pointer",
                }}
              >
                Press ⌃ ⌃ to summon Revia again
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
