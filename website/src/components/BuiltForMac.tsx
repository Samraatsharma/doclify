import { Monitor, Command, Moon, Mic, Cpu, Layout } from "lucide-react";

export const BuiltForMac: React.FC = () => {
  const macFeatures = [
    {
      title: "Menu Bar Resident",
      desc: "Lives quietly in your top menu bar with zero Dock clutter. Runs invisibly until summoned.",
      icon: Layout,
    },
    {
      title: "Universal Invocation",
      desc: "Summon instantly with Double-Tap Control (⌃ ⌃) or ⌥ Space over Chrome, Finder, or VS Code.",
      icon: Command,
    },
    {
      title: "Multi-Monitor Awareness",
      desc: "Intelligently materializes in the top-right of your active monitor where your cursor is working.",
      icon: Monitor,
    },
    {
      title: "Apple Silicon Optimized",
      desc: "Native ARM64 architecture with instant startup and less than 90MB ambient RAM footprint.",
      icon: Cpu,
    },
    {
      title: "On-Device Speech",
      desc: "Integrates directly with macOS Speech Recognition. Dictation stays local to your machine.",
      icon: Mic,
    },
    {
      title: "Obsidian & Arctic Glass",
      desc: "Dynamic translucency with native macOS CoreGraphics blur adapting to light and dark themes.",
      icon: Moon,
    },
  ];

  return (
    <section className="section-spacing" style={{ position: "relative" }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: "center", maxWidth: "720px", margin: "0 auto 60px auto" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 12px",
              borderRadius: "20px",
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.14)",
              fontSize: "12px",
              fontWeight: 600,
              color: "#ffffff",
              marginBottom: "16px",
            }}
          >
            <span> macOS Native</span>
          </div>

          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", marginBottom: "16px" }}>
            Engineered specifically for <span className="gradient-text-accent">macOS</span>.
          </h2>

          <p style={{ fontSize: "16px", lineHeight: "1.6" }}>
            Revia is not an Electron web wrapper or heavy background process. It is a lean, responsive utility tailored to the Mac desktop.
          </p>
        </div>

        {/* 6-Item Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "20px",
          }}
        >
          {macFeatures.map((f, i) => {
            const IconComp = f.icon;
            return (
              <div
                key={i}
                className="glass-panel"
                style={{
                  borderRadius: "18px",
                  padding: "28px 24px",
                  transition: "all 0.22s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-medium)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-subtle)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    background: "rgba(56, 189, 248, 0.08)",
                    border: "1px solid rgba(56, 189, 248, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--accent-cyan)",
                    marginBottom: "16px",
                  }}
                >
                  <IconComp size={20} />
                </div>

                <h3 style={{ fontSize: "18px", color: "#ffffff", marginBottom: "8px" }}>
                  {f.title}
                </h3>

                <p style={{ fontSize: "13.5px", lineHeight: "1.6", color: "var(--text-secondary)" }}>
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
