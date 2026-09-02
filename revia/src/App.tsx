import React, { useState, useEffect, useCallback, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { CompactAssistant } from "./components/CompactAssistant";
import { Onboarding } from "./components/Onboarding";
import { SettingsModal } from "./components/SettingsModal";
import { useVoiceRecognition } from "./hooks/useVoiceRecognition";
import { AppSettings, MemoryItem, MemoryStats } from "./types";

export const App: React.FC = () => {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<MemoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isIndexing, setIsIndexing] = useState<boolean>(false);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [stats, setStats] = useState<MemoryStats | null>(null);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

  const searchTimeoutRef = useRef<number | null>(null);

  // Load initial settings and check onboarding status
  useEffect(() => {
    const initApp = async () => {
      try {
        const loadedSettings = await invoke<AppSettings>("get_settings");
        setSettings(loadedSettings);

        const loadedStats = await invoke<MemoryStats>("get_memory_stats");
        setStats(loadedStats);

        const localCompleted = localStorage.getItem("revia_onboarding_completed") === "true";
        if (!loadedSettings.has_completed_onboarding && !localCompleted) {
          setShowOnboarding(true);
        } else {
          // Pre-load recent items
          executeSearch("");
        }
      } catch (e) {
        console.error("Initialization error:", e);
        // Fallback: don't lock user into blank screen
        executeSearch("");
      }
    };

    initApp();
  }, []);

  // Listen for native events from tray and shortcuts
  useEffect(() => {
    const unlistenSettings = listen("open-settings", () => {
      setShowSettings(true);
    });

    const unlistenShown = listen("window-shown", () => {
      // Re-trigger empty search or keep existing query focused
      invoke("position_near_top").catch(() => {});
    });

    return () => {
      unlistenSettings.then((u) => u());
      unlistenShown.then((u) => u());
    };
  }, []);

  // Search execution
  const executeSearch = useCallback(async (q: string) => {
    setIsLoading(true);
    try {
      const items = await invoke<MemoryItem[]>("search_memory", {
        query: q,
        limit: settings?.max_results ?? 20,
      });
      setResults(items);
    } catch (e) {
      console.error("Search error:", e);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [settings?.max_results]);

  // Voice recognition hook
  const {
    isListening,
    interimTranscript,
    audioLevel,
    toggleListening,
  } = useVoiceRecognition((finalText) => {
    if (finalText.trim().length > 0) {
      setQuery(finalText);
      executeSearch(finalText);
    }
  });

  // Debounced search on query change (when not using voice)
  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      executeSearch(newQuery);
    }, 120);
  };

  const handleSelectResult = async (item: MemoryItem) => {
    try {
      await invoke("open_url", { url: item.url });
      await invoke("hide_search_window");
    } catch (e) {
      console.error("Failed to open URL:", e);
    }
  };

  const handleTogglePause = async () => {
    if (!settings) return;
    const nextPaused = !settings.is_paused;
    try {
      await invoke("set_pause_memory", { paused: nextPaused });
      setSettings({ ...settings, is_paused: nextPaused });
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
      console.error("Reindex error:", e);
    } finally {
      setIsIndexing(false);
    }
  };

  const handleCompleteOnboarding = async () => {
    try {
      await invoke("complete_onboarding");
      localStorage.setItem("revia_onboarding_completed", "true");
    } catch (e) {
      console.warn("Could not save onboarding flag:", e);
    }
    setShowOnboarding(false);
    executeSearch("");
    const newStats = await invoke<MemoryStats>("get_memory_stats");
    setStats(newStats);
  };

  const handleResetOnboarding = () => {
    setShowOnboarding(true);
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "0",
        margin: "0",
        background: "transparent",
        boxSizing: "border-box",
        userSelect: "none",
      }}
    >
      {showOnboarding ? (
        <Onboarding
          onComplete={handleCompleteOnboarding}
          onClose={handleCompleteOnboarding}
        />
      ) : (
        <CompactAssistant
          query={query}
          onQueryChange={handleQueryChange}
          results={results}
          isLoading={isLoading}
          isPaused={settings?.is_paused ?? false}
          isListening={isListening}
          interimTranscript={interimTranscript}
          audioLevel={audioLevel}
          onToggleVoice={toggleListening}
          onSelectResult={handleSelectResult}
          onOpenSettings={() => setShowSettings(true)}
          onTogglePause={handleTogglePause}
          stats={stats}
        />
      )}

      {settings && (
        <SettingsModal
          isOpen={showSettings}
          onClose={() => {
            setShowSettings(false);
            // restore height for assistant
            let targetHeight = 56;
            if (results.length > 0) targetHeight = 330;
            invoke("set_window_height", { height: targetHeight }).catch(() => {});
          }}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          stats={stats}
          onRefreshStats={async () => {
            const s = await invoke<MemoryStats>("get_memory_stats");
            setStats(s);
          }}
          onReindex={handleReindex}
          onResetOnboarding={handleResetOnboarding}
          isIndexing={isIndexing}
        />
      )}
    </div>
  );
};

export default App;
