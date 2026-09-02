import React, { useState } from "react";
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
  isIndexing,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("general");
  const [shortcut, setShortcut] = useState(settings.global_shortcut);
  const [maxResults, setMaxResults] = useState(settings.max_results);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

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
        background: "rgba(0, 0, 0, 0.65)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "580px",
          background: "var(--bg-card)",
          border: "1px solid var(--border-app)",
          borderRadius: "12px",
          boxShadow: "var(--shadow-popover)",
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
            padding: "14px 20px",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          <div style={{ fontWeight: 700, fontSize: "16px", color: "var(--text-primary)" }}>
            Revia Settings
          </div>
          <button
            onClick={onClose}
            style={{
              background: "var(--bg-pill)",
              border: "none",
              borderRadius: "6px",
              padding: "5px",
              color: "var(--text-tertiary)",
              cursor: "pointer",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid var(--border-subtle)",
            background: "rgba(0, 0, 0, 0.08)",
            padding: "0 12px",
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
                  padding: "10px 14px",
                  border: "none",
                  borderBottom: isActive ? "2px solid var(--accent)" : "2px solid transparent",
                  background: "transparent",
                  color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                  fontWeight: isActive ? 600 : 500,
                  fontSize: "13px",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <Icon size={14} color={isActive ? "var(--accent)" : "currentColor"} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div style={{ padding: "20px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* TAB: GENERAL */}
          {activeTab === "general" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {/* Global Shortcut */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                  Global Keyboard Shortcut
                </label>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "8px" }}>
                  Press this shortcut anywhere on your Mac to toggle Revia's search window.
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <input
                    type="text"
                    value={shortcut}
                    onChange={(e) => setShortcut(e.target.value)}
                    placeholder="CommandOrControl+Shift+Space"
                    style={{
                      flex: 1,
                      background: "var(--bg-input)",
                      border: "1px solid var(--border-app)",
                      borderRadius: "6px",
                      padding: "8px 12px",
                      color: "var(--text-primary)",
                      fontSize: "13px",
                      fontFamily: "var(--font-mono)",
                    }}
                  />
                  <button
                    onClick={() => setShortcut("CommandOrControl+Shift+Space")}
                    style={{
                      background: "var(--bg-pill)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "6px",
                      padding: "8px 12px",
                      color: "var(--text-secondary)",
                      fontSize: "12px",
                      cursor: "pointer",
                    }}
                  >
                    Reset Default
                  </button>
                </div>
              </div>

              {/* Max Results */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                  Maximum Results
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  {[10, 20, 50].map((num) => (
                    <button
                      key={num}
                      onClick={() => setMaxResults(num)}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "6px",
                        border: maxResults === num ? "1px solid var(--accent)" : "1px solid var(--border-subtle)",
                        background: maxResults === num ? "var(--accent-subtle)" : "var(--bg-pill)",
                        color: maxResults === num ? "var(--accent)" : "var(--text-secondary)",
                        fontWeight: 600,
                        fontSize: "12px",
                        cursor: "pointer",
                      }}
                    >
                      {num} results
                    </button>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px" }}>
                <button
                  onClick={handleSaveGeneral}
                  style={{
                    background: "var(--accent)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "6px",
                    padding: "8px 18px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  {isSaved ? <Check size={14} /> : null}
                  {isSaved ? "Saved!" : "Save Changes"}
                </button>
              </div>
            </div>
          )}

          {/* TAB: MEMORY */}
          {activeTab === "memory" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {/* Memory Statistics Card */}
              <div
                style={{
                  background: "var(--bg-card-hover)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "8px",
                  padding: "14px 16px",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <div>
                  <div style={{ fontSize: "11px", color: "var(--text-tertiary)", fontWeight: 500 }}>
                    TOTAL ITEMS INDEXED
                  </div>
                  <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", marginTop: "2px" }}>
                    {stats?.total_items ?? 0}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", color: "var(--text-tertiary)", fontWeight: 500 }}>
                    TOTAL VISITS LOGGED
                  </div>
                  <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", marginTop: "2px" }}>
                    {stats?.total_visits ?? 0}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", color: "var(--text-tertiary)", fontWeight: 500 }}>
                    DATABASE SIZE
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginTop: "2px" }}>
                    {stats ? formatBytes(stats.database_size_bytes) : "Calculating..."}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", color: "var(--text-tertiary)", fontWeight: 500 }}>
                    INDEXING STATUS
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: stats?.is_paused ? "var(--warning)" : "var(--success)",
                      marginTop: "2px",
                    }}
                  >
                    {stats?.is_paused ? "Paused" : isIndexing ? "Indexing..." : "Active"}
                  </div>
                </div>
              </div>

              {/* Ingestion & Pause Controls */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ fontSize: "13px", fontWeight: 600 }}>Memory Controls</div>

                <div style={{ display: "flex", gap: "10px" }}>
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
                      padding: "9px 14px",
                      background: settings.is_paused ? "rgba(245, 158, 11, 0.15)" : "var(--bg-pill)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "6px",
                      color: settings.is_paused ? "var(--warning)" : "var(--text-primary)",
                      fontSize: "12.5px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {settings.is_paused ? <Play size={14} fill="currentColor" /> : <Pause size={14} />}
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
                      padding: "9px 14px",
                      background: "var(--bg-pill)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "6px",
                      color: "var(--text-primary)",
                      fontSize: "12.5px",
                      fontWeight: 600,
                      cursor: isIndexing || settings.is_paused ? "not-allowed" : "pointer",
                      opacity: isIndexing || settings.is_paused ? 0.6 : 1,
                    }}
                  >
                    <RefreshCw size={14} className={isIndexing ? "spin-icon" : ""} />
                    {isIndexing ? "Indexing Chrome..." : "Re-index Chrome"}
                  </button>
                </div>
              </div>

              {/* Clear Memory Section */}
              <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--danger)" }}>
                  Danger Zone
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "3px", marginBottom: "10px" }}>
                  Clear Revia's local search index. This will NOT delete your Google Chrome history.
                </div>

                {showClearConfirm ? (
                  <div
                    style={{
                      background: "rgba(239, 68, 68, 0.12)",
                      border: "1px solid var(--danger)",
                      borderRadius: "8px",
                      padding: "12px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--danger)", fontSize: "13px", fontWeight: 600 }}>
                      <AlertTriangle size={16} />
                      Are you sure?
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                      This removes all indexed browsing memories from Revia. Your Chrome history will remain completely intact.
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={handleClearMemory}
                        disabled={isClearing}
                        style={{
                          background: "var(--danger)",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "5px",
                          padding: "6px 12px",
                          fontSize: "12px",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        {isClearing ? "Clearing..." : "Yes, Clear Index"}
                      </button>
                      <button
                        onClick={() => setShowClearConfirm(false)}
                        style={{
                          background: "var(--bg-pill)",
                          color: "var(--text-secondary)",
                          border: "1px solid var(--border-subtle)",
                          borderRadius: "5px",
                          padding: "6px 12px",
                          fontSize: "12px",
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
                      padding: "7px 12px",
                      color: "var(--danger)",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <Trash2 size={13} />
                    Clear Revia Memory...
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB: PRIVACY */}
          {activeTab === "privacy" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", fontSize: "13px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--success)", fontWeight: 600 }}>
                <Shield size={18} />
                100% Local-First & Private
              </div>
              <p style={{ color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Revia is built with a zero-cloud architecture. Your browsing history, visited URLs, and memory search queries
                never leave your computer.
              </p>

              <div
                style={{
                  background: "var(--bg-card-hover)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "8px",
                  padding: "12px 14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 600 }}>
                  <HardDrive size={15} color="var(--accent)" />
                  Local Storage Location
                </div>
                <div
                  style={{
                    fontSize: "11.5px",
                    fontFamily: "var(--font-mono)",
                    background: "var(--bg-input)",
                    padding: "6px 10px",
                    borderRadius: "4px",
                    border: "1px solid var(--border-subtle)",
                    wordBreak: "break-all",
                    color: "var(--text-primary)",
                  }}
                >
                  {stats?.database_path ?? "~/Library/Application Support/com.revia.app/revia.db"}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ fontWeight: 600 }}>Safety Guarantees:</div>
                <ul style={{ paddingLeft: "20px", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "5px" }}>
                  <li>Never modifies or mutates Chrome's history files.</li>
                  <li>Opens a temporary read-only copy to prevent database locks.</li>
                  <li>No external analytics, telemetry, or remote tracking.</li>
                  <li>No mandatory API keys, cloud subscriptions, or accounts.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB: ABOUT */}
          {activeTab === "about" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", textAlign: "center", padding: "10px 0" }}>
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto",
                  boxShadow: "0 4px 12px rgba(59, 130, 246, 0.4)",
                  color: "#ffffff",
                }}
              >
                <DbIcon size={26} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "18px", color: "var(--text-primary)" }}>
                  Revia
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "2px" }}>
                  Version 1.0.0
                </div>
                <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "6px", fontStyle: "italic" }}>
                  "Your computer remembers, so you don’t have to."
                </div>
              </div>

              <div
                style={{
                  background: "var(--bg-card-hover)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "8px",
                  padding: "12px",
                  textAlign: "left",
                  fontSize: "12px",
                  color: "var(--text-secondary)",
                  marginTop: "8px",
                  lineHeight: 1.5,
                }}
              >
                <strong style={{ color: "var(--text-primary)" }}>Extensible Memory Architecture:</strong>
                <p style={{ marginTop: "4px" }}>
                  V1.0 indexes Google Chrome browsing history locally. The internal memory source abstraction is engineered to
                  seamlessly support future memory sources (Files, PDFs, Documents, Clipboard, Screen Memory) in subsequent releases.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`.spin-icon { animation: spin 1s linear infinite; }`}</style>
    </div>
  );
};
