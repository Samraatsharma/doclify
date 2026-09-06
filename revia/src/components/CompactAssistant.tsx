import React, { useState, useEffect, useRef, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { requiresAccessibilityPermission } from "../utils/platform";
import {
  Mic,
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
  Search,
} from "lucide-react";
import { ReviaOrb, OrbState } from "./ReviaOrb";
import { MemoryItem, MemoryStats } from "../types";

interface CompactAssistantProps {
  query: string;
  onQueryChange: (q: string) => void;
  results: MemoryItem[];
  isLoading: boolean;
  isIndexing?: boolean;
  isPaused: boolean;
  isListening: boolean;
  interimTranscript: string;
  audioLevel: number;
  voiceError?: string | null;
  onOpenMicrophoneSettings?: () => void;
  onToggleVoice: () => void;
  onSelectResult: (item: MemoryItem) => void;
  onOpenSettings: () => void;
  onTogglePause?: () => void;
  onDismiss?: () => void;
  stats: MemoryStats | null;
  isSettingsOpen?: boolean;
}

export const CompactAssistant: React.FC<CompactAssistantProps> = ({
  query,
  onQueryChange,
  results,
  isLoading,
  isIndexing = false,
  isPaused,
  isListening,
  interimTranscript,
  audioLevel,
  voiceError,
  onOpenMicrophoneSettings,
  onToggleVoice,
  onSelectResult,
  onOpenSettings,
  onTogglePause: _onTogglePause,
  onDismiss,
  stats,
  isSettingsOpen = false,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [isDismissing, setIsDismissing] = useState<boolean>(false);
  const [hasAccessibility, setHasAccessibility] = useState<boolean>(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  // Dynamic Orb State
  let orbState: OrbState = "idle";
  if (isListening) orbState = "listening";
  else if (isLoading) orbState = "searching";
  else if (results.length > 0 && query.trim().length > 0) orbState = "results";

  // Check accessibility permission on mount and focus
  const checkAccessibility = useCallback(async () => {
    try {
      const trusted = await invoke<boolean>("check_accessibility_permission");
      setHasAccessibility(trusted);
    } catch {
      setHasAccessibility(true);
    }
  }, []);

  useEffect(() => {
    checkAccessibility();
  }, [checkAccessibility]);

  // Focus input immediately on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Listen to window-shown and native focus events to refocus input instantly
  useEffect(() => {
    const handleFocus = () => {
      inputRef.current?.focus();
      inputRef.current?.select();
      checkAccessibility();
    };
    window.addEventListener("focus", handleFocus);

    let unlisten: (() => void) | undefined;
    listen("window-shown", () => {
      setIsDismissing(false);
      checkAccessibility();
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 20);
    }).then((u) => {
      unlisten = u;
    });

    return () => {
      window.removeEventListener("focus", handleFocus);
      if (unlisten) unlisten();
    };
  }, [checkAccessibility]);

  // Reset selected index on query or results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, results.length]);

  // Adjust native window height dynamically based on state
  useEffect(() => {
    if (isSettingsOpen) return; // Do not shrink window if settings modal is open

    let extra = 0;
    if (!hasAccessibility) extra += 28;
    if (voiceError) extra += 28;

    let targetHeight = 52 + extra;
    if (results.length > 0) {
      targetHeight = isExpanded ? 440 + extra : Math.min(320 + extra, 52 + extra + Math.min(results.length, 3) * 72 + 38);
    } else if (query.trim().length > 0 || isIndexing) {
      // Accommodates searching indicator, indexing indicator, or differentiated empty state
      targetHeight = 110 + extra;
    }
    invoke("set_window_height", { height: targetHeight }).catch(() => {});
  }, [results.length, isExpanded, query, isLoading, isIndexing, hasAccessibility, voiceError, isSettingsOpen]);

  // Auto-scroll selected card into view
  useEffect(() => {
    if (resultsContainerRef.current && results.length > 0) {
      const activeEl = resultsContainerRef.current.children[selectedIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [selectedIndex, results.length]);

  const handleCopy = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 1400);
  };

  const handleDismiss = () => {
    setIsDismissing(true);
    setTimeout(() => {
      if (onDismiss) {
        onDismiss();
      } else {
        invoke("hide_search_window").catch(() => {});
      }
      setIsDismissing(false);
    }, 140);
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
        const item = results[selectedIndex];
        setIsDismissing(true);
        setTimeout(() => {
          onSelectResult(item);
        }, 100);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleDismiss();
    } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "q") {
      e.preventDefault();
      invoke("exit_app").catch(() => {});
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
        setTimeout(() => setCopiedUrl(null), 1400);
      }
    }
  };

  const displayResults = isExpanded ? results : results.slice(0, 3);

  return (
    <div
      className={`revia-floating-assistant ${isDismissing ? "animate-dematerialize" : "animate-materialize"}`}
      onKeyDown={handleKeyDown}
      style={{
        display: "flex",
        flexDirection: "column",
        width: "420px",
        maxWidth: "420px",
        borderRadius: results.length > 0 || (query.trim().length > 0 && !isLoading) || !hasAccessibility || Boolean(voiceError) ? "22px" : "9999px",
        background: "linear-gradient(145deg, rgba(20, 24, 38, 0.86) 0%, rgba(10, 13, 22, 0.92) 100%)",
        backdropFilter: "blur(48px) saturate(210%) contrast(108%)",
        WebkitBackdropFilter: "blur(48px) saturate(210%) contrast(108%)",
        border: "1px solid rgba(255, 255, 255, 0.16)",
        boxShadow: isListening
          ? "0 20px 48px -10px rgba(0, 0, 0, 0.8), 0 0 28px -2px rgba(16, 185, 129, 0.4), inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.45), inset 0 -1px 1px 0 rgba(0, 0, 0, 0.6)"
          : "0 20px 48px -10px rgba(0, 0, 0, 0.8), 0 0 24px -2px rgba(99, 102, 241, 0.2), inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.38), inset 0 -1px 1px 0 rgba(0, 0, 0, 0.6)",
        boxSizing: "border-box",
        overflow: "hidden",
        transition: "border-radius 0.22s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.22s ease",
      }}
    >
      {/* 1. COMPACT HORIZONTAL ASSISTANT CAPSULE (420px x 52px) */}
      <div
        className="titlebar-drag"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "0 14px",
          height: "52px",
          minHeight: "52px",
          position: "relative",
          boxSizing: "border-box",
        }}
      >
        {/* Animated 3D Revia Memory Core Orb */}
        <div className="no-drag" style={{ display: "flex", alignItems: "center" }}>
          <ReviaOrb
            state={orbState}
            audioLevel={audioLevel}
            size={26}
            onClick={onToggleVoice}
          />
        </div>

        {/* Search Field & Voice Transcription */}
        <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center" }} className="no-drag">
          <input
            ref={inputRef}
            type="text"
            value={isListening ? (interimTranscript || query) : query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={
              isListening
                ? "Listening... speak now"
                : isPaused
                ? "Memory is paused"
                : "What do you remember?"
            }
            disabled={isPaused}
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              outline: "none",
              color: isListening ? "#34d399" : "#f1f5f9",
              fontSize: "14px",
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontWeight: 450,
              letterSpacing: "-0.01em",
              paddingRight: isListening ? "50px" : "20px",
            }}
          />

          {/* Real-time Voice Audio Waveform Equalizer */}
          {isListening && (
            <div
              style={{
                position: "absolute",
                right: "4px",
                display: "flex",
                alignItems: "center",
                gap: "2px",
                pointerEvents: "none",
              }}
            >
              {[0.4, 0.9, 0.6, 1.0, 0.7].map((h, i) => (
                <div
                  key={i}
                  style={{
                    width: "2px",
                    height: `${Math.max(4, (audioLevel * 18 + 3) * h)}px`,
                    background: "#10b981",
                    borderRadius: "2px",
                    boxShadow: "0 0 4px rgba(16, 185, 129, 0.7)",
                    transition: "height 0.06s ease",
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Clean Controls: Microphone, Settings, Close */}
        <div className="no-drag" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {/* PRIMARY INTERACTION: Tactile Glowing Microphone Button */}
          <button
            onClick={onToggleVoice}
            title={isListening ? "Stop listening (⌘M)" : "Search with voice (⌘M)"}
            style={{
              background: isListening
                ? "linear-gradient(135deg, rgba(16, 185, 129, 0.35) 0%, rgba(6, 182, 212, 0.25) 100%)"
                : "linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(139, 92, 246, 0.18) 100%)",
              border: isListening
                ? "1px solid rgba(16, 185, 129, 0.75)"
                : "1px solid rgba(99, 102, 241, 0.45)",
              boxShadow: isListening
                ? "0 0 20px rgba(16, 185, 129, 0.65), inset 0 1px 2px rgba(255, 255, 255, 0.5)"
                : "0 0 14px rgba(99, 102, 241, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.25)",
              borderRadius: "16px",
              padding: "0 10px",
              height: "30px",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              color: isListening ? "#34d399" : "#ffffff",
              cursor: "pointer",
              transition: "all 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
            onMouseEnter={(e) => {
              if (!isListening) {
                e.currentTarget.style.boxShadow = "0 0 18px rgba(99, 102, 241, 0.55), inset 0 1px 1px rgba(255, 255, 255, 0.4)";
                e.currentTarget.style.borderColor = "rgba(99, 102, 241, 0.7)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isListening) {
                e.currentTarget.style.boxShadow = "0 0 14px rgba(99, 102, 241, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.25)";
                e.currentTarget.style.borderColor = "rgba(99, 102, 241, 0.45)";
              }
            }}
          >
            {isListening ? (
              <>
                <Mic size={13} className="animate-pulse" />
                <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "-0.01em" }}>Listening</span>
              </>
            ) : (
              <>
                <Mic size={13} style={{ color: "#818cf8" }} />
                <span style={{ fontSize: "11px", fontWeight: 550, color: "rgba(255, 255, 255, 0.9)" }}>Voice</span>
              </>
            )}
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            title="Settings"
            style={{
              background: "transparent",
              border: "none",
              borderRadius: "50%",
              width: "24px",
              height: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(255, 255, 255, 0.45)",
              cursor: "pointer",
              transition: "color 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255, 255, 255, 0.85)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255, 255, 255, 0.45)")}
          >
            <Settings size={13} />
          </button>

          {/* Dismiss / Close Button */}
          <button
            onClick={handleDismiss}
            title="Dismiss (Esc)"
            style={{
              background: "transparent",
              border: "none",
              borderRadius: "50%",
              width: "24px",
              height: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(255, 255, 255, 0.45)",
              cursor: "pointer",
              transition: "color 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255, 255, 255, 0.85)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255, 255, 255, 0.45)")}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Accessibility Permission Banner - macOS only */}
      {requiresAccessibilityPermission() && !hasAccessibility && (
        <div
          className="no-drag"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "5px 12px",
            background: "rgba(234, 179, 8, 0.14)",
            borderTop: "1px solid rgba(234, 179, 8, 0.25)",
            fontSize: "11px",
            color: "#fef08a",
            boxSizing: "border-box",
          }}
        >
          <span style={{ fontWeight: 500 }}>
            Accessibility is only required for ⌃⌃ shortcut
          </span>
          <button
            onClick={() => {
              invoke("request_accessibility_permission").catch(() => {});
              invoke("open_accessibility_settings").catch(() => {});
              setTimeout(checkAccessibility, 1500);
              setTimeout(checkAccessibility, 3500);
            }}
            style={{
              background: "rgba(234, 179, 8, 0.25)",
              border: "1px solid rgba(234, 179, 8, 0.45)",
              borderRadius: "5px",
              padding: "2px 8px",
              color: "#fff",
              fontSize: "10.5px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Grant Access
          </button>
        </div>
      )}

      {/* Voice Error Banner */}
      {voiceError && (
        <div
          className="no-drag"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "5px 12px",
            background: "rgba(239, 68, 68, 0.15)",
            borderTop: "1px solid rgba(239, 68, 68, 0.3)",
            fontSize: "11px",
            color: "#fca5a5",
            boxSizing: "border-box",
          }}
        >
          <span style={{ fontWeight: 500 }}>{voiceError}</span>
          {onOpenMicrophoneSettings && (
            <button
              onClick={onOpenMicrophoneSettings}
              style={{
                background: "rgba(239, 68, 68, 0.25)",
                border: "1px solid rgba(239, 68, 68, 0.45)",
                borderRadius: "5px",
                padding: "2px 8px",
                color: "#fff",
                fontSize: "10.5px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Settings
            </button>
          )}
        </div>
      )}

      {/* 2. RESULTS CONTAINER (Smooth Downward Expansion) */}
      {results.length > 0 && (
        <div
          style={{
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            background: "rgba(0, 0, 0, 0.15)",
            display: "flex",
            flexDirection: "column",
            maxHeight: isExpanded ? "380px" : "260px",
            transition: "max-height 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {/* Results List */}
          <div
            ref={resultsContainerRef}
            className="no-drag"
            style={{
              overflowY: "auto",
              padding: "6px 8px",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            {displayResults.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => onSelectResult(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 10px",
                    borderRadius: "10px",
                    background: isSelected ? "rgba(255, 255, 255, 0.12)" : "rgba(255, 255, 255, 0.03)",
                    border: isSelected ? "1px solid rgba(255, 255, 255, 0.2)" : "1px solid transparent",
                    cursor: "pointer",
                    transition: "all 0.1s ease-out",
                  }}
                >
                  {/* Left info: Globe, Title, Domain, Time */}
                  <div style={{ flex: 1, minWidth: 0, marginRight: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                      <Globe size={12} style={{ color: isSelected ? "#38bdf8" : "rgba(255, 255, 255, 0.4)", flexShrink: 0 }} />
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: isSelected ? 600 : 450,
                          color: isSelected ? "#ffffff" : "rgba(255, 255, 255, 0.85)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.title || item.url}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", color: "rgba(255, 255, 255, 0.45)" }}>
                      <span
                        style={{
                          background: "rgba(255, 255, 255, 0.08)",
                          padding: "1px 5px",
                          borderRadius: "4px",
                          fontWeight: 500,
                          color: "rgba(255, 255, 255, 0.7)",
                        }}
                      >
                        {item.domain}
                      </span>

                      {item.relative_time && (
                        <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                          <Clock size={10} />
                          {item.relative_time}
                        </span>
                      )}

                      {item.visit_count > 1 && (
                        <span style={{ display: "flex", alignItems: "center", gap: "2px", color: "#f59e0b" }}>
                          <Flame size={10} />
                          {item.visit_count}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right quick actions */}
                  <div style={{ display: "flex", alignItems: "center", gap: "2px" }} onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => handleCopy(e, item.url)}
                      title="Copy URL (⌘C)"
                      style={{
                        background: "transparent",
                        border: "none",
                        padding: "4px",
                        borderRadius: "5px",
                        color: copiedUrl === item.url ? "#10b981" : "rgba(255, 255, 255, 0.4)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {copiedUrl === item.url ? <Check size={12} /> : <Copy size={12} />}
                    </button>

                    <button
                      onClick={() => onSelectResult(item)}
                      title="Open in browser (Enter)"
                      style={{
                        background: "transparent",
                        border: "none",
                        padding: "4px",
                        borderRadius: "5px",
                        color: isSelected ? "#38bdf8" : "rgba(255, 255, 255, 0.4)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <ExternalLink size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Bar: Stats & Navigation Guide */}
          <div
            className="titlebar-drag"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "5px 12px",
              borderTop: "1px solid rgba(255, 255, 255, 0.06)",
              fontSize: "10.5px",
              color: "rgba(255, 255, 255, 0.4)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span>{results.length} found</span>
              {stats && <span>• {stats.total_items.toLocaleString()} indexed</span>}
            </div>

            <div className="no-drag" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span>↑↓ Navigate</span>
              <span>↵ Open</span>
              <span>Esc Close</span>

              {results.length > 3 && (
                <button
                  onClick={() => setIsExpanded((prev) => !prev)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#38bdf8",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "2px",
                    fontSize: "10.5px",
                    fontWeight: 600,
                  }}
                >
                  {isExpanded ? <Minimize2 size={10} /> : <Maximize2 size={10} />}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2.5 SEARCHING STATE */}
      {query.trim().length > 0 && isLoading && results.length === 0 && (
        <div
          className="no-drag"
          style={{
            padding: "16px 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            background: "rgba(0, 0, 0, 0.12)",
            color: "rgba(255, 255, 255, 0.65)",
            fontSize: "12.5px",
          }}
        >
          <div
            style={{
              width: "13px",
              height: "13px",
              borderRadius: "50%",
              border: "2px solid #38bdf8",
              borderTopColor: "transparent",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <span>Searching your memory…</span>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* 3. DIFFERENTIATED EMPTY & STATUS STATES */}
      {query.trim().length > 0 && results.length === 0 && !isLoading && (
        <div
          className="no-drag"
          style={{
            padding: "16px 14px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            gap: "4px",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            background: "rgba(0, 0, 0, 0.12)",
          }}
        >
          {isIndexing ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#38bdf8", fontSize: "13px", fontWeight: 600 }}>
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    border: "2px solid #38bdf8",
                    borderTopColor: "transparent",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
                <span>Memory is indexing...</span>
              </div>
              <span style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.45)" }}>
                Reading new history items from Chrome
              </span>
            </>
          ) : (!stats || stats.total_items === 0) ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#f59e0b", fontSize: "13px", fontWeight: 600 }}>
                <Search size={14} />
                <span>No browsing history found</span>
              </div>
              <span style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.45)" }}>
                Visit websites in Chrome or check permissions in Settings
              </span>
            </>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "rgba(255, 255, 255, 0.7)", fontSize: "13px", fontWeight: 600 }}>
                <Search size={14} />
                <span>No matches found</span>
              </div>
              <span style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.45)" }}>
                No results for "{query.trim()}" in {stats.total_items.toLocaleString()} remembered pages
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CompactAssistant;
