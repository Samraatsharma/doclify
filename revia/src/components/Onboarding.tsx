import React, { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  Loader2,
  Sparkles,
  Mic,
  Shield,
  Key,
  Compass,
  Database,
  Search,
  Globe,
} from "lucide-react";
import { ReviaOrb } from "./ReviaOrb";
import { AuthStatusResponse } from "../types";

interface OnboardingProps {
  onComplete: () => void;
  onClose: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete, onClose }) => {
  const [step, setStep] = useState<number>(1);

  // Permission states
  const [hasAccessibility, setHasAccessibility] = useState<boolean>(false);
  const [hasMic, setHasMic] = useState<boolean>(false);
  const [hasSpeech, setHasSpeech] = useState<boolean>(false);

  // Interactive shortcut tester state (Screen 6)
  const [shortcutTested, setShortcutTested] = useState<boolean>(false);
  const [lastCtrlTap, setLastCtrlTap] = useState<number>(0);

  // Google Auth state (Screen 5)
  const [authStatus, setAuthStatus] = useState<AuthStatusResponse | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);

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

  const fetchAuthStatus = useCallback(async () => {
    try {
      const res = await invoke<AuthStatusResponse>("get_account_profile");
      setAuthStatus(res);
    } catch (e) {
      console.warn("Could not check auth status:", e);
    }
  }, []);

  useEffect(() => {
    invoke("position_setup_window").catch(() => {});
    checkPermissions();
    fetchAuthStatus();
  }, [checkPermissions, fetchAuthStatus]);

  // Listen for physical keyboard double-Control in Screen 6 trainer
  useEffect(() => {
    if (step !== 6) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Control") {
        const now = Date.now();
        if (now - lastCtrlTap > 60 && now - lastCtrlTap < 650) {
          setShortcutTested(true);
        }
        setLastCtrlTap(now);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [step, lastCtrlTap]);

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

  const handleGoogleAuth = async () => {
    setAuthError(null);
    setIsAuthenticating(true);
    try {
      await invoke<string>("initiate_google_auth");
      setTimeout(fetchAuthStatus, 2000);
    } catch (e: any) {
      const msg = typeof e === "string" ? e : e?.message ?? "Google OAuth is not configured on this device.";
      setAuthError(msg);
    } finally {
      setIsAuthenticating(false);
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

  const nextStep = () => setStep((s) => Math.min(s + 1, 7));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

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
        background: "linear-gradient(145deg, rgba(18, 22, 34, 0.92) 0%, rgba(10, 12, 20, 0.96) 100%)",
        backdropFilter: "blur(50px) saturate(210%) contrast(108%)",
        WebkitBackdropFilter: "blur(50px) saturate(210%) contrast(108%)",
        border: "1px solid rgba(255, 255, 255, 0.16)",
        boxShadow:
          "0 28px 70px -12px rgba(0, 0, 0, 0.85), 0 10px 24px -4px rgba(0, 0, 0, 0.5), inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.35), inset 0 -1px 1px 0 rgba(0, 0, 0, 0.6), 0 0 40px -4px rgba(99, 102, 241, 0.2)",
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
          padding: "12px 20px 10px 20px",
          borderBottom: "1px solid var(--border-subtle)",
          boxShadow: "var(--assistant-bevel)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <ReviaOrb state={step === 1 ? "idle" : step === 3 ? "searching" : "results"} size={20} />
          <span style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
            Revia
          </span>
          <span style={{ fontSize: "10.5px", color: "var(--text-tertiary)", fontWeight: 500 }}>
            • Step {step} of 7
          </span>
        </div>

        {/* Step Indicator Pills */}
        <div style={{ display: "flex", gap: "5px" }} className="no-drag">
          {[1, 2, 3, 4, 5, 6, 7].map((s) => (
            <div
              key={s}
              onClick={() => setStep(s)}
              title={`Jump to step ${s}`}
              style={{
                width: s === step ? "22px" : "6px",
                height: "6px",
                borderRadius: "3px",
                background: s === step ? "var(--accent)" : s < step ? "rgba(99, 102, 241, 0.5)" : "var(--border-subtle)",
                cursor: "pointer",
                transition: "all 0.24s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            />
          ))}
        </div>

        {/* Skip button */}
        <button
          onClick={handleSkip}
          className="no-drag"
          title="Skip setup"
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
            transition: "color 0.15s ease",
          }}
        >
          <span>Skip</span>
          <X size={12} />
        </button>
      </div>

      {/* Main Step Content Container */}
      <div
        style={{
          flex: 1,
          padding: "20px 28px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          overflowY: "auto",
        }}
      >
        {/* ================================================================= */}
        {/* SCREEN 1: Welcome to Revia */}
        {/* ================================================================= */}
        {step === 1 && (
          <div className="animate-materialize" style={{ display: "flex", flexDirection: "column", alignItems: "center", maxWidth: "460px" }}>
            <div style={{ marginBottom: "18px" }}>
              <ReviaOrb state="idle" size={64} />
            </div>
            <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px", letterSpacing: "-0.02em" }}>
              Welcome to Revia
            </h1>
            <p style={{ fontSize: "14.5px", lineHeight: "1.5", color: "var(--text-secondary)", marginBottom: "12px", fontWeight: 500 }}>
              Your computer remembers, so you don’t have to.
            </p>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(99, 102, 241, 0.12)",
                border: "1px solid rgba(99, 102, 241, 0.3)",
                padding: "5px 12px",
                borderRadius: "20px",
                fontSize: "12px",
                color: "#c7d2fe",
                fontWeight: 500,
                marginBottom: "16px",
              }}
            >
              <Shield size={13} color="#818cf8" />
              <span>Your memories stay on your computer.</span>
            </div>
            <p style={{ fontSize: "12.5px", lineHeight: "1.5", color: "var(--text-tertiary)", maxWidth: "400px" }}>
              Revia runs quietly in the background, transforming your digital footprint into an ambient, instant search index.
            </p>
          </div>
        )}

        {/* ================================================================= */}
        {/* SCREEN 2: Revia remembers what you see */}
        {/* ================================================================= */}
        {step === 2 && (
          <div className="animate-materialize" style={{ display: "flex", flexDirection: "column", alignItems: "center", maxWidth: "480px", width: "100%" }}>
            <div style={{ marginBottom: "12px" }}>
              <ReviaOrb state="results" size={42} />
            </div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px", letterSpacing: "-0.02em" }}>
              Revia remembers what you see.
            </h2>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "16px", fontWeight: 500 }}>
              You browse. You forget. Revia remembers.
            </p>

            {/* Interactive Browser Activity Stream */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                width: "100%",
                maxWidth: "420px",
                marginBottom: "14px",
              }}
            >
              {[
                { domain: "github.com", title: "rust-lang/rust: Empowering everyone to build reliable software", time: "10m ago" },
                { domain: "arxiv.org", title: "Attention Is All You Need — Transformer Architecture", time: "2h ago" },
                { domain: "developer.apple.com", title: "CoreGraphics Event Taps & Hardware Subsystem", time: "Yesterday" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    borderRadius: "10px",
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    textAlign: "left",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                    <Compass size={14} color="#818cf8" style={{ flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: "11.5px", fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: "10px", color: "var(--text-tertiary)" }}>
                        {item.domain}
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: "9.5px", color: "var(--accent)", fontWeight: 600, flexShrink: 0, marginLeft: "8px" }}>
                    {item.time}
                  </span>
                </div>
              ))}
            </div>

            <p style={{ fontSize: "11.5px", color: "var(--text-tertiary)", lineHeight: "1.4" }}>
              Snapshots are stored in local SQLite without uploading URLs or content to any third-party server.
            </p>
          </div>
        )}

        {/* ================================================================= */}
        {/* SCREEN 3: Forget the website. Remember the thought. */}
        {/* ================================================================= */}
        {step === 3 && (
          <div className="animate-materialize" style={{ display: "flex", flexDirection: "column", alignItems: "center", maxWidth: "480px", width: "100%" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px", letterSpacing: "-0.02em" }}>
              Forget the website. Remember the thought.
            </h2>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "16px", fontWeight: 500 }}>
              You ask. Revia finds it.
            </p>

            {/* Simulated Natural Search Experience */}
            <div
              style={{
                width: "100%",
                maxWidth: "420px",
                background: "rgba(10, 13, 24, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "14px",
                padding: "12px",
                marginBottom: "14px",
                textAlign: "left",
              }}
            >
              {/* Simulated input */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 12px",
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "8px",
                  marginBottom: "10px",
                }}
              >
                <Search size={14} color="#818cf8" />
                <span style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: 500 }}>
                  that paper on transformer models I saw yesterday
                </span>
              </div>

              {/* Resolved match card */}
              <div
                style={{
                  padding: "10px 12px",
                  background: "rgba(59, 130, 246, 0.12)",
                  border: "1px solid rgba(99, 102, 241, 0.4)",
                  borderRadius: "10px",
                }}
              >
                <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "2px" }}>
                  Attention Is All You Need
                </div>
                <div style={{ fontSize: "10.5px", color: "var(--text-tertiary)", marginBottom: "4px" }}>
                  arxiv.org • Visited yesterday at 3:42 PM
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                  "...dominant sequence transduction models are based on complex recurrent or convolutional neural networks..."
                </div>
              </div>
            </div>

            <p style={{ fontSize: "11.5px", color: "var(--text-tertiary)", lineHeight: "1.4" }}>
              Revia matches keywords, full-text titles, domains, and semantic concepts in milliseconds.
            </p>
          </div>
        )}

        {/* ================================================================= */}
        {/* SCREEN 4: Choose browser & system permissions */}
        {/* ================================================================= */}
        {step === 4 && (
          <div className="animate-materialize" style={{ display: "flex", flexDirection: "column", alignItems: "center", maxWidth: "480px", width: "100%" }}>
            <h2 style={{ fontSize: "19px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px", letterSpacing: "-0.02em" }}>
              Browser & System Access
            </h2>
            <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", marginBottom: "14px" }}>
              Configure how Revia captures and assists your workflow:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%", maxWidth: "440px", marginBottom: "12px" }}>
              {/* 1. Chrome History */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.09)",
                  borderRadius: "12px",
                  textAlign: "left",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Database size={16} color="#3b82f6" />
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>
                      Google Chrome History
                    </div>
                    <div style={{ fontSize: "10.5px", color: "var(--text-tertiary)" }}>
                      Read-only local SQLite indexing
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: "10.5px", color: "var(--success)", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                  <CheckCircle2 size={13} />
                  <span>Ready</span>
                </span>
              </div>

              {/* 2. Accessibility (macOS Global Shortcut) */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.09)",
                  borderRadius: "12px",
                  textAlign: "left",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Key size={16} color="#818cf8" />
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>
                      Global Double-Control (⌃ ⌃)
                    </div>
                    <div style={{ fontSize: "10.5px", color: "var(--text-tertiary)" }}>
                      Requires macOS Accessibility permission
                    </div>
                  </div>
                </div>
                {hasAccessibility ? (
                  <span style={{ fontSize: "10.5px", color: "var(--success)", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                    <CheckCircle2 size={13} />
                    <span>Granted</span>
                  </span>
                ) : (
                  <button
                    onClick={handleGrantAccessibility}
                    className="no-drag"
                    style={{
                      background: "rgba(99, 102, 241, 0.2)",
                      border: "1px solid rgba(99, 102, 241, 0.5)",
                      color: "#c7d2fe",
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

              {/* 3. Microphone & Speech Recognition */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.09)",
                  borderRadius: "12px",
                  textAlign: "left",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Mic size={16} color="#10b981" />
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>
                      Hands-Free Voice Search
                    </div>
                    <div style={{ fontSize: "10.5px", color: "var(--text-tertiary)" }}>
                      On-device Apple Speech Engine
                    </div>
                  </div>
                </div>
                {hasMic && hasSpeech ? (
                  <span style={{ fontSize: "10.5px", color: "var(--success)", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                    <CheckCircle2 size={13} />
                    <span>Granted</span>
                  </span>
                ) : (
                  <button
                    onClick={handleGrantVoice}
                    className="no-drag"
                    style={{
                      background: "rgba(16, 185, 129, 0.2)",
                      border: "1px solid rgba(16, 185, 129, 0.5)",
                      color: "#a7f3d0",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Allow Voice
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* SCREEN 5: Optional Beta Account */}
        {/* ================================================================= */}
        {step === 5 && (
          <div className="animate-materialize" style={{ display: "flex", flexDirection: "column", alignItems: "center", maxWidth: "480px", width: "100%" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px", letterSpacing: "-0.02em" }}>
              Optional Beta Account
            </h2>
            <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", marginBottom: "14px", fontWeight: 500 }}>
              Sign in to link beta feedback and future multi-device settings.
            </p>

            {/* Privacy Promise Banner */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                background: "rgba(99, 102, 241, 0.12)",
                border: "1px solid rgba(99, 102, 241, 0.3)",
                padding: "10px 14px",
                borderRadius: "12px",
                textAlign: "left",
                marginBottom: "16px",
                width: "100%",
                maxWidth: "420px",
              }}
            >
              <Shield size={16} color="#818cf8" style={{ flexShrink: 0, marginTop: "2px" }} />
              <div style={{ fontSize: "11.5px", color: "#c7d2fe", lineHeight: "1.4" }}>
                <strong>Your memories stay on your computer.</strong>
                <br />
                Signing in is completely optional. Revia never uploads your browsing history. Optional product analytics are separate from your private memories.
              </div>
            </div>

            {authStatus?.account ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "rgba(16, 185, 129, 0.12)",
                  border: "1px solid rgba(16, 185, 129, 0.4)",
                  padding: "10px 16px",
                  borderRadius: "10px",
                  marginBottom: "14px",
                  color: "#a7f3d0",
                  fontSize: "12.5px",
                  fontWeight: 600,
                }}
              >
                <CheckCircle2 size={16} color="#10b981" />
                <span>Signed in as {authStatus.account.email}</span>
              </div>
            ) : (
              /* Auth Action Buttons */
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%", maxWidth: "340px", marginBottom: "12px" }}>
                <button
                  onClick={handleGoogleAuth}
                  disabled={isAuthenticating}
                  className="no-drag"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    background: "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    color: "var(--text-primary)",
                    padding: "9px 16px",
                    borderRadius: "10px",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "background 0.15s ease",
                  }}
                >
                  {isAuthenticating ? <Loader2 size={14} className="spin-icon" /> : <Globe size={14} />}
                  <span>Continue with Google</span>
                </button>

                <button
                  onClick={nextStep}
                  className="no-drag"
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "var(--text-secondary)",
                    padding: "8px 16px",
                    borderRadius: "10px",
                    fontSize: "12px",
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  Continue without an account
                </button>
              </div>
            )}

            {authError && (
              <div style={{ fontSize: "11px", color: "#fca5a5", background: "rgba(239, 68, 68, 0.1)", padding: "6px 10px", borderRadius: "8px", maxWidth: "420px" }}>
                {authError}
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* SCREEN 6: Interactive Shortcut Trainer */}
        {/* ================================================================= */}
        {step === 6 && (
          <div className="animate-materialize" style={{ display: "flex", flexDirection: "column", alignItems: "center", maxWidth: "480px", width: "100%" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px", letterSpacing: "-0.02em" }}>
              Summon Revia Anywhere
            </h2>
            <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", marginBottom: "16px" }}>
              Revia floats instantly over any app, full-screen video, or desktop:
            </p>

            {/* Shortcut Cards */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
              <div
                style={{
                  background: shortcutTested ? "rgba(16, 185, 129, 0.15)" : "rgba(255, 255, 255, 0.05)",
                  border: `1px solid ${shortcutTested ? "rgba(16, 185, 129, 0.5)" : "rgba(255, 255, 255, 0.12)"}`,
                  borderRadius: "12px",
                  padding: "10px 16px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "6px",
                  transition: "all 0.24s ease",
                }}
              >
                <div style={{ display: "flex", gap: "4px" }}>
                  <kbd style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "6px", padding: "4px 10px", fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>⌃</kbd>
                  <kbd style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "6px", padding: "4px 10px", fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>⌃</kbd>
                </div>
                <span style={{ fontSize: "11px", fontWeight: 600, color: shortcutTested ? "#a7f3d0" : "var(--text-secondary)" }}>
                  {shortcutTested ? "Double-Tap Verified ✓" : "Double-tap Control"}
                </span>
              </div>

              <div
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  borderRadius: "12px",
                  padding: "10px 16px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <div style={{ display: "flex", gap: "4px" }}>
                  <kbd style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "6px", padding: "4px 10px", fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>⌥</kbd>
                  <kbd style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "6px", padding: "4px 10px", fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>Space</kbd>
                </div>
                <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
                  Option + Space
                </span>
              </div>
            </div>

            {/* Interactive Trainer Prompt */}
            <div
              style={{
                fontSize: "11.5px",
                color: shortcutTested ? "#10b981" : "var(--accent)",
                background: shortcutTested ? "rgba(16, 185, 129, 0.1)" : "rgba(59, 130, 246, 0.1)",
                padding: "8px 14px",
                borderRadius: "8px",
                border: `1px solid ${shortcutTested ? "rgba(16, 185, 129, 0.3)" : "rgba(59, 130, 246, 0.3)"}`,
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Sparkles size={13} />
              <span>
                {shortcutTested
                  ? "Perfect! Your shortcut is registered and active across all apps."
                  : "Try it: tap Control twice now to verify your keyboard response."}
              </span>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* SCREEN 7: Ready to Recall */}
        {/* ================================================================= */}
        {step === 7 && (
          <div className="animate-materialize" style={{ display: "flex", flexDirection: "column", alignItems: "center", maxWidth: "460px" }}>
            <div style={{ marginBottom: "16px" }}>
              <ReviaOrb state="results" size={56} />
            </div>
            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px", letterSpacing: "-0.02em" }}>
              You're Ready
            </h2>
            <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", marginBottom: "16px", fontWeight: 500 }}>
              Revia is now actively remembering your digital universe.
            </p>

            {/* Checklist of Active Capabilities */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                width: "100%",
                maxWidth: "360px",
                marginBottom: "20px",
                textAlign: "left",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "var(--text-primary)" }}>
                <CheckCircle2 size={14} color="#10b981" />
                <span>Local SQLite Memory Engine initialized</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "var(--text-primary)" }}>
                <CheckCircle2 size={14} color="#10b981" />
                <span>Continuous background sync active (every 8s)</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "var(--text-primary)" }}>
                <CheckCircle2 size={14} color="#10b981" />
                <span>Global shortcut ready (⌃ ⌃ or ⌥ Space)</span>
              </div>
            </div>

            <button
              onClick={handleFinish}
              className="no-drag"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
                border: "none",
                color: "#ffffff",
                padding: "10px 24px",
                borderRadius: "12px",
                fontSize: "13.5px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 10px 24px -4px rgba(99, 102, 241, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.4)",
                transition: "all 0.18s ease",
              }}
            >
              <span>Start Using Revia</span>
              <ArrowRight size={15} />
            </button>
          </div>
        )}
      </div>

      {/* Bottom Footer Navigation Bar */}
      <div
        className="no-drag"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 24px",
          borderTop: "1px solid var(--border-subtle)",
          background: "rgba(0, 0, 0, 0.2)",
        }}
      >
        {/* Back Button */}
        {step > 1 ? (
          <button
            onClick={prevStep}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              background: "transparent",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "var(--text-secondary)",
              padding: "6px 12px",
              borderRadius: "8px",
              fontSize: "11.5px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            <ArrowLeft size={13} />
            <span>Back</span>
          </button>
        ) : (
          <div />
        )}

        {/* Next / Finish Button */}
        {step < 7 ? (
          <button
            onClick={nextStep}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
              border: "none",
              color: "#ffffff",
              padding: "7px 16px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(99, 102, 241, 0.35)",
            }}
          >
            <span>{step === 1 ? "Begin Setup" : "Continue"}</span>
            <ArrowRight size={13} />
          </button>
        ) : (
          <button
            onClick={handleFinish}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              border: "none",
              color: "#ffffff",
              padding: "7px 16px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(16, 185, 129, 0.35)",
            }}
          >
            <span>Complete Setup</span>
            <CheckCircle2 size={13} />
          </button>
        )}
      </div>
    </div>
  );
};
