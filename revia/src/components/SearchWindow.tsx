import React, { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  Search,
  ExternalLink,
  Copy,
  Clock,
  Globe,
  Sparkles,
  Check,
  PauseCircle,
  Flame,
} from "lucide-react";
import { MemoryItem } from "../types";

interface SearchWindowProps {
  query: string;
  onQueryChange: (q: string) => void;
  results: MemoryItem[];
  isLoading: boolean;
  isPaused: boolean;
  onSelectResult: (item: MemoryItem) => void;
  onIndexNow: () => void;
  onResume: () => void;
}

export const SearchWindow: React.FC<SearchWindowProps> = ({
  query,
  onQueryChange,
  results,
  isLoading,
  isPaused,
  onSelectResult,
  onIndexNow,
  onResume,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  // Auto-focus search input on mount and keep selected index within bounds
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query, results.length]);

  // Scroll selected item into view
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
    } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "q") {
      e.preventDefault();
      invoke("exit_app").catch(() => {});
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

  const dateChips = [
    { label: "Today", text: "today" },
    { label: "Yesterday", text: "yesterday" },
    { label: "This Week", text: "this week" },
    { label: "Past 30 Days", text: "past 30 days" },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        height: "calc(100vh - 44px)",
        overflow: "hidden",
      }}
      onKeyDown={handleKeyDown}
    >
      {/* Search Input Box */}
      <div style={{ padding: "12px 16px 8px 16px" }}>
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            background: "var(--bg-input)",
            border: "1px solid var(--border-app)",
            borderRadius: "10px",
            padding: "8px 14px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
          }}
        >
          <Search size={18} color="var(--accent)" style={{ marginRight: "10px", flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="What do you remember? (e.g. 'article about AI', 'github react router')"
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              outline: "none",
              color: "var(--text-primary)",
              fontSize: "15px",
              fontFamily: "inherit",
              fontWeight: 500,
            }}
          />
          {query.trim().length > 0 && (
            <button
              onClick={() => onQueryChange("")}
              style={{
                background: "var(--bg-pill)",
                border: "none",
                borderRadius: "50%",
                width: "18px",
                height: "18px",
                color: "var(--text-tertiary)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "11px",
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Quick Date Filters Chips */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginTop: "8px",
            overflowX: "auto",
            paddingBottom: "2px",
          }}
        >
          <span style={{ fontSize: "11px", color: "var(--text-tertiary)", fontWeight: 500, marginRight: "2px" }}>
            Filter:
          </span>
          {dateChips.map((chip) => {
            const isActive = query.toLowerCase().includes(chip.text);
            return (
              <button
                key={chip.text}
                onClick={() => {
                  if (isActive) {
                    onQueryChange(query.replace(new RegExp(chip.text, "gi"), "").trim());
                  } else {
                    onQueryChange(`${query.trim()} ${chip.text}`.trim());
                  }
                  inputRef.current?.focus();
                }}
                style={{
                  background: isActive ? "var(--accent-subtle)" : "var(--bg-pill)",
                  border: isActive ? "1px solid var(--accent)" : "1px solid var(--border-subtle)",
                  borderRadius: "14px",
                  color: isActive ? "var(--accent)" : "var(--text-secondary)",
                  padding: "2px 9px",
                  fontSize: "11px",
                  fontWeight: 500,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s ease",
                }}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Memory Paused Banner */}
      {isPaused && (
        <div
          style={{
            margin: "0 16px 8px 16px",
            padding: "8px 12px",
            background: "rgba(245, 158, 11, 0.12)",
            border: "1px solid rgba(245, 158, 11, 0.3)",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "12px",
            color: "var(--warning)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <PauseCircle size={14} />
            <span>Memory is paused. Revia is not indexing new browsing history.</span>
          </div>
          <button
            onClick={onResume}
            style={{
              background: "var(--warning)",
              color: "#000000",
              border: "none",
              borderRadius: "5px",
              padding: "3px 8px",
              fontSize: "11px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Resume
          </button>
        </div>
      )}

      {/* Results Container */}
      <div
        ref={resultsContainerRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "0 16px 8px 16px",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
        }}
      >
        {isLoading ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
              color: "var(--text-tertiary)",
              gap: "8px",
            }}
          >
            <div
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                border: "2px solid var(--accent)",
                borderTopColor: "transparent",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <span style={{ fontSize: "13px" }}>Searching your memory...</span>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : results.length > 0 ? (
          results.map((item, idx) => {
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
                  padding: "10px 14px",
                  background: isSelected ? "var(--bg-card-selected)" : "var(--bg-card)",
                  border: isSelected ? "1px solid var(--border-selected)" : "1px solid var(--border-subtle)",
                  borderRadius: "10px",
                  cursor: "pointer",
                  transition: "background 0.1s ease, border-color 0.1s ease",
                  position: "relative",
                }}
              >
                {/* Result Info */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", overflow: "hidden", flex: 1 }}>
                  {/* Domain Icon / Globe */}
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      background: isSelected ? "rgba(59, 130, 246, 0.25)" : "var(--bg-pill)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      color: isSelected ? "var(--accent)" : "var(--text-secondary)",
                    }}
                  >
                    <Globe size={16} />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "3px", overflow: "hidden", flex: 1 }}>
                    {/* Title */}
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: "13.5px",
                        color: isSelected ? "var(--text-primary)" : "var(--text-primary)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.title}
                    </div>

                    {/* Meta Row: Domain + Relative Time + Visit Count */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11.5px" }}>
                      <span
                        style={{
                          fontWeight: 600,
                          color: isSelected ? "var(--accent)" : "var(--text-secondary)",
                        }}
                      >
                        {item.domain}
                      </span>
                      <span style={{ color: "var(--text-tertiary)" }}>·</span>
                      <span style={{ color: "var(--text-tertiary)", display: "flex", alignItems: "center", gap: "3px" }}>
                        <Clock size={11} />
                        {item.relative_time ?? "Recently"}
                      </span>
                      {item.visit_count > 1 && (
                        <>
                          <span style={{ color: "var(--text-tertiary)" }}>·</span>
                          <span
                            style={{
                              color: "var(--text-tertiary)",
                              display: "flex",
                              alignItems: "center",
                              gap: "3px",
                            }}
                          >
                            <Flame size={11} color="var(--warning)" />
                            {item.visit_count} visits
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Action Badges */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginLeft: "12px", flexShrink: 0 }}>
                  <button
                    onClick={(e) => handleCopy(e, item.url)}
                    title="Copy Link (⌘C)"
                    style={{
                      background: copiedUrl === item.url ? "rgba(16, 185, 129, 0.2)" : "var(--bg-pill)",
                      border: "none",
                      borderRadius: "6px",
                      padding: "5px 8px",
                      color: copiedUrl === item.url ? "var(--success)" : "var(--text-secondary)",
                      cursor: "pointer",
                      fontSize: "11px",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    {copiedUrl === item.url ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedUrl === item.url ? "Copied" : "Copy"}</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectResult(item);
                    }}
                    title="Open in Browser (↵)"
                    style={{
                      background: isSelected ? "var(--accent)" : "var(--bg-pill)",
                      border: "none",
                      borderRadius: "6px",
                      padding: "5px 9px",
                      color: isSelected ? "#ffffff" : "var(--text-primary)",
                      cursor: "pointer",
                      fontSize: "11px",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <span>Open</span>
                    <ExternalLink size={12} />
                  </button>
                </div>
              </div>
            );
          })
        ) : query.trim().length > 0 ? (
          /* Empty Search Results */
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
              padding: "30px 20px",
              textAlign: "center",
              color: "var(--text-secondary)",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                background: "var(--bg-pill)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-tertiary)",
              }}
            >
              <Search size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--text-primary)" }}>
                Nothing found for "{query}"
              </div>
              <div style={{ fontSize: "12.5px", color: "var(--text-tertiary)", marginTop: "4px", maxWidth: "340px" }}>
                Try describing the page, website name, or when you saw it (e.g. "React docs yesterday").
              </div>
            </div>
          </div>
        ) : (
          /* Empty Database State */
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
              padding: "40px 20px",
              textAlign: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "var(--accent-subtle)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--accent)",
              }}
            >
              <Sparkles size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "15px", color: "var(--text-primary)" }}>
                Revia hasn't remembered anything yet
              </div>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px", maxWidth: "360px" }}>
                Index your local Google Chrome browsing history to instantly find pages you visited.
              </div>
            </div>
            <button
              onClick={onIndexNow}
              style={{
                marginTop: "4px",
                background: "var(--accent)",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                padding: "8px 18px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 2px 8px var(--accent-glow)",
              }}
            >
              Index Chrome History Now
            </button>
          </div>
        )}
      </div>

      {/* Keyboard navigation footer hint bar */}
      <footer
        style={{
          borderTop: "1px solid var(--border-subtle)",
          padding: "7px 16px",
          background: "rgba(0, 0, 0, 0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "11px",
          color: "var(--text-tertiary)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span>
            <kbd style={{ background: "var(--bg-pill)", padding: "1px 5px", borderRadius: "4px" }}>↑</kbd>
            <kbd style={{ background: "var(--bg-pill)", padding: "1px 5px", borderRadius: "4px", marginLeft: "2px" }}>↓</kbd>
            {" "}Navigate
          </span>
          <span>
            <kbd style={{ background: "var(--bg-pill)", padding: "1px 5px", borderRadius: "4px" }}>↵</kbd> Open
          </span>
          <span>
            <kbd style={{ background: "var(--bg-pill)", padding: "1px 5px", borderRadius: "4px" }}>⌘C</kbd> Copy Link
          </span>
          <span>
            <kbd style={{ background: "var(--bg-pill)", padding: "1px 5px", borderRadius: "4px" }}>Esc</kbd> Close
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{ color: "var(--text-tertiary)" }}>Local-First · Private</span>
        </div>
      </footer>
    </div>
  );
};
