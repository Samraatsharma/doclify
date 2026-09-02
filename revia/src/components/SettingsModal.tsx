import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  X,
  Sliders,
  Database as DbIcon,
  Shield,
  Info,
  RefreshCw,
  Trash2,
  Pause,
  Play,
  Check,
  AlertTriangle,
  HardDrive,
  RotateCcw,
} from "lucide-react";
import { AppSettings, MemoryStats } from "../types";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => Promise<void>;
  stats: MemoryStats | null;
  onRefreshStats: () => Promise<void>;
  onReindex: () => Promise<void>;
  onResetOnboarding: () => void;
  isIndexing: boolean;
}

type TabType = "general" | "memory" | "privacy" | "about";

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  stats,
  onRefreshStats,
  onReindex,
  onResetOnboarding,
  isIndexing,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("general");
  const [shortcut, setShortcut] = useState(settings.global_shortcut);
  const [maxResults, setMaxResults] = useState(settings.max_results);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      invoke("set_window_height", { height: 480 }).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveGeneral = async () => {
    await onUpdateSettings({
      ...settings,
      global_shortcut: shortcut,
      max_results: maxResults,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleClearMemory = async () => {
    setIsClearing(true);
    try {
      await invoke("clear_memory");
      await onRefreshStats();
      setShowClearConfirm(false);
    } catch (e) {
      console.error("Failed to clear memory:", e);
    } finally {
      setIsClearing(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "540px",
          background: "var(--assistant-bg)",
          border: "1px solid var(--assistant-border)",
          borderRadius: "14px",
          boxShadow: "var(--assistant-shadow)",
          display: "flex",
          flexDirection: "column",
          maxHeight: "85vh",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 18px",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          <div style={{ fontWeight: 700, fontSize: "15px", color: "var(--text-primary)" }}>
            Revia Preferences
          </div>
          <button
            onClick={onClose}
            style={{
              background: "var(--bg-pill)",
              border: "none",
              borderRadius: "6px",
              padding: "4px",
              color: "var(--text-tertiary)",
              cursor: "pointer",
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid var(--border-subtle)",
            background: "rgba(0, 0, 0, 0.08)",
            padding: "0 10px",
          }}
        >
          {(
            [
              { id: "general", label: "General", icon: Sliders },
              { id: "memory", label: "Memory", icon: DbIcon },
              { id: "privacy", label: "Privacy", icon: Shield },
              { id: "about", label: "About", icon: Info },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "9px 12px",
                  border: "none",
                  borderBottom: isActive ? "2px solid var(--accent)" : "2px solid transparent",
                  background: "transparent",
                  color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                  fontWeight: isActive ? 600 : 500,
                  fontSize: "12.5px",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <Icon size={13} color={isActive ? "var(--accent)" : "currentColor"} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div style={{ padding: "18px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* TAB: GENERAL */}
          {activeTab === "general" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, marginBottom: "4px" }}>
                  Global Invocation Shortcut
                </label>
                <div style={{ fontSize: "11.5px", color: "var(--text-secondary)", marginBottom: "8px" }}>
                  Summons Revia immediately from any active application on your Mac.
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    value={shortcut}
                    onChange={(e) => setShortcut(e.target.value)}
                    placeholder="Control+Space"
                    style={{
                      flex: 1,
                      background: "var(--bg-input)",
                      border: "1px solid var(--border-app)",
                      borderRadius: "6px",
                      padding: "7px 10px",
                      color: "var(--text-primary)",
                      fontSize: "12.5px",
                      fontFamily: "var(--font-mono)",
                    }}
                  />
                  <button
                    onClick={() => setShortcut("Control+Space")}
                    style={{
                      background: "var(--bg-pill)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "6px",
                      padding: "7px 10px",
                      color: "var(--text-secondary)",
                      fontSize: "11.5px",
                      cursor: "pointer",
                    }}
                  >
                    Reset (Ctrl+Space)
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, marginBottom: "6px" }}>
                  Results Count
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  {[10, 20, 50].map((num) => (
                    <button
                      key={num}
                      onClick={() => setMaxResults(num)}
                      style={{
                        padding: "5px 12px",
                        borderRadius: "6px",
                        border: maxResults === num ? "1px solid var(--accent)" : "1px solid var(--border-subtle)",
                        background: maxResults === num ? "var(--accent-subtle)" : "var(--bg-pill)",
                        color: maxResults === num ? "var(--accent)" : "var(--text-secondary)",
                        fontWeight: 600,
                        fontSize: "12px",
                        cursor: "pointer",
                      }}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "6px" }}>
                <button
                  onClick={handleSaveGeneral}
                  style={{
                    background: "var(--accent)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "6px",
                    padding: "7px 16px",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  {isSaved ? <Check size={13} /> : null}
                  {isSaved ? "Saved!" : "Save Changes"}
                </button>
              </div>
            </div>
          )}

          {/* TAB: MEMORY */}
          {activeTab === "memory" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div
                style={{
                  background: "var(--bg-card-hover)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "8px",
                  padding: "12px 14px",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                }}
              >
                <div>
                  <div style={{ fontSize: "10.5px", color: "var(--text-tertiary)", fontWeight: 500 }}>
                    TOTAL MEMORIES
                  </div>
                  <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)" }}>
                    {stats?.total_items ?? 0}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "10.5px", color: "var(--text-tertiary)", fontWeight: 500 }}>
                    TOTAL VISITS
                  </div>
                  <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)" }}>
                    {stats?.total_visits ?? 0}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "10.5px", color: "var(--text-tertiary)", fontWeight: 500 }}>
                    DATABASE SIZE
                  </div>
                  <div style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text-secondary)" }}>
                    {stats ? formatBytes(stats.database_size_bytes) : "Calculating..."}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "10.5px", color: "var(--text-tertiary)", fontWeight: 500 }}>
                    STATUS
                  </div>
                  <div
                    style={{
                      fontSize: "12.5px",
                      fontWeight: 600,
                      color: stats?.is_paused ? "var(--warning)" : "var(--success)",
                    }}
                  >
                    {stats?.is_paused ? "Paused" : isIndexing ? "Indexing..." : "Active"}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={async () => {
                    const nextPaused = !settings.is_paused;
                    await invoke("set_pause_memory", { paused: nextPaused });
                    await onRefreshStats();
                  }}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    padding: "8px 12px",
                    background: settings.is_paused ? "rgba(245, 158, 11, 0.15)" : "var(--bg-pill)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "6px",
                    color: settings.is_paused ? "var(--warning)" : "var(--text-primary)",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {settings.is_paused ? <Play size={13} fill="currentColor" /> : <Pause size={13} />}
                  {settings.is_paused ? "Resume Memory" : "Pause Memory"}
                </button>

                <button
                  onClick={onReindex}
                  disabled={isIndexing || settings.is_paused}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    padding: "8px 12px",
                    background: "var(--bg-pill)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "6px",
                    color: "var(--text-primary)",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: isIndexing || settings.is_paused ? "not-allowed" : "pointer",
                    opacity: isIndexing || settings.is_paused ? 0.6 : 1,
                  }}
                >
                  <RefreshCw size={13} className={isIndexing ? "spin-icon" : ""} />
                  {isIndexing ? "Indexing..." : "Re-index Chrome"}
                </button>
              </div>

              <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "12px" }}>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--danger)" }}>
                  Clear Revia Index
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px", marginBottom: "8px" }}>
                  Clears Revia's local memory database. Your actual Chrome history is untouched.
                </div>

                {showClearConfirm ? (
                  <div
                    style={{
                      background: "rgba(239, 68, 68, 0.12)",
                      border: "1px solid var(--danger)",
                      borderRadius: "6px",
                      padding: "10px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--danger)", fontSize: "12px", fontWeight: 600 }}>
                      <AlertTriangle size={14} />
                      Are you sure?
                    </div>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        onClick={handleClearMemory}
                        disabled={isClearing}
                        style={{
                          background: "var(--danger)",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "4px",
                          padding: "5px 10px",
                          fontSize: "11px",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        {isClearing ? "Clearing..." : "Yes, Clear"}
                      </button>
                      <button
                        onClick={() => setShowClearConfirm(false)}
                        style={{
                          background: "var(--bg-pill)",
                          color: "var(--text-secondary)",
                          border: "1px solid var(--border-subtle)",
                          borderRadius: "4px",
                          padding: "5px 10px",
                          fontSize: "11px",
                          cursor: "pointer",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    style={{
                      background: "rgba(239, 68, 68, 0.12)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      borderRadius: "6px",
                      padding: "6px 10px",
                      color: "var(--danger)",
                      fontSize: "11.5px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <Trash2 size={12} />
                    <span>Clear Revia Memory...</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB: PRIVACY */}
          {activeTab === "privacy" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--success)", fontWeight: 600 }}>
                <Shield size={16} />
                <span>100% Local-First & Zero Cloud</span>
              </div>
              <p style={{ color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Revia never sends your queries, search results, or browser history to any server or AI API.
              </p>

              <div
                style={{
                  background: "var(--bg-card-hover)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "6px",
                  padding: "10px 12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "5px", fontWeight: 600 }}>
                  <HardDrive size={13} color="var(--accent)" />
                  <span>Local SQLite Path</span>
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    fontFamily: "var(--font-mono)",
                    wordBreak: "break-all",
                    color: "var(--text-tertiary)",
                  }}
                >
                  {stats?.database_path ?? "~/Library/Application Support/com.revia.app/revia.db"}
                </div>
              </div>
            </div>
          )}

          {/* TAB: ABOUT */}
          {activeTab === "about" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", textAlign: "center", padding: "6px 0" }}>
              <div style={{ fontWeight: 700, fontSize: "16px", color: "var(--text-primary)" }}>
                Revia v1.0.1
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", fontStyle: "italic" }}>
                "Your computer remembers, so you don’t have to."
              </div>

              <div style={{ display: "flex", justifyContent: "center", marginTop: "8px" }}>
                <button
                  onClick={() => {
                    onClose();
                    onResetOnboarding();
                  }}
                  style={{
                    background: "var(--bg-pill)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "6px",
                    padding: "6px 12px",
                    color: "var(--accent)",
                    fontSize: "11.5px",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  <RotateCcw size={12} />
                  <span>Replay Setup Tutorial</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`.spin-icon { animation: spin 1s linear infinite; }`}</style>
    </div>
  );
};
