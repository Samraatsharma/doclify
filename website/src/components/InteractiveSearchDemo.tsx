import React, { useState } from "react";
import { ExternalLink, CornerDownLeft, RefreshCw } from "lucide-react";

interface SearchResult {
  id: string;
  title: string;
  source: string;
  date: string;
  matchScore: number; // percentage
  snippet: string;
  url: string;
}

const PRESET_QUERIES: { label: string; query: string; results: SearchResult[] }[] = [
  {
    label: "SQLite Performance Tuesday",
    query: "I was reading something about SQLite performance last Tuesday",
    results: [
      {
        id: "res-1",
        title: "SQLite in Production: WAL Mode, Page Cache, and 100k QPS",
        source: "simonwillison.net",
        date: "Tuesday, 2:40 PM",
        matchScore: 98.4,
        snippet: "“...the key to SQLite read concurrency is enabling WAL mode and setting synchronous=NORMAL. We benchmarked 100k queries per second on Apple Silicon SSDs without lock contention...”",
        url: "https://simonwillison.net/2026/sqlite-wal/",
      },
      {
        id: "res-2",
        title: "sqlite-vss: Vector Search Extension for SQLite",
        source: "github.com/asg017/sqlite-vss",
        date: "Last Tuesday",
        matchScore: 92.1,
        snippet: "“...vss0 virtual table implementation leveraging Faiss HNSW indices for sub-millisecond on-device similarity search directly inside embedded applications...”",
        url: "https://github.com/asg017/sqlite-vss",
      },
    ],
  },
  {
    label: "Auth Cookie Bug in GitHub",
    query: "the conversation about the auth cookie bug in our PR",
    results: [
      {
        id: "res-3",
        title: "PR #412: Support Partitioned CHIPS Cookies in Safari 18",
        source: "github.com/doclify/revia",
        date: "3 days ago",
        matchScore: 97.6,
        snippet: "“...fixing authentication token drops when embedded in cross-site iframes by enforcing the Partitioned attribute alongside SameSite=None and Secure flags...”",
        url: "https://github.com/doclify/revia/pull/412",
      },
    ],
  },
  {
    label: "Maya's Design Tokens",
    query: "Maya's design system color tokens in Figma",
    results: [
      {
        id: "res-4",
        title: "Design Tokens v2.4 — Warm Ivory & Editorial Slates",
        source: "figma.com/@design-core",
        date: "Last week",
        matchScore: 95.8,
        snippet: "“...specifying --bg-ivory (#f7f5f0), --text-ink (#11141a), and subtle 1px specular bevel highlights for the native macOS window frame...”",
        url: "https://figma.com/file/maya-tokens",
      },
    ],
  },
  {
    label: "Docker Pruning Flags",
    query: "docker compose flag for pruning named volumes",
    results: [
      {
        id: "res-5",
        title: "How to completely clean unused Docker Compose volumes",
        source: "stackoverflow.com",
        date: "May 24",
        matchScore: 94.2,
        snippet: "“...use docker compose down -v or docker system prune --volumes to wipe out orphaned local database persistent storage without touching cache...”",
        url: "https://stackoverflow.com/questions/docker-compose-v",
      },
    ],
  },
];

