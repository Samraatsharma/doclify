import { useState } from "react";
import { ReviaOrb, type OrbState } from "./ReviaOrb";
import { ExternalLink, Sparkles } from "lucide-react";

export const InteractiveDemo: React.FC = () => {
  const [selectedState, setSelectedState] = useState<OrbState>("results");
  const [activeQuery, setActiveQuery] = useState("Find that article about AI agents I saw yesterday");

  const sampleQueries = [
    "Find that article about AI agents I saw yesterday",
    "Electric cars battery comparison",
    "React authentication tutorial last week",
    "Figma design system tokens documentation",
  ];

  const resultsMap: Record<string, Array<{ title: string; domain: string; time: string; url: string }>> = {
    "Find that article about AI agents I saw yesterday": [
      {
        title: "Building Autonomous AI Agents in Production",
        domain: "towardsdatascience.com",
        time: "Yesterday · 8:42 PM",
        url: "https://towardsdatascience.com/building-autonomous-ai-agents",
      },
      {
        title: "AI Agent Architecture & Multi-Agent Workflows",
        domain: "github.com",
        time: "Yesterday · 7:15 PM",
        url: "https://github.com/langchain-ai/agent-architectures",
      },
      {
        title: "Anthropic: Designing Effective Agentic Systems",
        domain: "anthropic.com",
        time: "Yesterday · 2:30 PM",
        url: "https://anthropic.com/research/agent-systems",
      },
    ],
    "Electric cars battery comparison": [
      {
        title: "Solid-State vs Lithium-Ion Battery Technology",
        domain: "electrek.co",
        time: "3 days ago · 6:20 PM",
        url: "https://electrek.co/battery-tech-revolution",
      },
      {
        title: "Top 10 Long Range EVs for 2026 Evaluated",
        domain: "caranddriver.com",
        time: "4 days ago · 1:12 PM",
        url: "https://caranddriver.com/rankings/ev-range",
      },
    ],
    "React authentication tutorial last week": [
      {
        title: "Modern Next.js & React Session Authentication",
        domain: "authjs.dev",
        time: "Last Tuesday · 4:18 PM",
        url: "https://authjs.dev/guides/modern-react-auth",
      },
      {
        title: "JWT vs Cookie Auth in Single Page Applications",
        domain: "developer.mozilla.org",
        time: "7 days ago · 11:05 AM",
        url: "https://developer.mozilla.org/web/security/cookies",
      },
    ],
    "Figma design system tokens documentation": [
      {
        title: "Design Tokens Specification & Variable Syntax",
        domain: "figma.com",
        time: "May 2 · 10:15 AM",
        url: "https://help.figma.com/hc/en-us/articles/design-tokens",
      },
    ],
  };

  const currentResults = resultsMap[activeQuery] || resultsMap[sampleQueries[0]];

  return (
    <section className="section-spacing" style={{ position: "relative" }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: "center", maxWidth: "680px", margin: "0 auto 48px auto" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 12px",
              borderRadius: "20px",
              background: "rgba(99, 102, 241, 0.1)",
              border: "1px solid rgba(99, 102, 241, 0.25)",
              fontSize: "12px",
              fontWeight: 600,
              color: "#a5b4fc",
              marginBottom: "16px",
            }}
          >
            <span>Interactive Sandbox</span>
          </div>

          <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", marginBottom: "16px" }}>
            Experience the <span className="gradient-text-accent">Revia Assistant</span>.
          </h2>
          <p style={{ fontSize: "16px", lineHeight: "1.6" }}>
            Click through the core assistant lifecycle states or test simulated queries below.
          </p>
        </div>

        {/* State Switcher Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "8px",
            marginBottom: "36px",
            flexWrap: "wrap",
          }}
        >
          {(
            [
              { id: "idle", label: "01 · Idle State" },
              { id: "listening", label: "02 · Listening / Voice" },
              { id: "searching", label: "03 · Vector Search" },
              { id: "results", label: "04 · Memory Results" },
            ] as const
          ).map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedState(s.id)}
              style={{
                background: selectedState === s.id ? "rgba(56, 189, 248, 0.15)" : "var(--bg-pill)",
                color: selectedState === s.id ? "#ffffff" : "var(--text-secondary)",
                border: selectedState === s.id ? "1px solid var(--accent-cyan)" : "1px solid var(--border-subtle)",
                borderRadius: "10px",
                padding: "8px 18px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Interactive Assistant Frame */}
        <div
          className="glass-panel"
          style={{
            maxWidth: "680px",
            margin: "0 auto",
            borderRadius: "24px",
            padding: "36px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            boxShadow: "var(--bevel-rim), 0 30px 60px rgba(0, 0, 0, 0.6)",
          }}
        >
          {/* Centered Large Orb Demonstration */}
          <div style={{ marginBottom: "28px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <ReviaOrb state={selectedState} size={72} audioLevel={selectedState === "listening" ? 0.6 : 0} />
            <span
              style={{
                fontSize: "11px",
                fontFamily: "var(--font-mono)",
                color: "var(--text-tertiary)",
                marginTop: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              State: {selectedState}
            </span>
          </div>

          {/* Interactive Input Capsule */}
          <div
            style={{
              width: "100%",
              maxWidth: "520px",
              background: "rgba(10, 14, 23, 0.9)",
              border: "1px solid var(--border-medium)",
              borderRadius: "18px",
              overflow: "hidden",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px 18px",
              }}
            >
              <ReviaOrb state={selectedState} size={22} />

              <input
                type="text"
                value={activeQuery}
                onChange={(e) => setActiveQuery(e.target.value)}
                placeholder="What do you remember?"
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#ffffff",
                  fontSize: "14px",
                  fontWeight: 500,
                  fontFamily: "inherit",
                }}
              />

              <div
                style={{
                  padding: "4px 8px",
                  borderRadius: "6px",
                  background: "var(--bg-pill)",
                  color: "var(--text-tertiary)",
                  fontSize: "11px",
                  fontFamily: "var(--font-mono)",
                }}
              >
                ⌃ ⌃
              </div>
            </div>

            {/* When State is Listening */}
            {selectedState === "listening" && (
              <div
                style={{
                  borderTop: "1px solid var(--border-subtle)",
                  padding: "14px 18px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  background: "rgba(52, 211, 153, 0.05)",
                }}
              >
                <div style={{ display: "flex", gap: "3px", alignItems: "center" }}>
                  {[12, 24, 18, 28, 16, 22, 14].map((h, i) => (
                    <div
                      key={i}
                      style={{
                        width: "3px",
                        height: `${h}px`,
                        borderRadius: "2px",
                        background: "var(--accent-emerald)",
                        animation: `plasmaShift 0.8s ease-in-out infinite alternate ${i * 0.1}s`,
                      }}
                    />
                  ))}
                </div>
                <span style={{ fontSize: "12.5px", color: "#34d399", fontWeight: 500 }}>
                  Listening to macOS on-device speech stream...
                </span>
              </div>
            )}

            {/* When State is Searching */}
            {selectedState === "searching" && (
              <div
                style={{
                  borderTop: "1px solid var(--border-subtle)",
                  padding: "14px 18px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  background: "rgba(192, 132, 252, 0.06)",
                }}
              >
                <Sparkles size={16} style={{ color: "var(--accent-purple)" }} />
                <span style={{ fontSize: "12.5px", color: "#c084fc", fontWeight: 500 }}>
                  Generating local ONNX dense embeddings & querying FTS5 SQLite index...
                </span>
              </div>
            )}

            {/* When State is Results */}
            {selectedState === "results" && (
              <div
                style={{
                  borderTop: "1px solid var(--border-subtle)",
                  padding: "10px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                {currentResults.map((r, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "10px 14px",
                      borderRadius: "10px",
                      background: i === 0 ? "rgba(56, 189, 248, 0.08)" : "transparent",
                      border: i === 0 ? "1px solid rgba(56, 189, 248, 0.25)" : "1px solid transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "#ffffff", marginBottom: "3px" }}>
                        {r.title}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "11px", color: "var(--text-tertiary)" }}>
                        <span>{r.domain}</span>
                        <span>·</span>
                        <span>{r.time}</span>
                      </div>
                    </div>
                    <ExternalLink size={13} style={{ color: "var(--text-tertiary)" }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Query Switchers */}
          <div style={{ marginTop: "24px", display: "flex", flexWrap: "wrap", gap: "6px", justifyContent: "center" }}>
            {sampleQueries.map((q, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActiveQuery(q);
                  setSelectedState("results");
                }}
                style={{
                  background: activeQuery === q ? "rgba(255, 255, 255, 0.1)" : "var(--bg-pill)",
                  color: activeQuery === q ? "#ffffff" : "var(--text-secondary)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "14px",
                  padding: "4px 10px",
                  fontSize: "11.5px",
                  cursor: "pointer",
                }}
              >
                "{q.slice(0, 30)}..."
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
