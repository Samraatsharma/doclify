import React, { useState, useEffect, useRef } from "react";
import { FileText, GitPullRequest, Database, Sparkles, Layout } from "lucide-react";

interface ReviaMemoryCoreProps {
  size?: number;
  interactive?: boolean;
  state?: "ambient" | "searching" | "resonating";
}

export const ReviaMemoryCore: React.FC<ReviaMemoryCoreProps> = ({
  size = 360,
  interactive = true,
  state = "ambient",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!interactive) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = (e.clientX - centerX) / (rect.width / 2);
      const dy = (e.clientY - centerY) / (rect.height / 2);
      setMousePos({
        x: Math.max(-1, Math.min(1, dx)),
        y: Math.max(-1, Math.min(1, dy)),
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [interactive]);

  const tiltX = mousePos.y * -14;
  const tiltY = mousePos.x * 14;

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: `${size}px`,
        height: `${size}px`,
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        perspective: "1000px",
        userSelect: "none",
      }}
      aria-label="Revia Memory Core visualization"
    >
      {/* 3D Transform Container */}
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transformStyle: "preserve-3d",
          transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
          transition: "transform 0.15s cubic-bezier(0.1, 1, 0.2, 1)",
        }}
      >
        {/* Ambient Backlight Soft Bloom */}
        <div
          style={{
            position: "absolute",
            width: "70%",
            height: "70%",
            borderRadius: "50%",
            background: state === "searching"
              ? "radial-gradient(circle, rgba(14, 165, 233, 0.35) 0%, rgba(99, 102, 241, 0.15) 50%, transparent 70%)"
              : "radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(139, 92, 246, 0.12) 50%, transparent 70%)",
            filter: "blur(32px)",
            pointerEvents: "none",
            animation: "breathingPulse 4.5s ease-in-out infinite",
          }}
        />

        {/* Primary Gyroscopic Orbital Ring A */}
        <div
          style={{
            position: "absolute",
            width: "82%",
            height: "82%",
            borderRadius: "50%",
            border: "1.5px solid rgba(99, 102, 241, 0.32)",
            borderTopColor: "rgba(14, 165, 233, 0.8)",
            borderBottomColor: "rgba(192, 132, 252, 0.5)",
            boxShadow: "0 0 20px rgba(99, 102, 241, 0.15), inset 0 0 14px rgba(14, 165, 233, 0.1)",
            transform: "rotateX(68deg) rotateY(18deg)",
            animation: state === "searching" ? "slowOrbit 6s linear infinite" : "slowOrbit 18s linear infinite",
            pointerEvents: "none",
          }}
        >
          {/* Orbital Bead Light */}
          <div
            style={{
              position: "absolute",
              top: "-5px",
              left: "50%",
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: "#38bdf8",
              boxShadow: "0 0 12px #38bdf8, 0 0 4px #ffffff",
            }}
          />
        </div>

        {/* Secondary Gyroscopic Orbital Ring B */}
        <div
          style={{
            position: "absolute",
            width: "92%",
            height: "92%",
            borderRadius: "50%",
            border: "1.2px dashed rgba(17, 20, 26, 0.18)",
            borderRightColor: "rgba(99, 102, 241, 0.6)",
            transform: "rotateX(-52deg) rotateY(32deg)",
            animation: "reverseOrbit 24s linear infinite",
            pointerEvents: "none",
          }}
        >
          {/* Orbital Data Marker */}
          <div
            style={{
              position: "absolute",
              bottom: "10%",
              right: "20%",
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#8b5cf6",
              boxShadow: "0 0 8px #8b5cf6",
            }}
          />
        </div>

        {/* Outer Data Constellation Ring (Subtle tick marks) */}
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            border: "1px solid rgba(17, 20, 26, 0.08)",
            transform: "rotateZ(45deg)",
            pointerEvents: "none",
          }}
        />

        {/* --- CENTRAL MEMORY NUCLEUS --- */}
        <div
          style={{
            position: "relative",
            width: "116px",
            height: "116px",
            borderRadius: "50%",
            background: "radial-gradient(circle at 35% 30%, #ffffff 0%, #f0eeff 30%, #c7d2fe 65%, #6366f1 100%)",
            boxShadow: `
              0 14px 40px rgba(99, 102, 241, 0.35),
              0 4px 12px rgba(17, 20, 26, 0.12),
              inset -6px -6px 16px rgba(49, 46, 129, 0.4),
              inset 6px 6px 14px rgba(255, 255, 255, 0.95)
            `,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "breathingPulse 3.8s ease-in-out infinite",
          }}
        >
          {/* Specular Glint (Light-reactive reflection) */}
          <div
            style={{
              position: "absolute",
              top: "14%",
              left: "20%",
              width: "36px",
              height: "20px",
              borderRadius: "50%",
              background: "radial-gradient(ellipse at center, rgba(255, 255, 255, 0.95) 0%, transparent 80%)",
              transform: `translate(${mousePos.x * 8}px, ${mousePos.y * 6}px) rotate(-25deg)`,
              filter: "blur(1px)",
              pointerEvents: "none",
            }}
          />

          {/* Inner Radiant Pulsar */}
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(129, 140, 248, 0.6) 100%)",
              boxShadow: "0 0 18px rgba(255, 255, 255, 0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Sparkles size={22} style={{ color: "#4338ca", opacity: 0.85 }} />
          </div>
        </div>

        {/* --- FLOATING MICRO-MEMORY SHARDS (Satellite Fragments) --- */}
        {/* Shard 1: GitHub PR Discussion */}
        <div
          style={{
            position: "absolute",
            top: "8%",
            left: "6%",
            background: "#ffffff",
            border: "1px solid rgba(17, 20, 26, 0.1)",
            boxShadow: "0 8px 24px rgba(17, 20, 26, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04)",
            borderRadius: "10px",
            padding: "8px 12px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "11.5px",
            fontFamily: "var(--font-mono)",
            color: "var(--text-ink)",
            animation: "floatMems 5.2s ease-in-out infinite",
            transform: `translate3d(${mousePos.x * -16}px, ${mousePos.y * -16}px, 40px)`,
            pointerEvents: "none",
          }}
        >
          <div style={{ width: "20px", height: "20px", borderRadius: "5px", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <GitPullRequest size={12} color="#4f46e5" />
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>PR #412: Auth Token Bug</div>
            <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>github.com · 3d ago</div>
          </div>
        </div>

        {/* Shard 2: SQLite Performance Post */}
        <div
          style={{
            position: "absolute",
            bottom: "10%",
            left: "8%",
            background: "#ffffff",
            border: "1px solid rgba(17, 20, 26, 0.1)",
            boxShadow: "0 8px 24px rgba(17, 20, 26, 0.08)",
            borderRadius: "10px",
            padding: "8px 12px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "11.5px",
            fontFamily: "var(--font-mono)",
            color: "var(--text-ink)",
            animation: "floatMems 6.4s ease-in-out infinite 0.8s",
            transform: `translate3d(${mousePos.x * -20}px, ${mousePos.y * -20}px, 60px)`,
            pointerEvents: "none",
          }}
        >
          <div style={{ width: "20px", height: "20px", borderRadius: "5px", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Database size={12} color="#059669" />
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>SQLite WAL & VSS Indexing</div>
            <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>simonwillison.net · Tuesday</div>
          </div>
        </div>

        {/* Shard 3: Figma Design Tokens */}
        <div
          style={{
            position: "absolute",
            top: "14%",
            right: "4%",
            background: "#ffffff",
            border: "1px solid rgba(17, 20, 26, 0.1)",
            boxShadow: "0 8px 24px rgba(17, 20, 26, 0.08)",
            borderRadius: "10px",
            padding: "8px 12px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "11.5px",
            fontFamily: "var(--font-mono)",
            color: "var(--text-ink)",
            animation: "floatMems 5.8s ease-in-out infinite 1.4s",
            transform: `translate3d(${mousePos.x * -12}px, ${mousePos.y * -12}px, 30px)`,
            pointerEvents: "none",
          }}
        >
          <div style={{ width: "20px", height: "20px", borderRadius: "5px", background: "#fdf4ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Layout size={12} color="#9333ea" />
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>Maya's UI Tokens v2.4</div>
            <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>figma.com · Last week</div>
          </div>
        </div>

        {/* Shard 4: Research Paper Excerpt */}
        <div
          style={{
            position: "absolute",
            bottom: "16%",
            right: "6%",
            background: "#ffffff",
            border: "1px solid rgba(17, 20, 26, 0.1)",
            boxShadow: "0 8px 24px rgba(17, 20, 26, 0.08)",
            borderRadius: "10px",
            padding: "8px 12px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "11.5px",
            fontFamily: "var(--font-mono)",
            color: "var(--text-ink)",
            animation: "floatMems 6.8s ease-in-out infinite 2.2s",
            transform: `translate3d(${mousePos.x * -24}px, ${mousePos.y * -24}px, 50px)`,
            pointerEvents: "none",
          }}
        >
          <div style={{ width: "20px", height: "20px", borderRadius: "5px", background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FileText size={12} color="#d97706" />
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>FastEmbed: Local Vector Search</div>
            <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>arxiv.org · May 18</div>
          </div>
        </div>

      </div>
    </div>
  );
};