export const InteractiveSearchDemo: React.FC = () => {
  const [currentQuery, setCurrentQuery] = useState(PRESET_QUERIES[0].query);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>(PRESET_QUERIES[0].results);
  const [selectedResult, setSelectedResult] = useState<string | null>(null);

  const executeSearch = (queryText: string, customResults?: SearchResult[]) => {
    setCurrentQuery(queryText);
    setIsSearching(true);
    setSelectedResult(null);

    setTimeout(() => {
      if (customResults) {
        setResults(customResults);
      } else {
        // Find matching preset or generate contextual fallback
        const found = PRESET_QUERIES.find((p) =>
          queryText.toLowerCase().includes(p.query.toLowerCase().slice(0, 10))
        );
        if (found) {
          setResults(found.results);
        } else {
          setResults([
            {
              id: "custom-1",
              title: `Associative Match: "${queryText}"`,
              source: "chrome-history · local database",
              date: "Searched in 7.8ms",
              matchScore: 91.5,
              snippet: `“...synthesizing contextual memory match for your query [${queryText}] across local Chrome history and indexed files...”`,
              url: "#",
            },
          ]);
        }
      }
      setIsSearching(false);
    }, 450);
  };

  return (
    <section
      id="search-demo"
      style={{
        padding: "110px 0 120px 0",
        backgroundColor: "#ffffff",
        position: "relative",
        borderTop: "1px solid var(--border-light-subtle)",
        borderBottom: "1px solid var(--border-light-subtle)",
      }}
      className="texture-grid-subtle"
    >
      <div className="container">
        {/* Section Pill Badge */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11.5px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--accent-cyan)",
              background: "rgba(14, 165, 233, 0.08)",
              padding: "5px 14px",
              borderRadius: "20px",
              border: "1px solid rgba(14, 165, 233, 0.2)",
            }}
          >
            04 // Interactive Product Simulator
          </span>
        </div>

        {/* Narrative Headline */}
        <div style={{ textAlign: "center", maxWidth: "860px", margin: "0 auto 44px auto" }}>
          <h2 className="headline-editorial" style={{ marginBottom: "18px" }}>
            Test the memory core in your browser.
          </h2>
          <p className="lead-paragraph" style={{ maxWidth: "660px", margin: "0 auto" }}>
            Experience how Revia evaluates meaning over keywords. Pick an authentic query below or type your own.
          </p>
        </div>

        {/* Preset Query Badges */}
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
          {PRESET_QUERIES.map((preset) => {
            const isActive = currentQuery === preset.query;
            return (
              <button
                key={preset.label}
                onClick={() => executeSearch(preset.query, preset.results)}
                style={{
                  background: isActive ? "var(--text-ink)" : "#ffffff",
                  color: isActive ? "#ffffff" : "var(--text-lead)",
                  border: isActive ? "1px solid var(--text-ink)" : "1px solid var(--border-light-medium)",
                  borderRadius: "10px",
                  padding: "8px 14px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.18s ease",
                  boxShadow: isActive ? "var(--shadow-sm)" : "none",
                }}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* ====================================================================
            THE AUTHENTIC 420px × 52px REVIA CAPSULE SIMULATOR
            ==================================================================== */}
        <div
          style={{
            maxWidth: "580px",
            margin: "0 auto",
            position: "relative",
          }}
        >
          {/* Top-Right Ambient Positioning Hint */}
          <div
            style={{
              textAlign: "right",
              marginBottom: "8px",
              fontSize: "11px",
              fontFamily: "var(--font-mono)",
              color: "var(--text-muted)",
            }}
          >
            420px × 52px COMPACT CAPSULE
          </div>

          {/* The Capsule */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              executeSearch(currentQuery);
            }}
            style={{
              height: "52px",
              background: "#0c0f16",
              borderRadius: "26px",
              border: "1px solid rgba(255, 255, 255, 0.18)",
              boxShadow: "0 20px 45px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(99, 102, 241, 0.25)",
              display: "flex",
              alignItems: "center",
              padding: "0 14px",
              gap: "12px",
              position: "relative",
            }}
          >
            {/* Core Orb */}
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: "radial-gradient(circle at 35% 30%, #ffffff 0%, #c7d2fe 60%, #6366f1 100%)",
                boxShadow: isSearching ? "0 0 16px #38bdf8" : "0 0 10px rgba(99, 102, 241, 0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "box-shadow 0.2s ease",
              }}
            >
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ffffff" }} />
            </div>

            {/* Live Search Input */}
            <input
              type="text"
              value={currentQuery}
              onChange={(e) => setCurrentQuery(e.target.value)}
              placeholder="What do you remember?"
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#ffffff",
                fontSize: "14px",
                fontFamily: "var(--font-body)",
              }}
            />

            {/* Action Return Button */}
            <button
              type="submit"
              style={{
                background: isSearching ? "rgba(56, 189, 248, 0.2)" : "rgba(255, 255, 255, 0.1)",
                border: "none",
                borderRadius: "8px",
                padding: "6px 10px",
                color: isSearching ? "#38bdf8" : "rgba(255, 255, 255, 0.6)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "11px",
                fontFamily: "var(--font-mono)",
                transition: "all 0.15s ease",
              }}
            >
              {isSearching ? (
                <>
                  <RefreshCw size={12} className="spinning" />
                  <span>Matching</span>
                </>
              ) : (
                <>
                  <span>Return</span>
                  <CornerDownLeft size={12} />
                </>
              )}
            </button>
          </form>

          {/* =======================================================
              SURFACED MEMORY RESULTS LIST
              ======================================================= */}
          <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
            {results.map((result) => {
              const isSelected = selectedResult === result.id;
              return (
                <div
                  key={result.id}
                  onClick={() => setSelectedResult(result.id)}
                  style={{
                    background: isSelected ? "#0f1523" : "#ffffff",
                    border: isSelected ? "1.5px solid #6366f1" : "1px solid var(--border-light-medium)",
                    borderRadius: "16px",
                    padding: "18px 20px",
                    boxShadow: isSelected ? "var(--shadow-md)" : "var(--shadow-sm)",
                    cursor: "pointer",
                    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "11.5px", fontFamily: "var(--font-mono)", color: "#6366f1", fontWeight: 700 }}>
                        {result.source}
                      </span>
                      <span style={{ color: "var(--border-light-strong)" }}>·</span>
                      <span style={{ fontSize: "11.5px", color: isSelected ? "#94a3b8" : "var(--text-muted)" }}>
                        {result.date}
                      </span>
                    </div>

                    <div
                      style={{
                        fontSize: "11px",
                        fontFamily: "var(--font-mono)",
                        color: "#059669",
                        background: "rgba(16, 185, 129, 0.1)",
                        padding: "2px 8px",
                        borderRadius: "6px",
                        fontWeight: 700,
                      }}
                    >
                      {result.matchScore}% Match
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: "14.5px",
                      fontWeight: 700,
                      color: isSelected ? "#ffffff" : "var(--text-ink)",
                      marginBottom: "6px",
                    }}
                  >
                    {result.title}
                  </div>

                  <p
                    style={{
                      fontSize: "12.5px",
                      lineHeight: 1.5,
                      color: isSelected ? "#cbd5e1" : "var(--text-body)",
                      marginBottom: "8px",
                    }}
                  >
                    {result.snippet}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "11.5px",
                      fontFamily: "var(--font-mono)",
                      color: isSelected ? "#38bdf8" : "var(--text-muted)",
                    }}
                  >
                    <span>Press Return to open in default browser</span>
                    <ExternalLink size={12} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Transparent Simulation Notice */}
          <div
            style={{
              textAlign: "center",
              marginTop: "20px",
              fontSize: "11px",
              fontFamily: "var(--font-mono)",
              color: "var(--text-muted)",
            }}
          >
            [ CONCEPTUAL INTERACTIVE DEMO · RUNS SAME RETRIEVAL SPECIFICATION AS MAC APP ]
          </div>
        </div>
      </div>

      <style>{`
        .spinning {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
};
