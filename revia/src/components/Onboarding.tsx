import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  Compass,
  Sparkles,
  Search,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Database,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { ChromeAccessStatus, IngestionStats } from "../types";

interface OnboardingProps {
  onComplete: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState<number>(1);
  const [accessStatus, setAccessStatus] = useState<ChromeAccessStatus | null>(null);
  const [isCheckingAccess, setIsCheckingAccess] = useState(false);
  const [isIndexing, setIsIndexing] = useState(false);
  const [indexStats, setIndexStats] = useState<IngestionStats | null>(null);
  const [indexError, setIndexError] = useState<string | null>(null);

  useEffect(() => {
    if (step === 3) {
      checkAccess();
    }
  }, [step]);

  const checkAccess = async () => {
    setIsCheckingAccess(true);
    try {
      const res = await invoke<ChromeAccessStatus>("check_chrome_history_access");
      setAccessStatus(res);
    } catch (e) {
      console.error("Access check failed:", e);
    } finally {
      setIsCheckingAccess(false);
    }
  };

  const handleStartIndexing = async () => {
    setIsIndexing(true);
    setIndexError(null);
    try {
      const stats = await invoke<IngestionStats>("ingest_chrome_history", { forceFull: true });
      setIndexStats(stats);
      // Wait 1.5s to show completion before moving to finish
      setTimeout(() => {
        onComplete();
      }, 1500);
    } catch (e: any) {
      setIndexError(typeof e === "string" ? e : e?.message ?? "Failed to index Chrome history");
    } finally {
      setIsIndexing(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        width: "100vw",
        padding: "30px",
        background: "var(--bg-app)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          background: "var(--bg-card)",
          border: "1px solid var(--border-app)",
          borderRadius: "14px",
          padding: "28px",
          boxShadow: "var(--shadow-popover)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        {/* Step Indicator dots */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "20px" }}>
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              style={{
                width: s === step ? "20px" : "6px",
                height: "6px",
                borderRadius: "3px",
                background: s === step ? "var(--accent)" : "var(--border-subtle)",
                transition: "all 0.25s ease",
              }}
            />
          ))}
        </div>

