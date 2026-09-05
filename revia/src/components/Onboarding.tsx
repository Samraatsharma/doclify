import React, { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { isMacOS, requiresAccessibilityPermission } from "../utils/platform";
import {
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Sparkles,
  Mic,
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
  const [hasAccessibility, setHasAccessibility] = useState<boolean>(false);
  const [hasMic, setHasMic] = useState<boolean>(false);
  const [hasSpeech, setHasSpeech] = useState<boolean>(false);

  const checkPermissions = useCallback(async () => {
    try {
      const ax = await invoke<boolean>("check_accessibility_permission");
      setHasAccessibility(ax ?? false);
      const mic = await invoke<string>("check_microphone_permission");
      setHasMic(mic === "authorized");
      const speech = await invoke<string>("check_speech_permission");
      setHasSpeech(speech === "authorized");
    } catch (e) {
      console.warn("Could not check permissions:", e);
    }
  }, []);

  // Native setup window positioning & initial permission checks
  useEffect(() => {
    invoke("position_setup_window").catch(() => {});
    checkPermissions();
  }, [checkPermissions]);

  const handleGrantAccessibility = async () => {
    try {
      await invoke("request_accessibility_permission");
      await invoke("open_accessibility_settings");
      setTimeout(checkPermissions, 1000);
      setTimeout(checkPermissions, 2500);
    } catch (e) {
      console.warn("Accessibility request error:", e);
    }
  };

  const handleGrantVoice = async () => {
    try {
      const micGranted = await invoke<boolean>("request_microphone_permission");
      const speechGranted = await invoke<boolean>("request_speech_permission");
      setHasMic(micGranted);
      setHasSpeech(speechGranted);
      checkPermissions();
    } catch (e) {
      console.warn("Voice permission error:", e);
    }
  };


  const handleFinish = async () => {
    try {
      await invoke("complete_onboarding");
      localStorage.setItem("revia_onboarding_completed", "true");
    } catch (e) {
      console.warn("Could not persist onboarding flag:", e);
    }
    onComplete();
  };

  const handleSkip = async () => {
    try {
      await invoke("complete_onboarding");
      localStorage.setItem("revia_onboarding_completed", "true");
    } catch (e) {
      console.warn("Could not persist onboarding flag:", e);
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
      }, 1000);
    } catch (e: any) {
      const msg = typeof e === "string" ? e : e?.message ?? "Could not access Chrome history. Make sure Chrome has history or is closed.";
      setIndexError(msg);
    } finally {
      setIsIndexing(false);
    }
  };

  return (
    <div
      className="revia-onboarding-card animate-materialize"
      style={{
        display: "flex",
        flexDirection: "column",
        width: "560px",
        maxWidth: "560px",
        height: "440px",
        borderRadius: "24px",
        background: "linear-gradient(145deg, rgba(18, 22, 34, 0.88) 0%, rgba(10, 12, 20, 0.94) 100%)",
        backdropFilter: "blur(50px) saturate(210%) contrast(108%)",
        WebkitBackdropFilter: "blur(50px) saturate(210%) contrast(108%)",
        border: "1px solid rgba(255, 255, 255, 0.16)",
        boxShadow: "0 28px 70px -12px rgba(0, 0, 0, 0.85), 0 10px 24px -4px rgba(0, 0, 0, 0.5), inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.35), inset 0 -1px 1px 0 rgba(0, 0, 0, 0.6), 0 0 40px -4px rgba(99, 102, 241, 0.2)",
        boxSizing: "border-box",
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
          boxShadow: "var(--assistant-bevel)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <ReviaOrb state="idle" size={20} />
          <span style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
            Revia Setup
          </span>
        </div>

        {/* Step dots */}
        <div style={{ display: "flex", gap: "6px" }} className="no-drag">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              style={{
                width: s === step ? "18px" : "6px",
                height: "6px",
                borderRadius: "3px",
                background: s === step ? "var(--accent)" : "var(--border-subtle)",
                transition: "all 0.24s ease",
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
            padding: "4px 8px",
            borderRadius: "6px",
          }}
        >
          <span>Skip</span>
          <X size={12} />
        </button>
      </div>

      {/* Main Step Body */}
      <div
        style={{
          flex: 1,
          padding: "20px 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        {/* STEP 1: Meet Revia */}
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", maxWidth: "440px" }}>
            <div style={{ marginBottom: "18px" }}>
              <ReviaOrb state="idle" size={56} />
            </div>
            <h2 style={{ fontSize: "21px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px", letterSpacing: "-0.02em" }}>
              Welcome to Revia
            </h2>
            <p style={{ fontSize: "14px", lineHeight: "1.5", color: "var(--text-secondary)", marginBottom: "12px", fontWeight: 500 }}>
              Your computer remembers, so you don’t have to.
            </p>
            <p style={{ fontSize: "12px", lineHeight: "1.4", color: "var(--text-tertiary)" }}>
              Revia lives quietly in your menu bar and privately indexes your browsing history locally. No cloud, zero telemetry.
            </p>
          </div>
        )}

        {/* STEP 2: Always Within Reach */}
        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", maxWidth: "440px", width: "100%" }}>
            <div style={{ marginBottom: "12px" }}>
              <ReviaOrb state="results" size={44} />
            </div>
            <h2 style={{ fontSize: "19px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px", letterSpacing: "-0.02em" }}>
              Instant Shortcuts
            </h2>
            <p style={{ fontSize: "12.5px", lineHeight: "1.4", color: "var(--text-secondary)", marginBottom: "12px" }}>
              Summon Revia anywhere over any app:
            </p>

            {/* Shortcuts Display */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "14px" }}>
              {isMacOS() ? (
                // macOS: Double-Control + Alt+Space
                <>
                  <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "10px", padding: "8px 14px", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                    <div style={{ display: "flex", gap: "4px" }}>
                      <kbd style={{ background: "var(--bg-pill)", border: "1px solid var(--border-subtle)", borderRadius: "6px", padding: "3px 8px", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>⌃</kbd>
                      <kbd style={{ background: "var(--bg-pill)", border: "1px solid var(--border-subtle)", borderRadius: "6px", padding: "3px 8px", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>⌃</kbd>
                    </div>
                    <span style={{ fontSize: "10.5px", color: "var(--text-tertiary)" }}>Double-tap Control</span>
                  </div>
                  <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "10px", padding: "8px 14px", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                    <div style={{ display: "flex", gap: "4px" }}>
                      <kbd style={{ background: "var(--bg-pill)", border: "1px solid var(--border-subtle)", borderRadius: "6px", padding: "3px 8px", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>⌥</kbd>
                      <kbd style={{ background: "var(--bg-pill)", border: "1px solid var(--border-subtle)", borderRadius: "6px", padding: "3px 8px", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>Space</kbd>
                    </div>
                    <span style={{ fontSize: "10.5px", color: "var(--text-tertiary)" }}>Option + Space</span>
                  </div>
                </>
              ) : (
                // Windows: Alt+Space
                <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "10px", padding: "10px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                  <div style={{ display: "flex", gap: "4px" }}>
                    <kbd style={{ background: "var(--bg-pill)", border: "1px solid var(--border-subtle)", borderRadius: "6px", padding: "3px 10px", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>Alt</kbd>
                    <kbd style={{ background: "var(--bg-pill)", border: "1px solid var(--border-subtle)", borderRadius: "6px", padding: "3px 10px", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>Space</kbd>
                  </div>
                  <span style={{ fontSize: "10.5px", color: "var(--text-tertiary)" }}>Alt + Space</span>
                </div>
              )}
            </div>

            {/* Accessibility Permission Status Row — macOS only */}
            {requiresAccessibilityPermission() && (
              <div
              style={{
                width: "100%",
                maxWidth: "380px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "var(--bg-input)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "10px",
                padding: "9px 14px",
                boxSizing: "border-box",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>
                  Accessibility Permission
                </span>
                <span style={{ fontSize: "10.5px", color: "var(--text-tertiary)" }}>
                  Required for double-tap ⌃⌃ shortcut
                </span>
              </div>
              {hasAccessibility ? (
                <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--success)", fontSize: "11.5px", fontWeight: 600 }}>
                  <CheckCircle2 size={14} />
                  <span>Granted</span>
                </div>
              ) : (
                <button
                  onClick={handleGrantAccessibility}
                  style={{
                    background: "rgba(234, 179, 8, 0.25)",
                    border: "1px solid rgba(234, 179, 8, 0.5)",
                    color: "#fef08a",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Grant Access
                </button>
              )}
            </div>
            )}
          </div>
        )}

        {/* STEP 3: Speak Naturally */}
        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", maxWidth: "440px", width: "100%" }}>
            <div style={{ marginBottom: "12px" }}>
              <ReviaOrb state={hasMic && hasSpeech ? "listening" : "idle"} size={44} audioLevel={hasMic && hasSpeech ? 0.3 : 0} />
            </div>
            <h2 style={{ fontSize: "19px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px", letterSpacing: "-0.02em" }}>
              Speak or type naturally
            </h2>
            <p style={{ fontSize: "12.5px", lineHeight: "1.4", color: "var(--text-secondary)", marginBottom: "12px" }}>
              Talk to Revia instead of typing. Speech is processed privately on-device.
            </p>

            <div
              style={{
                width: "100%",
                maxWidth: "380px",
                background: "var(--bg-input)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "10px",
                padding: "8px 12px",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "12.5px",
                color: "var(--accent)",
                fontWeight: 500,
                marginBottom: "12px",
                boxSizing: "border-box",
              }}
            >
              <Mic size={14} style={{ color: "var(--success)" }} />
              <span>"Find that article about AI agents I saw yesterday"</span>
            </div>

            {/* Voice Permissions Status Row */}
            <div
              style={{
                width: "100%",
                maxWidth: "380px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "var(--bg-input)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "10px",
                padding: "9px 14px",
                boxSizing: "border-box",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>
                  Microphone & Speech
                </span>
                <span style={{ fontSize: "10.5px", color: "var(--text-tertiary)" }}>
                  Private macOS on-device speech input
                </span>
              </div>
              {hasMic && hasSpeech ? (
                <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--success)", fontSize: "11.5px", fontWeight: 600 }}>
                  <CheckCircle2 size={14} />
                  <span>Granted</span>
                </div>
              ) : (
                <button
                  onClick={handleGrantVoice}
                  style={{
                    background: "var(--accent)",
                    border: "none",
                    color: "#fff",
                    padding: "5px 12px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Enable Voice
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP 4: Ready to Summon */}
        {step === 4 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", maxWidth: "440px" }}>
            <div style={{ marginBottom: "14px" }}>
              <ReviaOrb state={isIndexing ? "searching" : "results"} size={48} />
            </div>
            <h2 style={{ fontSize: "19px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px", letterSpacing: "-0.02em" }}>
              You can now summon Revia anytime
            </h2>
            <p style={{ fontSize: "13px", lineHeight: "1.4", color: "var(--text-secondary)", marginBottom: "14px" }}>
              Press Control twice to summon Revia and start listening:
            </p>

            {/* Shortcut Keys Badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 18px",
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "12px",
                marginBottom: "14px",
              }}
            >
              <kbd style={{ background: "var(--bg-pill)", border: "1px solid var(--border-subtle)", borderRadius: "6px", padding: "4px 10px", fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>⌃</kbd>
              <kbd style={{ background: "var(--bg-pill)", border: "1px solid var(--border-subtle)", borderRadius: "6px", padding: "4px 10px", fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>⌃</kbd>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)", marginLeft: "4px" }}>Double-tap Control</span>
            </div>

            {indexError ? (
              <div
                style={{
                  background: "rgba(239, 68, 68, 0.12)",
                  border: "1px solid rgba(239, 68, 68, 0.4)",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  marginBottom: "14px",
                  textAlign: "left",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--danger)", fontSize: "12.5px", fontWeight: 600, marginBottom: "4px" }}>
                  <AlertTriangle size={14} />
                  <span>Something needs attention</span>
                </div>
                <div style={{ fontSize: "11.5px", color: "var(--text-secondary)", marginBottom: "8px" }}>
                  {indexError}
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={handleStartIndexing}
                    style={{
                      background: "var(--danger)",
                      color: "#fff",
                      border: "none",
                      padding: "5px 12px",
                      borderRadius: "6px",
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
                      color: "var(--text-primary)",
                      border: "none",
                      padding: "5px 12px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      cursor: "pointer",
                    }}
                  >
                    Continue without indexing
                  </button>
                </div>
              </div>
            ) : indexStats ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "rgba(16, 185, 129, 0.12)",
                  border: "1px solid rgba(16, 185, 129, 0.4)",
                  borderRadius: "8px",
                  padding: "8px 14px",
                  color: "var(--success)",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  marginBottom: "14px",
                }}
              >
                <CheckCircle2 size={16} />
                <span>Indexed {indexStats.total_stored_items.toLocaleString()} pages into memory!</span>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Bottom Action Footer */}
      <div
        className="no-drag"
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
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              fontSize: "12.5px",
              fontWeight: 500,
            }}
          >
            <ArrowLeft size={14} />
            <span>Back</span>
          </button>
        ) : (
          <div />
        )}

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {step < 4 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              style={{
                background: "var(--accent)",
                color: "#ffffff",
                border: "none",
                borderRadius: "10px",
                padding: "8px 18px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 2px 10px rgba(59, 130, 246, 0.4)",
              }}
            >
              <span>Continue</span>
              <ArrowRight size={14} />
            </button>
          ) : (
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={handleStartIndexing}
                disabled={isIndexing}
                style={{
                  background: "transparent",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-secondary)",
                  borderRadius: "10px",
                  padding: "8px 14px",
                  fontSize: "12px",
                  fontWeight: 500,
                  cursor: isIndexing ? "wait" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                {isIndexing ? (
                  <>
                    <Loader2 size={12} className="spin-icon" />
                    <span>Indexing...</span>
                  </>
                ) : (
                  <span>Index History</span>
                )}
              </button>

              <button
                onClick={handleFinish}
                style={{
                  background: "var(--accent)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "10px",
                  padding: "8px 18px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 2px 10px rgba(59, 130, 246, 0.4)",
                }}
              >
                <Sparkles size={14} />
                <span>Start using Revia</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
