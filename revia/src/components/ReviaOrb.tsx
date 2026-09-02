import React from "react";

export type OrbState = "idle" | "listening" | "searching" | "results";

interface ReviaOrbProps {
  state: OrbState;
  audioLevel?: number; // 0.0 to 1.0 from microphone
  size?: number;
  onClick?: () => void;
}

export const ReviaOrb: React.FC<ReviaOrbProps> = ({
  state,
  audioLevel = 0,
  size = 28,
  onClick,
}) => {
  // Compute dynamic scale and glow based on state and audio level
  const audioScale = state === "listening" ? 1 + audioLevel * 0.45 : 1;
  const audioGlow = state === "listening" ? 10 + audioLevel * 25 : 8;

  return (
    <div
      onClick={onClick}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: onClick ? "pointer" : "default",
        flexShrink: 0,
      }}
      title={`Revia Status: ${state}`}
    >
      {/* Outer ambient glow halo */}
      <div
        style={{
          position: "absolute",
          inset: `-${audioGlow}px`,
          borderRadius: "50%",
          background:
            state === "listening"
              ? "radial-gradient(circle, rgba(16, 185, 129, 0.45) 0%, rgba(6, 182, 212, 0.2) 60%, transparent 80%)"
              : state === "searching"
              ? "radial-gradient(circle, rgba(139, 92, 246, 0.5) 0%, rgba(59, 130, 246, 0.3) 60%, transparent 80%)"
              : "radial-gradient(circle, rgba(59, 130, 246, 0.35) 0%, rgba(139, 92, 246, 0.15) 60%, transparent 80%)",
          transform: `scale(${audioScale})`,
          transition: "all 0.15s ease-out",
          pointerEvents: "none",
        }}
      />

      {/* Ripple ring for listening state */}
      {state === "listening" && (
        <div
          className="revia-orb-ripple"
          style={{
            position: "absolute",
            inset: "-4px",
            borderRadius: "50%",
            border: "1.5px solid rgba(16, 185, 129, 0.6)",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Main Orb Body */}
      <div
        className={`revia-orb-core state-${state}`}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          background:
            state === "listening"
              ? "linear-gradient(135deg, #10b981 0%, #06b6d4 50%, #3b82f6 100%)"
              : state === "searching"
              ? "linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #3b82f6 100%)"
              : "linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #a855f7 100%)",
          boxShadow:
            state === "listening"
              ? `0 0 ${audioGlow}px rgba(16, 185, 129, 0.8), inset 0 1px 3px rgba(255, 255, 255, 0.6)`
              : state === "searching"
              ? "0 0 14px rgba(139, 92, 246, 0.75), inset 0 1px 3px rgba(255, 255, 255, 0.6)"
              : "0 0 10px rgba(59, 130, 246, 0.6), inset 0 1px 2px rgba(255, 255, 255, 0.5)",
          transform: `scale(${audioScale})`,
          transition: "transform 0.1s ease-out, box-shadow 0.2s ease, background 0.3s ease",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Holographic light reflection highlight */}
        <div
          style={{
            position: "absolute",
            top: "15%",
            left: "20%",
            width: "35%",
            height: "35%",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255, 255, 255, 0.85) 0%, transparent 80%)",
            filter: "blur(0.5px)",
          }}
        />

        {/* Searching spinning indicator arc */}
        {state === "searching" && (
          <div
            className="revia-orb-spin"
            style={{
              position: "absolute",
              inset: "2px",
              borderRadius: "50%",
              border: "1.5px solid transparent",
              borderTopColor: "rgba(255, 255, 255, 0.9)",
            }}
          />
        )}
      </div>

      <style>{`
        @keyframes orbBreathe {
          0%, 100% { transform: scale(1); opacity: 0.95; }
          50% { transform: scale(1.06); opacity: 1; }
        }
        @keyframes orbSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes orbRipple {
          0% { transform: scale(0.9); opacity: 0.8; }
          100% { transform: scale(1.6); opacity: 0; }
        }

        .revia-orb-core.state-idle {
          animation: orbBreathe 3.5s ease-in-out infinite;
        }
        .revia-orb-spin {
          animation: orbSpin 0.9s linear infinite;
        }
        .revia-orb-ripple {
          animation: orbRipple 1.4s cubic-bezier(0, 0.2, 0.8, 1) infinite;
        }
      `}</style>
    </div>
  );
};
