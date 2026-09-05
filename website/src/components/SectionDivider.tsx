import React from "react";

export type DividerVariant = 
  | "wave-light-to-dark"
  | "wave-dark-to-light"
  | "horizon-rise"
  | "elliptical-arch"
  | "layered-shelf";

interface SectionDividerProps {
  variant: DividerVariant;
  fromBg?: string;
  toBg?: string;
  height?: number;
  label?: string;
  flip?: boolean;
}

export const SectionDivider: React.FC<SectionDividerProps> = ({
  variant,
  fromBg = "transparent",
  toBg = "transparent",
  height = 96,
  label,
  flip = false,
}) => {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: `${height}px`,
        backgroundColor: fromBg,
        overflow: "hidden",
        pointerEvents: "none",
        transform: flip ? "scaleY(-1)" : "none",
      }}
      aria-hidden="true"
    >
      {/* Wave from Light into Dark */}
      {variant === "wave-light-to-dark" && (
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          style={{ width: "100%", height: "100%", display: "block" }}
        >
          <path
            d="M0 40C320 110 680 0 1040 60C1240 95 1380 75 1440 65V120H0V40Z"
            fill={toBg}
          />
          <path
            d="M0 40C320 110 680 0 1040 60C1240 95 1380 75 1440 65"
            stroke="rgba(17, 20, 26, 0.08)"
            strokeWidth="1"
          />
        </svg>
      )}

      {/* Wave from Dark into Light */}
      {variant === "wave-dark-to-light" && (
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          style={{ width: "100%", height: "100%", display: "block" }}
        >
          <path
            d="M0 80C360 15 720 110 1120 40C1280 12 1380 25 1440 30V120H0V80Z"
            fill={toBg}
          />
          <path
            d="M0 80C360 15 720 110 1120 40C1280 12 1380 25 1440 30"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth="1"
          />
        </svg>
      )}

      {/* Horizon Rise (Gentle continuous arc) */}
      {variant === "horizon-rise" && (
        <svg
          viewBox="0 0 1440 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          style={{ width: "100%", height: "100%", display: "block" }}
        >
          <path
            d="M0 70Q720 0 1440 70V100H0V70Z"
            fill={toBg}
          />
          <path
            d="M0 70Q720 0 1440 70"
            stroke="rgba(99, 102, 241, 0.25)"
            strokeWidth="1.2"
          />
        </svg>
      )}

      {/* Elliptical Arch */}
      {variant === "elliptical-arch" && (
        <svg
          viewBox="0 0 1440 110"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          style={{ width: "100%", height: "100%", display: "block" }}
        >
          <path
            d="M0 100C400 15 1040 15 1440 100V110H0V100Z"
            fill={toBg}
          />
          <path
            d="M0 100C400 15 1040 15 1440 100"
            stroke="rgba(17, 20, 26, 0.07)"
            strokeWidth="1"
          />
        </svg>
      )}

      {/* Layered Architectural Shelf */}
      {variant === "layered-shelf" && (
        <div style={{ width: "100%", height: "100%", position: "relative", background: toBg }}>
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "1px",
              background: "linear-gradient(90deg, transparent 0%, rgba(99, 102, 241, 0.3) 50%, transparent 100%)",
            }}
          />
          {label && (
            <div
              style={{
                position: "absolute",
                top: "12px",
                left: "50%",
                transform: "translateX(-50%)",
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: "var(--text-whisper)",
              }}
            >
              {label}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
