import React, { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  Mic,
  MicOff,
  ExternalLink,
  Copy,
  Maximize2,
  Minimize2,
  Settings,
  X,
  Globe,
  Clock,
  Flame,
  Check,
  Pause,
} from "lucide-react";
import { ReviaOrb, OrbState } from "./ReviaOrb";
import { MemoryItem, MemoryStats } from "../types";

interface CompactAssistantProps {
  query: string;
  onQueryChange: (q: string) => void;
  results: MemoryItem[];
  isLoading: boolean;
  isPaused: boolean;
  isListening: boolean;
  interimTranscript: string;
  audioLevel: number;
  onToggleVoice: () => void;
  onSelectResult: (item: MemoryItem) => void;
  onOpenSettings: () => void;
  onTogglePause: () => void;
  stats: MemoryStats | null;
}

export const CompactAssistant: React.FC<CompactAssistantProps> = ({
  query,
  onQueryChange,
  results,
  isLoading,
  isPaused,
  isListening,
  interimTranscript,
  audioLevel,
  onToggleVoice,
  onSelectResult,
  onOpenSettings,
  onTogglePause,
  stats,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  // Determine current orb state
  let orbState: OrbState = "idle";
  if (isListening) orbState = "listening";
  else if (isLoading) orbState = "searching";
  else if (results.length > 0 && query.trim().length > 0) orbState = "results";

  // Auto-focus input on mount and keep focus
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Window shown event refocus
  useEffect(() => {
    const handleFocus = () => {
      inputRef.current?.focus();
      inputRef.current?.select();
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  // Update selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, results.length]);

  // Adjust native window height dynamically based on state
  useEffect(() => {
    let targetHeight = 56;
    if (results.length > 0) {
      targetHeight = isExpanded ? 500 : 330;
    } else if (query.trim().length > 0 && !isLoading) {
      targetHeight = 160; // Empty results state
    }
    invoke("set_window_height", { height: targetHeight }).catch(() => {});
  }, [results.length, isExpanded, query, isLoading]);

  // Scroll active item into view
  useEffect(() => {
    if (resultsContainerRef.current && results.length > 0) {
      const activeEl = resultsContainerRef.current.children[selectedIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex, results.length]);

  const handleCopy = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (results.length > 0) {
        setSelectedIndex((prev) => (prev + 1) % results.length);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (results.length > 0) {
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results.length > 0 && selectedIndex >= 0 && selectedIndex < results.length) {
        onSelectResult(results[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      if (query.trim().length > 0) {
        onQueryChange("");
      } else {
        invoke("hide_search_window");
      }
    } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "e") {
      e.preventDefault();
      setIsExpanded((prev) => !prev);
    } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "m") {
      e.preventDefault();
      onToggleVoice();
    } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "c") {
      if (results.length > 0 && selectedIndex >= 0 && selectedIndex < results.length) {
        e.preventDefault();
        const activeUrl = results[selectedIndex].url;
        navigator.clipboard.writeText(activeUrl);
        setCopiedUrl(activeUrl);
        setTimeout(() => setCopiedUrl(null), 1500);
      }
    }
  };

  const displayResults = isExpanded ? results : results.slice(0, 3);

  return (
    <div
      className="revia-floating-assistant"
      onKeyDown={handleKeyDown}
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        borderRadius: "16px",
        background: "var(--assistant-bg)",
        backdropFilter: "blur(32px) saturate(190%)",
        WebkitBackdropFilter: "blur(32px) saturate(190%)",
        border: "1px solid var(--assistant-border)",
        boxShadow: "var(--assistant-shadow)",
        overflow: "hidden",
        transition: "box-shadow 0.2s ease, border-color 0.2s ease",
      }}
    >
      {/* PRIMARY FLOATING SEARCH BAR */}
      <div
        className="titlebar-drag"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "10px 14px",
          minHeight: "56px",
          position: "relative",
        }}
      >
        {/* Animated Holographic Revia Orb */}
        <div className="no-drag">
          <ReviaOrb
            state={orbState}
            audioLevel={audioLevel}
            size={26}
            onClick={onToggleVoice}
          />
        </div>

        {/* Search Input & Live Voice Transcription */}
        <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center" }} className="no-drag">
          <input
            ref={inputRef}
            type="text"
            value={isListening ? (interimTranscript || query) : query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={isListening ? "Listening to your voice..." : "What do you remember?"}
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              outline: "none",
              color: isListening ? "var(--accent)" : "var(--text-primary)",
              fontSize: "15px",
              fontFamily: "inherit",
              fontWeight: 500,
              letterSpacing: "-0.01em",
            }}
          />

          {/* Audio Waveform Ripple Visualizer when listening */}
          {isListening && (
            <div
              style={{
                position: "absolute",
                right: "4px",
                display: "flex",
                alignItems: "center",
                gap: "2.5px",
                pointerEvents: "none",
              }}
            >
              {[0.4, 0.9, 0.6, 1.0, 0.5, 0.8].map((h, i) => (
                <div
                  key={i}
                  style={{
                    width: "2.5px",
                    height: `${Math.max(6, (audioLevel * 24 + 6) * h)}px`,
                    background: "var(--accent)",
                    borderRadius: "2px",
                    transition: "height 0.08s ease",
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Action Controls on the Right */}
        <div className="no-drag" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {/* Clear Button */}
          {query.trim().length > 0 && !isListening && (
            <button
              onClick={() => onQueryChange("")}
              title="Clear (Esc)"
              style={{
                background: "var(--bg-pill)",
                border: "none",
                borderRadius: "50%",
                width: "20px",
                height: "20px",
                color: "var(--text-tertiary)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "11px",
              }}
            >
              <X size={12} />
            </button>
          )}

          {/* Paused Memory Badge */}
          {isPaused && (
            <button
              onClick={onTogglePause}
              title="Memory is paused. Click to resume."
              style={{
                background: "rgba(245, 158, 11, 0.2)",
                border: "1px solid rgba(245, 158, 11, 0.4)",
                borderRadius: "6px",
                padding: "3px 6px",
                color: "var(--warning)",
                fontSize: "10.5px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "3px",
              }}
            >
              <Pause size={10} />
              <span>Paused</span>
            </button>
          )}

          {/* Voice Microphone Control */}
          <button
            onClick={onToggleVoice}
            title={isListening ? "Stop listening (⌘M)" : "Speak what you remember (⌘M)"}
            style={{
              background: isListening
                ? "radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, rgba(6, 182, 212, 0.15) 100%)"
                : "var(--bg-pill)",
              border: isListening ? "1px solid rgba(16, 185, 129, 0.6)" : "1px solid var(--border-subtle)",
              borderRadius: "8px",
              padding: "6px 8px",
              color: isListening ? "var(--success)" : "var(--text-secondary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              transition: "all 0.15s ease",
            }}
          >
            {isListening ? <MicOff size={14} /> : <Mic size={14} />}
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            title={stats ? `${stats.total_items} indexed memories · Settings` : "Settings"}
            style={{
              background: "var(--bg-pill)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "8px",
              padding: "6px",
              color: "var(--text-secondary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Settings size={14} />
          </button>
        </div>
      </div>

      {/* RESULTS LIST SECTION (APPEARS UNDER QUERY) */}
      {results.length > 0 && (
        <div
          style={{
            borderTop: "1px solid var(--border-subtle)",
            display: "flex",
            flexDirection: "column",
            maxHeight: isExpanded ? "400px" : "240px",
            overflow: "hidden",
            animation: "fadeInExpand 0.2s ease-out",
          }}
        >
          <div
            ref={resultsContainerRef}
            style={{
              padding: "8px 10px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            {displayResults.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => onSelectResult(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    borderRadius: "10px",
                    background: isSelected ? "var(--bg-card-selected)" : "transparent",
                    border: isSelected ? "1px solid var(--border-selected)" : "1px solid transparent",
                    cursor: "pointer",
                    transition: "all 0.12s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", overflow: "hidden", flex: 1 }}>
                    <div
                      style={{
                        width: "26px",
                        height: "26px",
                        borderRadius: "7px",
                        background: isSelected ? "rgba(59, 130, 246, 0.3)" : "var(--bg-pill)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: isSelected ? "var(--accent)" : "var(--text-secondary)",
                        flexShrink: 0,
                      }}
                    >
                      <Globe size={13} />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "2px", overflow: "hidden", flex: 1 }}>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "var(--text-primary)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {item.title}
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "var(--text-tertiary)" }}>
                        <span style={{ fontWeight: 600, color: isSelected ? "var(--accent)" : "var(--text-secondary)" }}>
                          {item.domain}
                        </span>
                        <span>·</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                          <Clock size={10} />
                          {item.relative_time ?? "Recently"}
                        </span>
                        {item.visit_count > 1 && (
                          <>
                            <span>·</span>
                            <span style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                              <Flame size={10} color="var(--warning)" />
                              {item.visit_count}x
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions on active item */}
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginLeft: "10px", flexShrink: 0 }}>
                    <button
                      onClick={(e) => handleCopy(e, item.url)}
                      title="Copy URL (⌘C)"
                      style={{
                        background: copiedUrl === item.url ? "rgba(16, 185, 129, 0.2)" : "var(--bg-pill)",
                        border: "none",
                        borderRadius: "5px",
                        padding: "4px 7px",
                        color: copiedUrl === item.url ? "var(--success)" : "var(--text-secondary)",
                        cursor: "pointer",
                        fontSize: "10.5px",
                        display: "flex",
                        alignItems: "center",
                        gap: "3px",
                      }}
                    >
                      {copiedUrl === item.url ? <Check size={11} /> : <Copy size={11} />}
                      <span>{copiedUrl === item.url ? "Copied" : "Copy"}</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectResult(item);
                      }}
                      title="Open (↵)"
                      style={{
                        background: isSelected ? "var(--accent)" : "var(--bg-pill)",
                        color: isSelected ? "#ffffff" : "var(--text-primary)",
                        border: "none",
                        borderRadius: "5px",
                        padding: "4px 8px",
                        cursor: "pointer",
                        fontSize: "11px",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: "3px",
                      }}
                    >
                      <span>Open</span>
                      <ExternalLink size={11} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* COMPACT FOOTER ACTIONS BAR */}
          <div
            style={{
              padding: "6px 14px",
              borderTop: "1px solid var(--border-subtle)",
              background: "rgba(0, 0, 0, 0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "11px",
              color: "var(--text-tertiary)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span>
                <kbd style={{ background: "var(--bg-pill)", padding: "1px 4px", borderRadius: "3px" }}>↵</kbd> Open
              </span>
              <span>
                <kbd style={{ background: "var(--bg-pill)", padding: "1px 4px", borderRadius: "3px" }}>↑↓</kbd> Navigate
              </span>
              <span>
                <kbd style={{ background: "var(--bg-pill)", padding: "1px 4px", borderRadius: "3px" }}>Esc</kbd> Dismiss
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                onClick={() => setIsExpanded((prev) => !prev)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--accent)",
                  fontWeight: 600,
                  fontSize: "11px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                {isExpanded ? (
                  <>
                    <Minimize2 size={12} />
                    <span>Collapse</span>
                  </>
                ) : (
                  <>
                    <Maximize2 size={12} />
                    <span>Expand ({results.length})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EMPTY RESULT STATE */}
      {query.trim().length > 0 && results.length === 0 && !isLoading && (
        <div
          style={{
            borderTop: "1px solid var(--border-subtle)",
            padding: "16px",
            textAlign: "center",
            fontSize: "12.5px",
            color: "var(--text-secondary)",
          }}
        >
          <div>Nothing found for "{query}"</div>
          <div style={{ fontSize: "11.5px", color: "var(--text-tertiary)", marginTop: "3px" }}>
            Try describing the topic, site name, or when you visited it (e.g. "React yesterday").
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInExpand {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
