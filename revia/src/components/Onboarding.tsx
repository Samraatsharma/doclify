import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  Search,
  Mic,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Sparkles,
} from "lucide-react";
import { ReviaOrb } from "./ReviaOrb";
import { IngestionStats } from "../types";

interface OnboardingProps {
  onComplete: () => void;
  onClose: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete, onClose }) => {
  const [step, setStep] = useState<number>(1);
  const [isIndexing, setIsIndexing] = useState<boolean>(false);
  const [indexStats, setIndexStats] = useState<IngestionStats | null>(null);
  const [indexError, setIndexError] = useState<string | null>(null);

  // Adjust native window height for onboarding card
  useEffect(() => {
    invoke("set_window_height", { height: 380 }).catch(() => {});
  }, []);

  // Escape key allows dismissing or skipping onboarding anytime
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleSkip();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleFinish = async () => {
    try {
      await invoke("complete_onboarding");
      localStorage.setItem("revia_onboarding_completed", "true");
    } catch (e) {
      console.warn("Could not save onboarding state to DB:", e);
    }
    onComplete();
  };

  const handleSkip = async () => {
    try {
      await invoke("complete_onboarding");
      localStorage.setItem("revia_onboarding_completed", "true");
    } catch (e) {
      console.warn("Could not save onboarding state to DB:", e);
    }
    onClose();
  };

  const handleStartIndexing = async () => {
    setIsIndexing(true);
    setIndexError(null);
    try {
      const stats = await invoke<IngestionStats>("ingest_chrome_history", { forceFull: false });
      setIndexStats(stats);
      setTimeout(() => {
        handleFinish();
      }, 1200);
    } catch (e: any) {
      const msg = typeof e === "string" ? e : e?.message ?? "Could not access Chrome history";
      setIndexError(msg);
    } finally {
      setIsIndexing(false);
    }
  };

  return (
    <div
      className="revia-onboarding-card"
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        borderRadius: "16px",
        background: "var(--assistant-bg)",
        backdropFilter: "blur(32px) saturate(190%)",
        WebkitBackdropFilter: "blur(32px) saturate(190%)",
        border: "1px solid var(--assistant-border)",
        boxShadow: "var(--assistant-shadow)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Top Header Bar */}
      <div
        className="titlebar-drag"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 18px 8px 18px",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <ReviaOrb state="idle" size={20} />
          <span style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--text-primary)" }}>
            Revia Setup
          </span>
        </div>

        {/* Step dots */}
        <div style={{ display: "flex", gap: "5px" }} className="no-drag">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              style={{
                width: s === step ? "16px" : "5px",
                height: "5px",
                borderRadius: "3px",
                background: s === step ? "var(--accent)" : "var(--border-subtle)",
                transition: "all 0.2s ease",
              }}
            />
          ))}
        </div>

        {/* Skip button */}
        <button
          onClick={handleSkip}
          className="no-drag"
          title="Skip setup (Esc)"
          style={{
            background: "transparent",
            border: "none",
            color: "var(--text-tertiary)",
            fontSize: "11px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "3px",
            padding: "3px 6px",
            borderRadius: "4px",
          }}
        >
          <span>Skip</span>
          <X size={12} />
        </button>
      </div>

      {/* Main Step Content */}
      <div
        style={{
          flex: 1,
          padding: "20px 24px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          textAlign: "center",
          alignItems: "center",
        }}
      >
        {/* STEP 1: MEET REVIA */}
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
            <ReviaOrb state="idle" size={44} />
            <h2 style={{ fontSize: "17px", fontWeight: 700, color: "var(--text-primary)", marginTop: "4px" }}>
              Meet Revia
            </h2>
            <div style={{ fontSize: "12.5px", color: "var(--accent)", fontWeight: 600 }}>
              Your computer remembers, so you don’t have to.
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5, maxWidth: "360px", marginTop: "2px" }}>
              Remember seeing a webpage, documentation, or article, but can’t recall where? Revia is your local memory assistant that brings you right back.
            </p>
          </div>
        )}

        {/* STEP 2: INVOCATION SHORTCUT */}
        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "var(--accent-subtle)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--accent)",
              }}
            >
              <Search size={24} />
            </div>
            <h2 style={{ fontSize: "17px", fontWeight: 700, color: "var(--text-primary)" }}>
              Always One Keystroke Away
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "4px 0" }}>
              <kbd
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-app)",
                  padding: "5px 12px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 700,
                  fontFamily: "var(--font-mono)",
                  color: "var(--accent)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                }}
              >
                Control + Space
              </kbd>
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5, maxWidth: "340px" }}>
              Press the shortcut anywhere on your Mac to summon Revia. You can also customize this anytime in Settings.
            </p>
          </div>
        )}

        {/* STEP 3: SPEAK NATURALLY */}
        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "rgba(16, 185, 129, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--success)",
              }}
            >
              <Mic size={24} />
            </div>
            <h2 style={{ fontSize: "17px", fontWeight: 700, color: "var(--text-primary)" }}>
              Speak or Type
            </h2>
            <div
              style={{
                background: "var(--bg-pill)",
                border: "1px solid var(--border-subtle)",
                padding: "8px 14px",
                borderRadius: "8px",
                fontSize: "12px",
                fontStyle: "italic",
                color: "var(--text-primary)",
              }}
            >
              "Find that article about AI agents I saw yesterday..."
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5, maxWidth: "340px" }}>
              Click the microphone 🎙 or simply type what you remember. Revia searches your local browsing history instantly.
            </p>
          </div>
        )}

        {/* STEP 4: INDEXING & READY */}
        {step === 4 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", width: "100%" }}>
            <ReviaOrb state={isIndexing ? "searching" : indexStats ? "results" : "idle"} size={42} />
            <h2 style={{ fontSize: "17px", fontWeight: 700, color: "var(--text-primary)" }}>
              Ready to Remember
            </h2>

            {isIndexing ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px", color: "var(--accent)" }}>
                  <Loader2 size={14} className="spin-icon" />
                  <span>Indexing local Chrome history...</span>
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
                  Zero cloud. Safe read-only copy.
                </div>
              </div>
            ) : indexStats ? (
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--success)", fontSize: "13px", fontWeight: 600 }}>
                <CheckCircle2 size={16} />
                <span>Indexed {indexStats.total_stored_items} pages in {indexStats.duration_ms}ms!</span>
              </div>
            ) : indexError ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--warning)", fontSize: "12px", fontWeight: 600 }}>
                  <AlertTriangle size={14} />
                  <span>Something needs attention:</span>
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-secondary)", maxWidth: "320px" }}>
                  {indexError}
                </div>
                <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                  <button
                    onClick={handleStartIndexing}
                    style={{
                      background: "var(--accent)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      padding: "4px 10px",
                      fontSize: "11px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Retry
                  </button>
                  <button
                    onClick={handleFinish}
                    style={{
                      background: "var(--bg-pill)",
                      color: "var(--text-secondary)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "6px",
                      padding: "4px 10px",
                      fontSize: "11px",
                      cursor: "pointer",
                    }}
                  >
                    Continue anyway
                  </button>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5, maxWidth: "340px" }}>
                Revia indexes your local Chrome history. It takes under 100ms and never uploads any data to the cloud.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 18px",
          borderTop: "1px solid var(--border-subtle)",
          background: "rgba(0, 0, 0, 0.08)",
        }}
      >
        {step > 1 ? (
          <button
            onClick={() => setStep((s) => s - 1)}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-secondary)",
              fontSize: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <ArrowLeft size={13} />
            <span>Back</span>
          </button>
        ) : (
          <div />
        )}

        <div style={{ display: "flex", gap: "8px" }}>
          {step < 4 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              style={{
                background: "var(--accent)",
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                padding: "6px 14px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <span>Continue</span>
              <ArrowRight size={13} />
            </button>
          ) : !indexStats && !indexError ? (
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={handleStartIndexing}
                disabled={isIndexing}
                style={{
                  background: "var(--accent)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "6px",
                  padding: "6px 14px",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: isIndexing ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <Sparkles size={13} />
                <span>Index Chrome</span>
              </button>
              <button
                onClick={handleFinish}
                style={{
                  background: "var(--bg-pill)",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "6px",
                  padding: "6px 10px",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                Finish
              </button>
            </div>
          ) : (
            <button
              onClick={handleFinish}
              style={{
                background: "var(--success)",
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                padding: "6px 16px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Start Using Revia
            </button>
          )}
        </div>
      </div>
      <style>{`.spin-icon { animation: spin 1s linear infinite; }`}</style>
    </div>
  );
};
