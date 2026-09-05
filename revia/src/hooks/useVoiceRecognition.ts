import { useState, useRef, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { isMacOS } from "../utils/platform";

export interface VoiceRecognitionHook {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  audioLevel: number; // 0.0 to 1.0
  isSupported: boolean;
  error: string | null;
  startListening: () => Promise<void>;
  stopListening: () => void;
  toggleListening: () => Promise<void>;
  openMicrophoneSettings: () => void;
}

// Web Speech API — available in Chromium-based WebView2 on Windows
// Use 'any' to avoid TypeScript conflicts with different DOM lib versions
const getSpeechRecognition = (): any => {
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
};

export function useVoiceRecognition(
  onFinalResult?: (text: string) => void,
  onInterimResult?: (text: string) => void
): VoiceRecognitionHook {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const animFrameRef = useRef<number | null>(null);
  const onFinalResultRef = useRef(onFinalResult);
  const onInterimResultRef = useRef(onInterimResult);
  const isListeningRef = useRef(false);
  const lastTranscriptTimeRef = useRef(0);
  // Web Speech API recognition instance (Windows/Linux)
  const webSpeechRef = useRef<any>(null);

  useEffect(() => {
    onFinalResultRef.current = onFinalResult;
    onInterimResultRef.current = onInterimResult;
  }, [onFinalResult, onInterimResult]);

  // Synthetic audio level animation based on transcript activity
  const startAudioAnimation = useCallback(() => {
    const animate = () => {
      if (!isListeningRef.current) {
        setAudioLevel(0);
        return;
      }
      const now = Date.now();
      const timeSinceTranscript = now - lastTranscriptTimeRef.current;
      if (timeSinceTranscript < 400) {
        setAudioLevel(0.5 + Math.random() * 0.5);
      } else if (timeSinceTranscript < 1200) {
        setAudioLevel(0.15 + Math.random() * 0.25);
      } else {
        setAudioLevel(0.05 + Math.random() * 0.12);
      }
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animate();
  }, []);

  const stopAudioAnimation = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setAudioLevel(0);
  }, []);

  // Listen to native macOS speech recognition events
  useEffect(() => {
    if (!isMacOS()) return; // native events only on macOS

    let unlistenTranscript: (() => void) | undefined;
    let unlistenError: (() => void) | undefined;

    listen<{ text: string; is_final: boolean }>("voice-transcript", (event) => {
      const { text, is_final } = event.payload;
      lastTranscriptTimeRef.current = Date.now();

      if (is_final) {
        setTranscript(text);
        setInterimTranscript("");
        if (onFinalResultRef.current && text.trim().length > 0) {
          onFinalResultRef.current(text.trim());
        }
        // Auto-stop listening after final result
        isListeningRef.current = false;
        setIsListening(false);
        invoke("stop_voice_transcription").catch(() => {});
        stopAudioAnimation();
      } else {
        setInterimTranscript(text);
        if (onInterimResultRef.current && text.trim().length > 0) {
          onInterimResultRef.current(text.trim());
        }
      }
    }).then((un) => {
      unlistenTranscript = un;
    });

    listen<string>("voice-error", (event) => {
      console.warn("Voice transcription notification:", event.payload);
      const msg = event.payload;
      if (msg && !msg.includes("216") && !msg.includes("1110")) {
        setError(msg);
      }
      isListeningRef.current = false;
      setIsListening(false);
      invoke("stop_voice_transcription").catch(() => {});
      stopAudioAnimation();
    }).then((un) => {
      unlistenError = un;
    });

    return () => {
      if (unlistenTranscript) unlistenTranscript();
      if (unlistenError) unlistenError();
      stopAudioAnimation();
      invoke("stop_voice_transcription").catch(() => {});
    };
  }, [stopAudioAnimation]);

  const openMicrophoneSettings = useCallback(() => {
    invoke("open_microphone_settings").catch(() => {});
  }, []);

  // ─── Windows: Web Speech API implementation ───────────────────────────────

  const stopWebSpeech = useCallback(() => {
    if (webSpeechRef.current) {
      try { webSpeechRef.current.stop(); } catch {}
      webSpeechRef.current = null;
    }
  }, []);

  const startWebSpeech = useCallback(async (): Promise<void> => {
    const SpeechRec = getSpeechRecognition();
    if (!SpeechRec) {
      setError("Speech recognition is not supported in this browser/WebView.");
      return;
    }

    stopWebSpeech();

    const recognition = new SpeechRec();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    webSpeechRef.current = recognition;

    recognition.onstart = () => {
      isListeningRef.current = true;
      setIsListening(true);
      lastTranscriptTimeRef.current = Date.now();
      startAudioAnimation();
    };

    recognition.onresult = (event: any) => {
      lastTranscriptTimeRef.current = Date.now();
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      if (interim) {
        setInterimTranscript(interim);
        if (onInterimResultRef.current) onInterimResultRef.current(interim.trim());
      }
      if (final) {
        setTranscript(final);
        setInterimTranscript("");
        if (onFinalResultRef.current && final.trim().length > 0) {
          onFinalResultRef.current(final.trim());
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.warn("Web Speech error:", event.error, event.message);
      // "aborted" is not a real error — it happens when we programmatically stop
      if (event.error !== "aborted" && event.error !== "no-speech") {
        setError(`Speech recognition error: ${event.error}`);
      }
      isListeningRef.current = false;
      setIsListening(false);
      stopAudioAnimation();
      webSpeechRef.current = null;
    };

    recognition.onend = () => {
      isListeningRef.current = false;
      setIsListening(false);
      setInterimTranscript("");
      stopAudioAnimation();
      webSpeechRef.current = null;
    };

    try {
      recognition.start();
    } catch (e: any) {
      setError("Failed to start speech recognition: " + String(e));
      isListeningRef.current = false;
      setIsListening(false);
      stopAudioAnimation();
      webSpeechRef.current = null;
    }
  }, [startAudioAnimation, stopAudioAnimation, stopWebSpeech]);

  // ─── macOS: Native SFSpeechRecognizer implementation ─────────────────────

  const startMacOSSpeech = useCallback(async (): Promise<void> => {
    // 1. Check & Request Microphone Permission
    try {
      const micStatus = await invoke<string>("check_microphone_permission");
      if (micStatus === "not_determined") {
        const granted = await invoke<boolean>("request_microphone_permission");
        if (!granted) {
          setError("Microphone access denied. Open System Settings to allow.");
          return;
        }
      } else if (micStatus === "denied" || micStatus === "restricted") {
        setError("Microphone access is disabled in System Settings.");
        return;
      }
    } catch (e) {
      console.warn("Could not check native mic permission:", e);
    }

    // 2. Check & Request Speech Recognition Permission
    try {
      const speechStatus = await invoke<string>("check_speech_permission");
      if (speechStatus === "not_determined") {
        const granted = await invoke<boolean>("request_speech_permission");
        if (!granted) {
          setError("Speech Recognition denied. Open System Settings to allow.");
          return;
        }
      } else if (speechStatus === "denied" || speechStatus === "restricted") {
        setError("Speech Recognition is disabled in System Settings.");
        return;
      }
    } catch (e) {
      console.warn("Could not check speech permission:", e);
    }

    // 3. Set state and start native speech recognition
    setTranscript("");
    setInterimTranscript("");
    isListeningRef.current = true;
    setIsListening(true);
    lastTranscriptTimeRef.current = Date.now();
    startAudioAnimation();

    try {
      await invoke("start_voice_transcription");
    } catch (e: any) {
      console.warn("Could not start native speech transcription:", e);
      setError("Failed to start speech recognition.");
      isListeningRef.current = false;
      setIsListening(false);
      stopAudioAnimation();
    }
  }, [startAudioAnimation, stopAudioAnimation]);

  // ─── Unified public API ───────────────────────────────────────────────────

  const startListening = useCallback(async () => {
    if (isListeningRef.current) return; // already listening — ignore duplicate
    setError(null);

    if (isMacOS()) {
      await startMacOSSpeech();
    } else {
      await startWebSpeech();
    }
  }, [startMacOSSpeech, startWebSpeech]);

  const stopListening = useCallback(() => {
    if (isMacOS()) {
      invoke("stop_voice_transcription").catch(() => {});
    } else {
      stopWebSpeech();
    }
    isListeningRef.current = false;
    setIsListening(false);
    setInterimTranscript("");
    stopAudioAnimation();
  }, [stopAudioAnimation, stopWebSpeech]);

  const toggleListening = useCallback(async () => {
    if (isListening) {
      stopListening();
    } else {
      await startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Detect support
  const isSupported =
    isMacOS() ||
    !!getSpeechRecognition();

  return {
    isListening,
    transcript,
    interimTranscript,
    audioLevel,
    isSupported,
    error,
    startListening,
    stopListening,
    toggleListening,
    openMicrophoneSettings,
  };
}
