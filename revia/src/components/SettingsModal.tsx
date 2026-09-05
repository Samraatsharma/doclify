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
  const [launchAtLogin, setLaunchAtLogin] = useState(settings.launch_at_login ?? false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [hasAccessibility, setHasAccessibility] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen) {
      invoke("set_window_height", { height: 500 }).catch(() => {});
      invoke<boolean>("check_accessibility_permission").then((ok) => {
        setHasAccessibility(ok ?? true);
      }).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveGeneral = async () => {
    await onUpdateSettings({
      ...settings,
      global_shortcut: shortcut,
      max_results: maxResults,
      launch_at_login: launchAtLogin,
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
        background: "rgba(0, 0, 0, 0.55)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
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
          borderRadius: "16px",
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
          className="titlebar-drag"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 18px",
            borderBottom: "1px solid var(--border-subtle)",
            boxShadow: "var(--assistant-bevel)",
          }}
        >
          <div style={{ fontWeight: 700, fontSize: "15px", color: "var(--text-primary)" }}>
            Revia Preferences
          </div>
          <button
            onClick={onClose}
            className="no-drag"
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
          className="no-drag"
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
        <div className="no-drag" style={{ padding: "18px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* TAB: GENERAL */}
          {activeTab === "general" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, marginBottom: "4px" }}>
                  Global Invocation Shortcut
                </label>
                <div style={{ fontSize: "11.5px", color: "var(--text-secondary)", marginBottom: "8px" }}>
                  Summons Revia immediately in the top-right of your active screen.
                </div>

                {/* Status Indicator */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "8px 12px", marginBottom: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px" }}>
                    <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "4px", background: hasAccessibility ? "var(--success)" : "#f59e0b" }} />
                    <span style={{ fontWeight: 600, color: hasAccessibility ? "var(--text-primary)" : "#f59e0b" }}>
                      {hasAccessibility ? "● Double-Modifier Active" : "○ Accessibility Required for Double-Tap"}
                    </span>
                  </div>
                  {!hasAccessibility && (
                    <button
                      onClick={async () => {
                        const ok = await invoke<boolean>("request_accessibility_permission");
                        setHasAccessibility(ok);
                      }}
                      style={{
                        background: "var(--accent)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "5px",
                        padding: "4px 8px",
                        fontSize: "11px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Grant Permission
                    </button>
                  )}
                </div>

                {/* Shortcut Preset Pills */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "8px" }}>
                  {[
                    { id: "DoubleControl", label: "Double Control (⌃ ⌃)" },
                    { id: "DoubleOption", label: "Double Option (⌥ ⌥)" },
                    { id: "DoubleCommand", label: "Double Command (⌘ ⌘)" },
                    { id: "Alt+Space", label: "⌥ Option + Space" },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => setShortcut(preset.id)}
                      style={{
                        background: shortcut === preset.id ? "var(--accent)" : "var(--bg-pill)",
                        color: shortcut === preset.id ? "#ffffff" : "var(--text-primary)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "6px",
                        padding: "5px 10px",
                        fontSize: "11.5px",
                        fontWeight: 500,
                        cursor: "pointer",
                      }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    value={shortcut}
                    onChange={(e) => setShortcut(e.target.value)}
                    placeholder="DoubleControl or Alt+Space"
                    style={{
                      flex: 1,
                      background: "var(--bg-input)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "6px",
                      padding: "7px 10px",
                      color: "var(--text-primary)",
                      fontSize: "12px",
                      fontFamily: "var(--font-mono)",
                    }}
                  />
                  <button
                    onClick={() => setShortcut("DoubleControl")}
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
                    Reset Default
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderTop: "1px solid var(--border-subtle)" }}>
                <div>
                  <div style={{ fontSize: "12.5px", fontWeight: 600 }}>Launch Revia at Login</div>
                  <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                    Starts Revia quietly in the background menu bar on system startup.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={launchAtLogin}
                  onChange={(e) => setLaunchAtLogin(e.target.checked)}
                  style={{ width: "16px", height: "16px", cursor: "pointer" }}
                />
              </div>

              <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "10px" }}>
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
                        background: maxResults === num ? "var(--bg-card-selected)" : "var(--bg-pill)",
                        color: maxResults === num ? "var(--accent)" : "var(--text-secondary)",
                        fontWeight: 600,
                        fontSize: "12px",
                        cursor: "pointer",
                      }}
                    >
                      {num} items
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
                <button
                  onClick={handleSaveGeneral}
                  style={{
                    background: "var(--accent)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    padding: "7px 16px",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  {isSaved ? <Check size={14} /> : null}
                  <span>{isSaved ? "Saved!" : "Save Preferences"}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB: MEMORY */}
          {activeTab === "memory" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "8px",
                  padding: "12px",
                  display: "flex",
                  justifyContent: "space-around",
                  textAlign: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--accent)" }}>
                    {stats?.total_items.toLocaleString() ?? 0}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>Total Pages</div>
                </div>
                <div>
                  <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--success)" }}>
                    {stats?.total_visits.toLocaleString() ?? 0}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>Total Visits</div>
                </div>
                <div>
                  <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)" }}>
                    {stats ? formatBytes(stats.database_size_bytes) : "0 B"}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>Local SQLite Size</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
                <button
                  onClick={onReindex}
                  disabled={isIndexing}
                  style={{
                    flex: 1,
                    background: "var(--bg-pill)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "6px",
                    padding: "8px 12px",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    cursor: isIndexing ? "wait" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  <RefreshCw size={13} className={isIndexing ? "spin-icon" : ""} />
                  <span>{isIndexing ? "Re-indexing Chrome..." : "Re-index Chrome History"}</span>
                </button>
              </div>

              <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "12px" }}>
                <div style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--danger)", marginBottom: "4px" }}>
                  Danger Zone
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginBottom: "8px" }}>
                  Permanently deletes all indexed search items and embeddings from local memory. Does not affect Chrome.
                </div>

                {showClearConfirm ? (
                  <div
                    style={{
                      background: "rgba(239, 68, 68, 0.12)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      borderRadius: "8px",
                      padding: "10px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--danger)", fontSize: "12px", fontWeight: 600, marginBottom: "8px" }}>
                      <AlertTriangle size={14} />
                      <span>Are you sure? This cannot be undone.</span>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={handleClearMemory}
                        disabled={isClearing}
                        style={{
                          background: "var(--danger)",
                          color: "#fff",
                          border: "none",
                          borderRadius: "6px",
                          padding: "6px 12px",
                          fontSize: "11.5px",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        {isClearing ? "Clearing..." : "Yes, Delete Memory"}
                      </button>
                      <button
                        onClick={() => setShowClearConfirm(false)}
                        style={{
                          background: "var(--bg-pill)",
                          color: "var(--text-secondary)",
                          border: "1px solid var(--border-subtle)",
                          borderRadius: "6px",
                          padding: "6px 12px",
                          fontSize: "11.5px",
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
                <span>Local-First Memory Architecture</span>
              </div>
              <p style={{ color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Chrome history indexing, SQLite FTS5 search, and 384-dimensional MiniLM vector embeddings run completely on-device on your Mac. No search queries or browsing histories are ever sent to any remote server or AI API.
              </p>

              <div
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "8px",
                  padding: "10px 12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "5px", fontWeight: 600 }}>
                  <HardDrive size={13} color="var(--accent)" />
                  <span>Local SQLite Database</span>
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

              <div style={{ color: "var(--text-secondary)", lineHeight: 1.5 }}>
                <strong style={{ color: "var(--text-primary)" }}>Voice Privacy Note:</strong> Voice dictation uses macOS WebKit SpeechRecognition. Depending on your macOS Dictation preferences in System Settings, dictation may run on-device or utilize Apple's privacy-preserving speech servers.
              </div>
            </div>
          )}

          {/* TAB: ABOUT */}
          {activeTab === "about" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", textAlign: "center", padding: "8px 0" }}>
              <div style={{ fontWeight: 700, fontSize: "17px", color: "var(--text-primary)" }}>
                Revia v1.5.0
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", fontStyle: "italic" }}>
                "Your computer remembers, so you don’t have to."
              </div>

              <div style={{ display: "flex", justifyContent: "center", marginTop: "12px" }}>
                <button
                  onClick={() => {
                    onClose();
                    onResetOnboarding();
                  }}
                  style={{
                    background: "var(--bg-pill)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "6px",
                    padding: "7px 14px",
                    color: "var(--accent)",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <RotateCcw size={13} />
                  <span>Replay Setup Tutorial</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
