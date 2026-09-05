import React, { useState } from "react";

interface Node {
  id: string;
  title: string;
  source: string;
  time: string;
  category: "all" | "code" | "article" | "design" | "docs";
  x: number; // percentage
  y: number; // percentage
  snippet: string;
}

const MEMORY_NODES: Node[] = [
  { id: "1", title: "SQLite WAL Mode & Performance Benchmarks", source: "towardsdatascience.com", time: "Tuesday", category: "article", x: 22, y: 24, snippet: "Investigating write-ahead logging concurrency and dirty page cache flushing..." },
  { id: "2", title: "PR #412: Auth Cookie Partitioned Flag in Chrome 128", source: "github.com", time: "3d ago", category: "code", x: 48, y: 20, snippet: "CHIPS partitioned cookies support for cross-site embedded authentication..." },
  { id: "3", title: "FastEmbed: Fast, Local Rust Embeddings Engine", source: "github.com/qdrant", time: "May 14", category: "code", x: 38, y: 46, snippet: "ONNX runtime inference for bge-small-en-v1.5 with zero PyTorch footprint..." },
  { id: "4", title: "Maya's Design Tokens & Typography Scale v2", source: "figma.com", time: "Last week", category: "design", x: 74, y: 28, snippet: "Design variables for semantic elevation, border radius, and ivory contrast..." },
  { id: "5", title: "Apple Silicon Unified Memory Architecture Internals", source: "anandtech.com", time: "2w ago", category: "article", x: 18, y: 64, snippet: "High-bandwidth 200GB/s unified LPDDR5 memory pool shared by GPU and CPU..." },
  { id: "6", title: "PostgreSQL pgvector vs SQLite VSS Comparison", source: "simonwillison.net", time: "May 2", category: "docs", x: 62, y: 52, snippet: "Vector search in edge databases using faiss bindings and local vector tables..." },
  { id: "7", title: "Battery Chemistry Degradation in EV Fleet Data", source: "battery-eval.pdf", time: "Last month", category: "docs", x: 82, y: 68, snippet: "Comparison of lithium iron phosphate (LFP) vs nickel manganese cobalt (NMC)..." },
  { id: "8", title: "Tauri v2 macOS System Tray & Event Tap Documentation", source: "v2.tauri.app", time: "Yesterday", category: "docs", x: 32, y: 76, snippet: "CGEventTap flagsChanged hook integration with CoreGraphics event listeners..." },
  { id: "9", title: "Tailwind vs Vanilla CSS Architecture in 2026", source: "css-tricks.com", time: "3w ago", category: "article", x: 86, y: 22, snippet: "Why high-craft editorial software embraces raw CSS custom properties..." },
  { id: "10", title: "Terminal Docker Volume Prune Flags & Safety", source: "stackoverflow.com", time: "5d ago", category: "code", x: 54, y: 82, snippet: "docker system prune --volumes command and recovering untagged layers..." },
];

