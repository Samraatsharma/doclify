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
  size = 30,
  onClick,
}) => {
  // Audio-reactive metrics
  const audioScale = state === "listening" ? 1 + Math.min(audioLevel * 0.45, 0.5) : 1;
  const audioGlow = state === "listening" ? 12 + audioLevel * 28 : 8;

  // Dynamic state colors matching website ReviaMemoryCore
  let coreGradient = "radial-gradient(circle at 35% 30%, #ffffff 0%, #e0e7ff 25%, #818cf8 60%, #4f46e5 100%)";
  let ring1Color = "rgba(14, 165, 233, 0.75)";
  let ring2Color = "rgba(99, 102, 241, 0.65)";
  let auraGlow = "radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, rgba(14, 165, 233, 0.15) 50%, transparent 75%)";

  if (state === "listening") {
    coreGradient = "radial-gradient(circle at 35% 30%, #ffffff 0%, #a7f3d0 25%, #10b981 60%, #065f46 100%)";
    ring1Color = "rgba(16, 185, 129, 0.85)";
    ring2Color = "rgba(6, 182, 212, 0.75)";
    auraGlow = "radial-gradient(circle, rgba(16, 185, 129, 0.6) 0%, rgba(6, 182, 212, 0.3) 50%, transparent 75%)";
  } else if (state === "searching") {
    coreGradient = "radial-gradient(circle at 35% 30%, #ffffff 0%, #fbcfe8 25%, #ec4899 60%, #831843 100%)";
    ring1Color = "rgba(236, 72, 153, 0.85)";
    ring2Color = "rgba(245, 158, 11, 0.75)";
    auraGlow = "radial-gradient(circle, rgba(236, 72, 153, 0.55) 0%, rgba(139, 92, 246, 0.3) 50%, transparent 75%)";
  } else if (state === "results") {
    coreGradient = "radial-gradient(circle at 35% 30%, #ffffff 0%, #bae6fd 25%, #38bdf8 60%, #1e40af 100%)";
    ring1Color = "rgba(56, 189, 248, 0.8)";
    ring2Color = "rgba(99, 102, 241, 0.7)";
    auraGlow = "radial-gradient(circle, rgba(56, 189, 248, 0.45) 0%, rgba(37, 99, 235, 0.2) 50%, transparent 75%)";
  }

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
        perspective: "800px",
        transformStyle: "preserve-3d",
        filter: "drop-shadow(0 4px 10px rgba(0, 0, 0, 0.5))",
      }}
      title={`Revia Memory Core (${state})`}
    >
      {/* 1. Volumetric Ambient Aura */}
      <div
        style={{
          position: "absolute",
          inset: `-${audioGlow}px`,
          borderRadius: "50%",
          background: auraGlow,
          transform: `scale(${audioScale})`,
          transition: "transform 0.08s ease-out, inset 0.15s ease-out",
          pointerEvents: "none",
          filter: "blur(6px)",
        }}
      />

      {/* 2. Concentric Acoustic Ripples (when listening) */}
      {state === "listening" && (
        <>
          <div
            className="revia-ripple ripple-alpha"
            style={{
              position: "absolute",
              inset: "-8px",
              borderRadius: "50%",
              border: "1.5px solid rgba(16, 185, 129, 0.7)",
              pointerEvents: "none",
            }}
          />
          <div
            className="revia-ripple ripple-beta"
            style={{
              position: "absolute",
              inset: "-8px",
              borderRadius: "50%",
              border: "1px solid rgba(6, 182, 212, 0.5)",
              pointerEvents: "none",
            }}
          />
        </>
      )}

      {/* 3. Primary 3D Gyroscopic Orbital Ring A (tilted along X) */}
      <div
        className={`revia-gyro-ring ring-primary ${state === "searching" ? "orbit-rapid" : "orbit-steady"}`}
        style={{
          position: "absolute",
          inset: "-4px",
          borderRadius: "50%",
          border: `1px solid ${ring1Color}`,
          borderTopColor: "transparent",
          borderBottomColor: ring1Color,
          pointerEvents: "none",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Orbital Micro-Beacon on Ring A */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "-2px",
            width: "3px",
            height: "3px",
            borderRadius: "50%",
            background: "#ffffff",
            boxShadow: `0 0 6px ${ring1Color}`,
          }}
        />
      </div>

      {/* 4. Secondary 3D Counter-Gyroscopic Ring B (tilted along Y/X) */}
      <div
        className={`revia-gyro-ring ring-secondary ${state === "searching" ? "orbit-counter-rapid" : "orbit-counter-steady"}`}
        style={{
          position: "absolute",
          inset: "-2px",
          borderRadius: "50%",
          border: `1px solid ${ring2Color}`,
          borderLeftColor: "transparent",
          borderRightColor: ring2Color,
          pointerEvents: "none",
          transformStyle: "preserve-3d",
        }}
      />

      {/* 5. 3D Volumetric Core Sphere */}
      <div
        className={`revia-core-sphere core-${state}`}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          background: coreGradient,
          backgroundSize: "200% 200%",
          animation: state === "idle" ? "orbBreathe 3.6s ease-in-out infinite, plasmaShift 8s ease infinite" : undefined,
          boxShadow:
            state === "listening"
              ? `0 0 20px rgba(16, 185, 129, 0.8), inset 0 2px 4px rgba(255, 255, 255, 0.85), inset 0 -3px 5px rgba(0, 0, 0, 0.6)`
              : state === "searching"
              ? `0 0 20px rgba(236, 72, 153, 0.75), inset 0 2px 4px rgba(255, 255, 255, 0.85), inset 0 -3px 5px rgba(0, 0, 0, 0.6)`
              : `0 0 16px rgba(99, 102, 241, 0.65), inset 0 2px 4px rgba(255, 255, 255, 0.8), inset 0 -3px 5px rgba(0, 0, 0, 0.55)`,
          transform: `scale(${audioScale})`,
          transition: "transform 0.08s ease-out, box-shadow 0.2s ease",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Specular Key-Light Flare (simulates top-left glass reflection) */}
        <div
          style={{
            position: "absolute",
            top: "10%",
            left: "15%",
            width: "42%",
            height: "42%",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.4) 45%, transparent 80%)",
            filter: "blur(0.5px)",
            pointerEvents: "none",
          }}
        />

        {/* Ambient Occlusion Deepening (simulates 3D curvature) */}
        <div
          style={{
            position: "absolute",
            bottom: "6%",
            right: "8%",
            width: "45%",
            height: "45%",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0, 0, 0, 0.6) 0%, transparent 85%)",
            filter: "blur(1.5px)",
            pointerEvents: "none",
          }}
        />

        {/* Searching Particle Corona Sweep */}
        {state === "searching" && (
          <div
            className="revia-particle-sweep"
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background: "conic-gradient(from 0deg, transparent 0%, rgba(255, 255, 255, 0.85) 50%, transparent 100%)",
              mixBlendMode: "overlay",
            }}
          />
        )}
      </div>

      <style>{`
        @keyframes orbBreathe {
          0%, 100% {
            transform: scale(1);
            filter: brightness(1) saturate(1);
          }
          50% {
            transform: scale(1.06);
            filter: brightness(1.2) saturate(1.15);
          }
        }
        @keyframes gyroRotateA {
          0% {
            transform: rotateX(66deg) rotateZ(0deg);
          }
          100% {
            transform: rotateX(66deg) rotateZ(360deg);
          }
        }
        @keyframes gyroRotateB {
          0% {
            transform: rotateY(-55deg) rotateX(25deg) rotateZ(0deg);
          }
          100% {
            transform: rotateY(-55deg) rotateX(25deg) rotateZ(-360deg);
          }
        }
        @keyframes particleCorona {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes reviaRippleExpand {
          0% {
            transform: scale(0.85);
            opacity: 0.9;
          }
          100% {
            transform: scale(1.9);
            opacity: 0;
          }
        }

        .ring-primary.orbit-steady {
          animation: gyroRotateA 7s linear infinite;
        }
        .ring-primary.orbit-rapid {
          animation: gyroRotateA 1.6s linear infinite;
        }
        .ring-secondary.orbit-counter-steady {
          animation: gyroRotateB 9s linear infinite;
        }
        .ring-secondary.orbit-counter-rapid {
          animation: gyroRotateB 2.1s linear infinite;
        }
        .revia-particle-sweep {
          animation: particleCorona 0.85s linear infinite;
        }
        .revia-ripple.ripple-alpha {
          animation: reviaRippleExpand 1.5s cubic-bezier(0.1, 0.3, 0.7, 1) infinite;
        }
        .revia-ripple.ripple-beta {
          animation: reviaRippleExpand 1.5s cubic-bezier(0.1, 0.3, 0.7, 1) infinite;
          animation-delay: 0.75s;
        }
      `}</style>
    </div>
  );
};
