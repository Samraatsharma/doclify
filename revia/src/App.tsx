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
  
  // null = initializing/checking, true = show onboarding, false = returning user
  const [isOnboarding, setIsOnboarding] = useState<boolean | null>(null);

  const searchTimeoutRef = useRef<number | null>(null);
  const searchRequestIdRef = useRef<number>(0);

  // Synchronized search execution with stale-result invalidation and race-condition safety
  const updateQueryAndSearch = useCallback(
    (newQuery: string, immediate: boolean = false) => {
      setQuery(newQuery);
      // Immediately invalidate old results so they do not linger under a different query
      setResults([]);

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }

      const trimmed = newQuery.trim();
      if (trimmed.length === 0) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const currentRequestId = ++searchRequestIdRef.current;

      const runSearch = async () => {
        try {
          const items = await invoke<MemoryItem[]>("search_memory", {
            query: trimmed,
            limit: settings?.max_results ?? 20,
          });
          // Ensure this response matches the most recent search request
          if (currentRequestId === searchRequestIdRef.current) {
            setResults(items);
            setIsLoading(false);
          }
        } catch (e) {
          if (currentRequestId === searchRequestIdRef.current) {
            console.error("Search error:", e);
            setResults([]);
            setIsLoading(false);
          }
        }
      };

      if (immediate) {
        runSearch();
      } else {
        // 120ms debounce for instantaneous typing and interim speech transcription
        searchTimeoutRef.current = window.setTimeout(runSearch, 120);
      }
    },
    [settings?.max_results]
  );

  // Native Speech Recognition hook with synchronized final and interim handlers
  const {
    isListening,
    interimTranscript,
    audioLevel,
    error: voiceError,
    startListening,
    stopListening,
    toggleListening,
    openMicrophoneSettings,
  } = useVoiceRecognition(
    // onFinalResult: forced immediate search
    (finalText) => {
      if (finalText.trim().length > 0) {
        updateQueryAndSearch(finalText, true);
      }
    },
    // onInterimResult: debounced live search and real-time query update
    (interimText) => {
      if (interimText.trim().length > 0) {
        updateQueryAndSearch(interimText, false);
      }
    }
  );

  // Clear session state and stop voice
  const handleSessionEnd = useCallback(() => {
    stopListening();
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }
    searchRequestIdRef.current++;
    setQuery("");
    setResults([]);
    setIsLoading(false);
    invoke("hide_search_window").catch(() => {});
  }, [stopListening]);

  // Start fresh search session (called on every summon)
  const startNewSearchSession = useCallback(
    (autoVoice: boolean = false) => {
      // Clear all active query & result state
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }
      searchRequestIdRef.current++;
      setQuery("");
      setResults([]);
      setIsLoading(false);

      if (autoVoice) {
        // Double-Control ⌃⌃ shortcut: immediately activate listening mode
        setTimeout(() => {
          startListening().catch((e) => {
            console.warn("Auto-start voice failed:", e);
          });
        }, 50);
      } else {
        stopListening();
      }

      // Proactively refresh memory stats on each session summon
      invoke<MemoryStats>("get_memory_stats")
        .then((s) => setStats(s))
        .catch(() => {});
    },
    [startListening, stopListening]
  );

  // Global window keyboard listener for immediate Escape and Cmd+Q handling
  useEffect(() => {
    const handleGlobalWindowKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleSessionEnd();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "q") {
        e.preventDefault();
        invoke("exit_app").catch(() => {});
      }
    };
    window.addEventListener("keydown", handleGlobalWindowKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", handleGlobalWindowKeyDown, { capture: true });
  }, [handleSessionEnd]);

  // Load initial settings and verify deterministic first-run onboarding state
  useEffect(() => {
    invoke("log_frontend_event", {
      event: "FRONTEND_LOADED",
      details: "Revia frontend initialized",
    }).catch(() => {});
    invoke("log_frontend_event", {
      event: "FRONTEND_MOUNTED",
      details: "Revia React App mounted",
    }).catch(() => {});

    const initApp = async () => {
      try {
        const loadedSettings = await invoke<AppSettings>("get_settings");
        setSettings(loadedSettings);

        const loadedStats = await invoke<MemoryStats>("get_memory_stats");
        setStats(loadedStats);

        const isFirstRun = !loadedSettings.has_completed_onboarding;
        setIsOnboarding(isFirstRun);

        if (isFirstRun) {
          invoke("position_setup_window").catch(() => {});
        } else {
          // Returning user: start in clean idle state
          invoke("position_capsule_window", { contentHeight: 52 }).catch(() => {});
          startNewSearchSession(false);
        }
      } catch (e) {
        console.error("Initialization error:", e);
        setIsOnboarding(false);
        invoke("position_capsule_window", { contentHeight: 52 }).catch(() => {});
        startNewSearchSession(false);
      }
    };

    initApp();
  }, [startNewSearchSession]);

  // Listen for native events: start-new-session, session-ended, open-settings, memory-updated
  useEffect(() => {
    const unlistenNewSession = listen<{ auto_voice?: boolean }>(
      "start-new-session",
      (event) => {
        startNewSearchSession(event.payload?.auto_voice ?? false);
      }
    );

    const unlistenSessionEnded = listen("session-ended", () => {
      handleSessionEnd();
    });

    const unlistenSettings = listen("open-settings", () => {
      setShowSettings(true);
    });

    const unlistenMemoryUpdated = listen("memory-updated", async () => {
      try {
        const updatedStats = await invoke<MemoryStats>("get_memory_stats");
        setStats(updatedStats);
      } catch (e) {
        console.warn("Failed to refresh stats on memory update:", e);
      }
    });

    return () => {
      unlistenNewSession.then((u) => u());
      unlistenSessionEnded.then((u) => u());
      unlistenSettings.then((u) => u());
      unlistenMemoryUpdated.then((u) => u());
    };
  }, [startNewSearchSession, handleSessionEnd]);

  // Typing search handler: keyboard input takes precedence, cancels voice if listening
  const handleQueryChange = (newQuery: string) => {
    if (isListening) {
      stopListening();
    }
    updateQueryAndSearch(newQuery, false);
  };

  const handleSelectResult = async (item: MemoryItem) => {
    try {
      await invoke("open_url", { url: item.url });
      handleSessionEnd();
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
      if (query.trim().length > 0) {
        updateQueryAndSearch(query, true);
      }
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
    setIsOnboarding(false);
    invoke("position_capsule_window", { contentHeight: 52 }).catch(() => {});
    invoke("hide_search_window").catch(() => {});
    startNewSearchSession(false);
    const newStats = await invoke<MemoryStats>("get_memory_stats");
    setStats(newStats);
  };

  const handleResetOnboarding = () => {
    setIsOnboarding(true);
    invoke("position_setup_window").catch(() => {});
  };

  // While checking initial onboarding status, show clean transparent shell
  if (isOnboarding === null) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "transparent",
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: isOnboarding ? "center" : "flex-start",
        padding: isOnboarding ? "15px" : "10px",
        margin: "0",
        background: "transparent",
        boxSizing: "border-box",
        userSelect: "none",
        overflow: "hidden",
      }}
    >
      {isOnboarding ? (
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
          isIndexing={isIndexing}
          isPaused={settings?.is_paused ?? false}
          isListening={isListening}
          interimTranscript={interimTranscript}
          audioLevel={audioLevel}
          voiceError={voiceError}
          onOpenMicrophoneSettings={openMicrophoneSettings}
          onToggleVoice={toggleListening}
          onSelectResult={handleSelectResult}
          onOpenSettings={() => setShowSettings(true)}
          onTogglePause={handleTogglePause}
          onDismiss={handleSessionEnd}
          stats={stats}
          isSettingsOpen={showSettings}
        />
      )}

      {settings && (
        <SettingsModal
          isOpen={showSettings}
          onClose={() => {
            setShowSettings(false);
            let targetHeight = 52;
            if (results.length > 0) targetHeight = 290;
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
