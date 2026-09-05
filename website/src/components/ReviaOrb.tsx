export type OrbState = "idle" | "listening" | "searching" | "results";

interface ReviaOrbProps {
  state?: OrbState;
  size?: number;
  audioLevel?: number;
  className?: string;
}

export const ReviaOrb: React.FC<ReviaOrbProps> = ({
  state = "idle",
  size = 48,
  audioLevel = 0,
  className = "",
}) => {
  const isListening = state === "listening";
  const isSearching = state === "searching";
  const hasResults = state === "results";

  // Dynamic colors depending on state
  const coreGlow = isListening
    ? "radial-gradient(circle at 35% 35%, #34d399 0%, #059669 45%, #064e3b 85%)"
    : isSearching
    ? "radial-gradient(circle at 35% 35%, #f472b6 0%, #c084fc 45%, #4c1d95 85%)"
    : hasResults
    ? "radial-gradient(circle at 35% 35%, #38bdf8 0%, #6366f1 50%, #1e1b4b 90%)"
    : "radial-gradient(circle at 35% 35%, #60a5fa 0%, #6366f1 45%, #1e1b4b 85%)";

  const ringAColor = isListening
    ? "#34d399"
    : isSearching
    ? "#c084fc"
    : "#38bdf8";

  const ringBColor = isListening
    ? "#10b981"
    : isSearching
    ? "#f472b6"
    : "#818cf8";

  return (
    <div
      className={`revia-orb-container ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        perspective: "600px",
      }}
    >
      {/* Shockwave ripple rings when listening */}
      {isListening && (
        <>
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              border: "1.5px solid rgba(52, 211, 153, 0.6)",
              animation: "pulseRipple 1.6s cubic-bezier(0.16, 1, 0.3, 1) infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              border: "1px solid rgba(16, 185, 129, 0.4)",
              animation: "pulseRipple 1.6s cubic-bezier(0.16, 1, 0.3, 1) 0.6s infinite",
            }}
          />
        </>
      )}

      {/* Atmospheric Ambient Aura */}
      <div
        style={{
          position: "absolute",
          width: `${size * 1.3}px`,
          height: `${size * 1.3}px`,
          borderRadius: "50%",
          background: isListening
            ? "radial-gradient(circle, rgba(52, 211, 153, 0.25) 0%, transparent 70%)"
            : isSearching
            ? "radial-gradient(circle, rgba(192, 132, 252, 0.3) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(56, 189, 248, 0.25) 0%, transparent 70%)",
          filter: "blur(8px)",
          pointerEvents: "none",
        }}
      />

      {/* 3D Gyroscopic Orbital Ring Alpha */}
      <div
        style={{
          position: "absolute",
          width: `${size * 1.15}px`,
          height: `${size * 1.15}px`,
          borderRadius: "50%",
          border: `1.2px solid ${ringAColor}`,
          opacity: 0.75,
          boxShadow: `0 0 8px ${ringAColor}`,
          transformStyle: "preserve-3d",
          animation: isSearching
            ? "orbitRotateA 2s linear infinite"
            : "orbitRotateA 7s linear infinite",
          pointerEvents: "none",
        }}
      >
        {/* Orbital micro-satellite photon */}
        <div
          style={{
            position: "absolute",
            top: "-2px",
            left: "50%",
            width: "4px",
            height: "4px",
            borderRadius: "50%",
            background: "#ffffff",
            boxShadow: `0 0 6px #ffffff, 0 0 10px ${ringAColor}`,
          }}
        />
      </div>

      {/* 3D Gyroscopic Orbital Ring Beta (Counter-orbiting) */}
      <div
        style={{
          position: "absolute",
          width: `${size * 0.95}px`,
          height: `${size * 0.95}px`,
          borderRadius: "50%",
          border: `1px dashed ${ringBColor}`,
          opacity: 0.6,
          boxShadow: `0 0 6px ${ringBColor}`,
          transformStyle: "preserve-3d",
          animation: isSearching
            ? "orbitRotateB 1.8s linear infinite"
            : "orbitRotateB 8s linear infinite",
          pointerEvents: "none",
        }}
      />

      {/* Central Volumetric Core Sphere */}
      <div
        style={{
          width: `${size * 0.58 + audioLevel * (size * 0.15)}px`,
          height: `${size * 0.58 + audioLevel * (size * 0.15)}px`,
          borderRadius: "50%",
          background: coreGlow,
          position: "relative",
          animation: "breatheCore 3.5s ease-in-out infinite",
          transition: "all 0.3s ease",
          boxShadow: `0 0 ${size * 0.35}px rgba(56, 189, 248, 0.35), inset 0 0 ${size * 0.15}px rgba(255, 255, 255, 0.4)`,
        }}
      >
        {/* Specular Key Light Reflection */}
        <div
          style={{
            position: "absolute",
            top: "16%",
            left: "20%",
            width: `${size * 0.14}px`,
            height: `${size * 0.08}px`,
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.85)",
            filter: "blur(0.8px)",
            transform: "rotate(-25deg)",
          }}
        />
      </div>
    </div>
  );
};