        {/* SCREEN 1: WELCOME */}
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "14px",
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 16px rgba(59, 130, 246, 0.45)",
                color: "#ffffff",
              }}
            >
              <Compass size={28} strokeWidth={2.4} />
            </div>
            <div>
              <h1 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)" }}>
                Welcome to Revia
              </h1>
              <div style={{ fontSize: "13px", color: "var(--accent)", fontWeight: 600, marginTop: "4px" }}>
                Your computer remembers, so you don’t have to.
              </div>
            </div>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: "380px" }}>
              Remember seeing something on your Mac—an article, a tool, a documentation page—but can't remember where?
              Revia searches your local browsing memory so you find it instantly.
            </p>
            <button
              onClick={() => setStep(2)}
              style={{
                marginTop: "10px",
                width: "100%",
                background: "var(--accent)",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                padding: "10px 16px",
                fontSize: "13.5px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: "0 2px 8px var(--accent-glow)",
              }}
            >
              <span>Get Started</span>
              <ArrowRight size={15} />
            </button>
          </div>
        )}

        {/* SCREEN 2: HOW IT WORKS */}
        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "14px",
                background: "var(--accent-subtle)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--accent)",
              }}
            >
              <Search size={28} />
            </div>
            <div>
              <h2 style={{ fontSize: "19px", fontWeight: 700, color: "var(--text-primary)" }}>
                How Revia Works
              </h2>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
                Fast, keyboard-first, native Mac utility
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                width: "100%",
                textAlign: "left",
                fontSize: "12.5px",
                color: "var(--text-secondary)",
              }}
            >
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <span style={{ background: "var(--bg-pill)", padding: "2px 7px", borderRadius: "5px", fontWeight: 700, color: "var(--accent)" }}>1</span>
                <div>Press <kbd style={{ background: "var(--bg-pill)", padding: "1px 5px", borderRadius: "4px" }}>Cmd+Shift+Space</kbd> anywhere on your Mac.</div>
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <span style={{ background: "var(--bg-pill)", padding: "2px 7px", borderRadius: "5px", fontWeight: 700, color: "var(--accent)" }}>2</span>
                <div>Describe what you remember: <em>"article about AI yesterday"</em> or <em>"github react"</em>.</div>
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <span style={{ background: "var(--bg-pill)", padding: "2px 7px", borderRadius: "5px", fontWeight: 700, color: "var(--accent)" }}>3</span>
                <div>Press <kbd style={{ background: "var(--bg-pill)", padding: "1px 5px", borderRadius: "4px" }}>↵ Enter</kbd> to jump straight to the page.</div>
              </div>
            </div>

            <button
              onClick={() => setStep(3)}
              style={{
                marginTop: "10px",
                width: "100%",
                background: "var(--accent)",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                padding: "10px 16px",
                fontSize: "13.5px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <span>Continue to Privacy & Permissions</span>
              <ArrowRight size={15} />
            </button>
          </div>
        )}

        {/* SCREEN 3: PERMISSIONS & PRIVACY */}
        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "14px",
                background: "rgba(16, 185, 129, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--success)",
              }}
            >
              <ShieldCheck size={28} />
            </div>
            <div>
              <h2 style={{ fontSize: "19px", fontWeight: 700, color: "var(--text-primary)" }}>
                Privacy & Permissions
              </h2>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
                Zero cloud. 100% on your machine.
              </div>
            </div>

            <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              Revia only requires read access to your local Google Chrome history. It creates a safe read-only snapshot and never modifies or deletes your browser files.
            </p>

            {/* Access verification banner */}
            <div
              style={{
                width: "100%",
                background: accessStatus?.accessible
                  ? "rgba(16, 185, 129, 0.12)"
                  : "rgba(245, 158, 11, 0.12)",
                border: accessStatus?.accessible
                  ? "1px solid var(--success)"
                  : "1px solid var(--warning)",
                borderRadius: "8px",
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                textAlign: "left",
                fontSize: "12px",
              }}
            >
              {isCheckingAccess ? (
                <Loader2 size={16} className="spin-icon" color="var(--accent)" />
              ) : accessStatus?.accessible ? (
                <CheckCircle2 size={16} color="var(--success)" style={{ flexShrink: 0 }} />
              ) : (
                <AlertCircle size={16} color="var(--warning)" style={{ flexShrink: 0 }} />
              )}
              <div>
                <div style={{ fontWeight: 600, color: accessStatus?.accessible ? "var(--success)" : "var(--warning)" }}>
                  {accessStatus?.accessible ? "Chrome History Detected & Readable" : "Checking Chrome Access..."}
                </div>
                <div style={{ color: "var(--text-tertiary)", fontSize: "11px", marginTop: "2px" }}>
                  {accessStatus?.item_count != null
                    ? `Found ~${accessStatus.item_count} history records ready to index.`
                    : "Verifying local path..."}
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(4)}
              style={{
                marginTop: "10px",
                width: "100%",
                background: "var(--accent)",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                padding: "10px 16px",
                fontSize: "13.5px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <span>Proceed to Indexing</span>
              <ArrowRight size={15} />
            </button>
          </div>
        )}

        {/* SCREEN 4: INITIAL INDEXING */}
        {step === 4 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", width: "100%" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "14px",
                background: "linear-gradient(135deg, #3b82f6, #10b981)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
              }}
            >
              <Database size={28} />
            </div>
            <div>
              <h2 style={{ fontSize: "19px", fontWeight: 700, color: "var(--text-primary)" }}>
                Build Your Memory Index
              </h2>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
                Revia will now index your Chrome browsing history locally.
              </div>
            </div>

            {isIndexing ? (
              <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "10px", padding: "10px 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-secondary)" }}>
                  <span>Reading Chrome History...</span>
                  <Loader2 size={14} className="spin-icon" color="var(--accent)" />
                </div>
                <div
                  style={{
                    height: "8px",
                    width: "100%",
                    background: "var(--bg-pill)",
                    borderRadius: "4px",
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: "65%",
                      background: "linear-gradient(90deg, var(--accent), var(--success))",
                      borderRadius: "4px",
                      animation: "pulse 1.2s infinite alternate",
                    }}
                  />
                </div>
              </div>
            ) : indexStats ? (
              <div
                style={{
                  width: "100%",
                  background: "rgba(16, 185, 129, 0.12)",
                  border: "1px solid var(--success)",
                  borderRadius: "8px",
                  padding: "14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", color: "var(--success)", fontWeight: 700 }}>
                  <CheckCircle2 size={16} />
                  Memory Ready!
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  Successfully indexed <strong>{indexStats.total_stored_items}</strong> pages in {indexStats.duration_ms}ms.
                </div>
              </div>
            ) : (
              <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Click below to start indexing. It takes less than 2 seconds and runs entirely in the background.
              </p>
            )}

            {indexError && (
              <div style={{ fontSize: "12px", color: "var(--danger)", marginTop: "4px" }}>
                {indexError}
              </div>
            )}

            {!indexStats && (
              <button
                onClick={handleStartIndexing}
                disabled={isIndexing}
                style={{
                  marginTop: "10px",
                  width: "100%",
                  background: "var(--accent)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "10px 16px",
                  fontSize: "13.5px",
                  fontWeight: 600,
                  cursor: isIndexing ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxShadow: "0 2px 8px var(--accent-glow)",
                  opacity: isIndexing ? 0.7 : 1,
                }}
              >
                {isIndexing ? (
                  <>
                    <Loader2 size={15} className="spin-icon" />
                    <span>Indexing History...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={15} />
                    <span>Start Indexing Chrome</span>
                  </>
                )}
              </button>
            )}

            {indexStats && (
              <button
                onClick={onComplete}
                style={{
                  marginTop: "10px",
                  width: "100%",
                  background: "var(--success)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "10px 16px",
                  fontSize: "13.5px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Start Using Revia
              </button>
            )}
          </div>
        )}
      </div>
      <style>{`
        .spin-icon { animation: spin 1s linear infinite; }
        @keyframes pulse { from { opacity: 0.6; } to { opacity: 1; } }
      `}</style>
    </div>
  );
};
