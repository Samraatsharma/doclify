import React, { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { HeaderBar } from "./components/HeaderBar";
import { SearchWindow } from "./components/SearchWindow";
import { SettingsModal } from "./components/SettingsModal";
import { Onboarding } from "./components/Onboarding";
import { AppSettings, MemoryItem, MemoryStats } from "./types";

export const App: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [stats, setStats] = useState<MemoryStats | null>(null);
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<MemoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isIndexing, setIsIndexing] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

  // Load initial settings and memory stats
  const loadInitialData = useCallback(async () => {
    try {
      const currentSettings = await invoke<AppSettings>("get_settings");
      setSettings(currentSettings);

      if (!currentSettings.has_completed_onboarding) {
        setShowOnboarding(true);
      }

      const memoryStats = await invoke<MemoryStats>("get_memory_stats");
      setStats(memoryStats);
    } catch (e) {
      console.error("Failed to load initial data:", e);
    }
  }, []);

  useEffect(() => {
    loadInitialData();

    // Listen for tray event "open-settings"
    const unlistenPromise = listen("open-settings", () => {
      setIsSettingsOpen(true);
    });

    return () => {
      unlistenPromise.then((unlisten) => unlisten());
    };
  }, [loadInitialData]);

  // Execute search when query or max_results changes
  const executeSearch = useCallback(
    async (searchQuery: string) => {
      setIsLoading(true);
      try {
        const lim = settings?.max_results ?? 20;
        const items = await invoke<MemoryItem[]>("search_memory", {
          query: searchQuery,
          limit: lim,
        });
        setResults(items);
      } catch (e) {
        console.error("Search failed:", e);
      } finally {
        setIsLoading(false);
      }
    },
    [settings?.max_results]
  );

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      executeSearch(query);
    }, 80);
    return () => clearTimeout(timer);
  }, [query, executeSearch]);

  const handleTogglePause = async () => {
    if (!settings) return;
    const nextPaused = !settings.is_paused;
    try {
      await invoke("set_pause_memory", { paused: nextPaused });
      setSettings((prev) => (prev ? { ...prev, is_paused: nextPaused } : null));
      const newStats = await invoke<MemoryStats>("get_memory_stats");
      setStats(newStats);
    } catch (e) {
      console.error("Failed to toggle pause:", e);
    }
  };

  const handleUpdateSettings = async (newSettings: AppSettings) => {
    try {
      await invoke("update_settings", { settings: newSettings });
      setSettings(newSettings);
      const newStats = await invoke<MemoryStats>("get_memory_stats");
      setStats(newStats);
    } catch (e) {
      console.error("Failed to update settings:", e);
    }
  };

  const handleReindex = async () => {
    setIsIndexing(true);
    try {
      await invoke("ingest_chrome_history", { forceFull: false });
      const newStats = await invoke<MemoryStats>("get_memory_stats");
      setStats(newStats);
      executeSearch(query);
    } catch (e) {
      console.error("Re-indexing failed:", e);
    } finally {
      setIsIndexing(false);
    }
  };

  const handleSelectResult = async (item: MemoryItem) => {
    try {
      // Safe URL open via native backend
      await invoke("open_url", { url: item.url });
      // Hide the floating search window
      await invoke("hide_search_window");
    } catch (e) {
      console.error("Failed to open result URL:", e);
    }
  };

  const handleCompleteOnboarding = async () => {
    if (settings) {
      const updated = { ...settings, has_completed_onboarding: true };
      await handleUpdateSettings(updated);
    }
    setShowOnboarding(false);
    const newStats = await invoke<MemoryStats>("get_memory_stats");
    setStats(newStats);
    executeSearch("");
  };

  if (!settings) {
    return (
      <div className="revia-window" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "var(--text-tertiary)", fontSize: "13px" }}>Loading Revia...</div>
      </div>
    );
  }

  if (showOnboarding) {
    return <Onboarding onComplete={handleCompleteOnboarding} />;
  }

  return (
    <div className="revia-window">
      {/* Top utility bar */}
      <HeaderBar
        stats={stats}
        isPaused={settings.is_paused}
        onTogglePause={handleTogglePause}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isIndexing={isIndexing}
      />

      {/* Main search interface */}
      <SearchWindow
        query={query}
        onQueryChange={setQuery}
        results={results}
        isLoading={isLoading}
        isPaused={settings.is_paused}
        onSelectResult={handleSelectResult}
        onIndexNow={handleReindex}
        onResume={handleTogglePause}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        stats={stats}
        onRefreshStats={async () => {
          const s = await invoke<MemoryStats>("get_memory_stats");
          setStats(s);
        }}
        onReindex={handleReindex}
        isIndexing={isIndexing}
      />
    </div>
  );
};

export default App;