export const MemoryField: React.FC = () => {
  const [selectedLens, setSelectedLens] = useState<"all" | "code" | "article" | "design" | "docs">("all");
  const [activeNode, setActiveNode] = useState<Node | null>(null);

  const lenses = [
    { id: "all", label: "All Memory Nodes (420+)" },
    { id: "article", label: 'Query: "SQLite performance & WAL benchmarks"' },
    { id: "code", label: 'Query: "Auth cookie bug thread in PR"' },
    { id: "design", label: 'Query: "Maya’s design tokens in Figma"' },
    { id: "docs", label: 'Query: "Local vector search & sqlite-vss"' },
  ] as const;

  return (
    <section
      id="memory-field"
      style={{
        padding: "120px 0 130px 0",
        backgroundColor: "var(--bg-midnight)",
        color: "var(--text-dark-primary)",
        position: "relative",
        overflow: "hidden",
      }}
      className="texture-grid-dark"
    >
      <div className="container">
        {/* Section Pill Badge */}
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
            02 // The Memory Field
          </span>
        </div>

        {/* Narrative Headline */}
        <div style={{ textAlign: "center", maxWidth: "860px", margin: "0 auto 48px auto" }}>
          <h2
            className="headline-editorial"
            style={{ color: "#ffffff", marginBottom: "20px" }}
          >
            Your computer is full of memories.
            <br />
            <span className="serif-italic" style={{ color: "#93c5fd" }}>Revia gives them a shape.</span>
          </h2>

          <p className="lead-paragraph-dark" style={{ maxWidth: "660px", margin: "0 auto" }}>
            Every webpage read, document opened, and discussion reviewed forms a node in your local vector space. When you query Revia, memories cluster associatively.
          </p>
        </div>

        {/* Query Lenses Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            flexWrap: "wrap",
            marginBottom: "36px",
          }}
        >
          {lenses.map((l) => {
            const isSelected = selectedLens === l.id;
            return (
              <button
                key={l.id}
                onClick={() => {
                  setSelectedLens(l.id);
                  const firstMatch = MEMORY_NODES.find((n) => l.id === "all" || n.category === l.id);
                  if (firstMatch) setActiveNode(firstMatch);
                }}
                style={{
                  background: isSelected ? "rgba(56, 189, 248, 0.2)" : "rgba(255, 255, 255, 0.04)",
                  border: isSelected ? "1px solid #38bdf8" : "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "20px",
                  padding: "7px 16px",
                  fontSize: "12.5px",
                  fontFamily: "var(--font-mono)",
                  color: isSelected ? "#ffffff" : "var(--text-dark-secondary)",
                  cursor: "pointer",
                  transition: "all 0.18s ease",
                }}
              >
                {l.label}
              </button>
            );
          })}
        </div>

        {/* Constellation Canvas Display */}
        <div
          style={{
            background: "radial-gradient(ellipse at 50% 40%, #151c2a 0%, #090c12 80%)",
            border: "1px solid rgba(255, 255, 255, 0.14)",
            borderRadius: "24px",
            padding: "36px",
            position: "relative",
            minHeight: "480px",
            boxShadow: "0 30px 80px rgba(0, 0, 0, 0.6)",
            overflow: "hidden",
          }}
          className="specular-top-dark"
        >
          {/* Subtle Synaptic Connection Lines */}
          <svg
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
            }}
          >
            {MEMORY_NODES.map((node, i) => {
              if (i === MEMORY_NODES.length - 1) return null;
              const next = MEMORY_NODES[i + 1];
              const isHighlighted =
                selectedLens !== "all" &&
                (node.category === selectedLens || next.category === selectedLens);

              return (
                <line
                  key={`line-${node.id}-${next.id}`}
                  x1={`${node.x}%`}
                  y1={`${node.y}%`}
                  x2={`${next.x}%`}
                  y2={`${next.y}%`}
                  stroke={isHighlighted ? "rgba(56, 189, 248, 0.45)" : "rgba(255, 255, 255, 0.05)"}
                  strokeWidth={isHighlighted ? "1.5" : "1"}
                  strokeDasharray={isHighlighted ? "4 2" : "none"}
                />
              );
            })}
          </svg>

          {/* Memory Nodes Floating on Field */}
          <div style={{ position: "relative", width: "100%", height: "400px" }}>
            {MEMORY_NODES.map((node) => {
              const isMatch = selectedLens === "all" || node.category === selectedLens;
              const isSelected = activeNode?.id === node.id;

              return (
                <div
                  key={node.id}
                  onClick={() => setActiveNode(node)}
                  onMouseEnter={() => setActiveNode(node)}
                  style={{
                    position: "absolute",
                    left: `${node.x}%`,
                    top: `${node.y}%`,
                    transform: isSelected ? "translate(-50%, -50%) scale(1.18)" : "translate(-50%, -50%) scale(1)",
                    opacity: isMatch ? 1 : 0.25,
                    cursor: "pointer",
                    transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                    zIndex: isSelected ? 30 : isMatch ? 15 : 5,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      background: isSelected
                        ? "rgba(14, 165, 233, 0.95)"
                        : isMatch
                        ? "rgba(255, 255, 255, 0.12)"
                        : "rgba(255, 255, 255, 0.03)",
                      border: isSelected
                        ? "1.5px solid #ffffff"
                        : isMatch
                        ? "1px solid rgba(56, 189, 248, 0.5)"
                        : "1px solid rgba(255, 255, 255, 0.06)",
                      borderRadius: "16px",
                      padding: "6px 12px",
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                      boxShadow: isSelected ? "0 0 24px rgba(56, 189, 248, 0.7)" : "none",
                    }}
                  >
                    {/* Glowing Node Dot */}
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: isMatch ? "#38bdf8" : "rgba(255, 255, 255, 0.3)",
                        boxShadow: isMatch ? "0 0 8px #38bdf8" : "none",
                      }}
                    />
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        color: isSelected ? "#05070a" : "#ffffff",
                        whiteSpace: "nowrap",
                        maxWidth: "180px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {node.title}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Node Detail Card Overlay (Bottom Center) */}
          {activeNode && (
            <div
              style={{
                position: "absolute",
                bottom: "20px",
                left: "24px",
                right: "24px",
                background: "rgba(10, 14, 22, 0.95)",
                border: "1px solid rgba(56, 189, 248, 0.4)",
                borderRadius: "16px",
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
                backdropFilter: "blur(16px)",
                animation: "fadeIn 0.2s ease forwards",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "#38bdf8", fontWeight: 600 }}>
                    {activeNode.source}
                  </span>
                  <span style={{ color: "rgba(255, 255, 255, 0.3)" }}>·</span>
                  <span style={{ fontSize: "11px", color: "var(--text-dark-secondary)" }}>{activeNode.time}</span>
                  <span style={{ color: "rgba(255, 255, 255, 0.3)" }}>·</span>
                  <span style={{ fontSize: "10.5px", fontFamily: "var(--font-mono)", color: "#34d399", background: "rgba(52, 211, 153, 0.15)", padding: "1px 6px", borderRadius: "4px" }}>
                    Vector Match
                  </span>
                </div>

                <div style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff", marginBottom: "3px" }}>
                  {activeNode.title}
                </div>

                <div style={{ fontSize: "12px", color: "var(--text-dark-secondary)", lineHeight: 1.4 }}>
                  “{activeNode.snippet}”
                </div>
              </div>

              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  color: "#38bdf8",
                  padding: "6px 12px",
                  background: "rgba(56, 189, 248, 0.1)",
                  borderRadius: "8px",
                  whiteSpace: "nowrap",
                }}
              >
                Local SQLite VSS
              </div>
            </div>
          )}
        </div>

        {/* Conceptual Label */}
        <div style={{ textAlign: "center", marginTop: "16px", fontSize: "11.5px", fontFamily: "var(--font-mono)", color: "var(--text-dark-muted)" }}>
          * Conceptual representation of local vector embeddings (cosine similarity calculation on Apple Silicon)
        </div>
      </div>
    </section>
  );
};
