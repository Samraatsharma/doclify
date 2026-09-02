import React from "react";
import { invoke } from "@tauri-apps/api/core";
import { Settings, Pause, Play, X, Compass } from "lucide-react";
import { MemoryStats } from "../types";

interface HeaderBarProps {
  stats: MemoryStats | null;
  isPaused: boolean;
  onTogglePause: () => void;
  onOpenSettings: () => void;
  isIndexing: boolean;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  stats,
  isPaused,
  onTogglePause,
  onOpenSettings,
  isIndexing,
}) => {
  const handleClose = async () => {
    try {
      await invoke("hide_search_window");
    } catch (e) {
      console.error("Failed to hide window:", e);
    }
  };

  return (
    <header className="titlebar-drag" style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "10px 16px",
      borderBottom: "1px solid var(--border-subtle)",
      background: "rgba(0, 0, 0, 0.12)",
      minHeight: "44px",
    }}>
      {/* App Identity */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{
          width: "24px",
          height: "24px",
          borderRadius: "6px",
          background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 6px rgba(59, 130, 246, 0.4)"
        }}>
          <Compass size={14} color="#ffffff" strokeWidth={2.4} />
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontWeight: 700, fontSize: "14px", letterSpacing: "-0.01em", color: "var(--text-primary)" }}>
              Revia
            </span>
            <span style={{
              fontSize: "10px",
              padding: "2px 6px",
              borderRadius: "10px",
              background: isPaused
                ? "rgba(245, 158, 11, 0.15)"
                : isIndexing
                ? "rgba(59, 130, 246, 0.15)"
                : "rgba(16, 185, 129, 0.15)",
              color: isPaused
                ? "var(--warning)"
                : isIndexing
                ? "var(--accent)"
                : "var(--success)",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}>
              <span style={{
                width: "5px",
                height: "5px",
                borderRadius: "50%",
                background: "currentColor"
              }} />
              {isPaused ? "Paused" : isIndexing ? "Indexing..." : `${stats?.total_items ?? 0} memories`}
            </span>
          </div>
        </div>
      </div>

      {/* Action controls */}
      <div className="no-drag" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        {/* Pause / Resume Button */}
        <button
          onClick={onTogglePause}
          title={isPaused ? "Resume Memory Indexing" : "Pause Memory Indexing"}
          style={{
            background: isPaused ? "rgba(245, 158, 11, 0.2)" : "var(--bg-pill)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "6px",
            color: isPaused ? "var(--warning)" : "var(--text-secondary)",
            padding: "5px 8px",
            fontSize: "12px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "5px",
            transition: "all 0.15s ease",
          }}
        >
          {isPaused ? <Play size={12} fill="currentColor" /> : <Pause size={12} />}
          <span style={{ fontSize: "11px", fontWeight: 500 }}>{isPaused ? "Resume" : "Pause"}</span>
        </button>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          title="Settings"
          style={{
            background: "var(--bg-pill)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "6px",
            color: "var(--text-secondary)",
            padding: "5px 7px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.15s ease",
          }}
        >
          <Settings size={14} />
        </button>

        {/* Dismiss Button */}
        <button
          onClick={handleClose}
          title="Dismiss Window (Esc)"
          style={{
            background: "var(--bg-pill)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "6px",
            color: "var(--text-secondary)",
            padding: "5px 7px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.15s ease",
          }}
        >
          <X size={14} />
        </button>
      </div>
    </header>
  );
};
