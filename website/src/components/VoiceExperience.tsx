import React, { useState, useEffect } from "react";
import { ExternalLink } from "lucide-react";

export const VoiceExperience: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [spokenProgress, setSpokenProgress] = useState(0);

  const fullSpokenText = "“I saw an article about Apple Silicon unified memory architecture yesterday afternoon...”";

  useEffect(() => {
    let timer: any;
    let active = true;

    const runVoiceLoop = async () => {
      setSpokenProgress(0);
      setIsPlaying(true);

      // Typing simulation for spoken transcription
      for (let i = 1; i <= fullSpokenText.length; i++) {
        if (!active) return;
        setSpokenProgress(i);
        await new Promise((r) => (timer = setTimeout(r, 42)));
      }

      await new Promise((r) => (timer = setTimeout(r, 2200)));
      if (!active) return;

      runVoiceLoop();
    };

    runVoiceLoop();

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, []);

  return (
    <section
      id="voice"
      style={{
        padding: "120px 0 130px 0",
        backgroundColor: "var(--bg-graphite)",
        color: "#ffffff",
        position: "relative",
        overflow: "hidden",
      }}
      className="texture-grid-dark"
    >
      <div className="container">
        {/* Section Sub-badge */}
        <div style={{ textAlign: "center", marginBottom: "22px" }}>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11.5px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "#38bdf8",
              background: "rgba(56, 189, 248, 0.1)",
              border: "1px solid rgba(56, 189, 248, 0.25)",
              padding: "5px 14px",
              borderRadius: "20px",
            }}
          >
            05 // Ambient Voice Input
          </span>
        </div>

        {/* Narrative Headline */}
        <div style={{ textAlign: "center", maxWidth: "860px", margin: "0 auto 52px auto" }}>
          <h2 className="headline-editorial" style={{ color: "#ffffff", marginBottom: "20px" }}>
            Just say what you remember.
            <br />
            <span className="serif-italic" style={{ color: "#93c5fd" }}>No keyboard required.</span>
          </h2>

          <p className="lead-paragraph-dark" style={{ maxWidth: "660px", margin: "0 auto" }}>
            Summon Revia, hold the microphone button (or press ⌘M), and speak naturally. macOS native speech dictation feeds your stream directly into local embedding search.
          </p>
        </div>

        {/* ====================================================================
            EXPANSIVE WAVEFORM GEOMETRY & SPOKEN TRANSCRIPTION SHOWCASE
            ==================================================================== */}
        <div
          style={{
            maxWidth: "920px",
            margin: "0 auto",
            background: "linear-gradient(180deg, #131826 0%, #0a0d15 100%)",
            border: "1px solid rgba(255, 255, 255, 0.14)",
            borderRadius: "24px",
            padding: "48px 36px",
            boxShadow: "0 30px 80px rgba(0, 0, 0, 0.6)",
            position: "relative",
            overflow: "hidden",
          }}
          className="specular-top-dark"
        >
          {/* Audio Waveform Equalizer Display (32 dynamic bars) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              height: "90px",
              marginBottom: "36px",
            }}
          >
            {Array.from({ length: 32 }).map((_, i) => {
              // Mathematical wave distribution
              const heightMultiplier = Math.sin((i / 32) * Math.PI) * 0.85 + 0.15;
              const duration = 0.5 + (i % 5) * 0.18;
              const delay = (i % 7) * 0.12;

              return (
                <div
                  key={i}
                  style={{
                    width: "5px",
                    height: `${heightMultiplier * 72}px`,
                    background: "linear-gradient(180deg, #38bdf8 0%, #818cf8 60%, #c084fc 100%)",
                    borderRadius: "3px",
                    transformOrigin: "bottom",
                    animation: isPlaying ? `waveBar ${duration}s ease-in-out infinite ${delay}s` : "none",
                    boxShadow: "0 0 10px rgba(56, 189, 248, 0.3)",
                  }}
                />
              );
            })}
          </div>

          {/* Real-time Spoken Text Visualizer */}
          <div
            style={{
              minHeight: "70px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              marginBottom: "36px",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontSize: "clamp(20px, 3.5vw, 32px)",
                color: "#ffffff",
                lineHeight: 1.35,
                letterSpacing: "-0.01em",
              }}
            >
              {fullSpokenText.slice(0, spokenProgress)}
              <span style={{ borderRight: "2px solid #38bdf8", marginLeft: "4px", animation: "waveBar 0.8s infinite" }} />
            </span>
          </div>

          {/* Surfaced Memory Card Triggered by Voice */}
          <div
            style={{
              background: "rgba(22, 29, 44, 0.95)",
              border: "1px solid rgba(56, 189, 248, 0.35)",
              borderRadius: "16px",
              padding: "20px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "20px",
              boxShadow: "0 12px 32px rgba(0, 0, 0, 0.4)",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "#38bdf8", fontWeight: 700 }}>
                  anandtech.com
                </span>
                <span style={{ color: "rgba(255, 255, 255, 0.25)" }}>·</span>
                <span style={{ fontSize: "11px", color: "var(--text-dark-secondary)" }}>Yesterday, 4:15 PM</span>
                <span style={{ color: "rgba(255, 255, 255, 0.25)" }}>·</span>
                <span
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
                  99.1% Confidence
                </span>
              </div>

              <div style={{ fontSize: "15px", fontWeight: 700, color: "#ffffff", marginBottom: "4px" }}>
                Apple Silicon Unified Memory Architecture: Deep-Dive into LPDDR5 Bandwidth
              </div>

              <div style={{ fontSize: "12.5px", color: "var(--text-dark-secondary)", lineHeight: 1.45 }}>
                “...how the M-series unified memory subsystem eliminates memory copying between CPU cores and GPU shaders...”
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "12px",
                fontFamily: "var(--font-mono)",
                color: "#38bdf8",
                background: "rgba(56, 189, 248, 0.1)",
                padding: "8px 14px",
                borderRadius: "10px",
                whiteSpace: "nowrap",
              }}
            >
              <span>Press Return to open</span>
              <ExternalLink size={13} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
