/**
 * Platform detection utilities for Revia cross-platform support.
 * Uses navigator.userAgent — sufficient for Tauri apps where the UA
 * is controlled by the WebView runtime.
 */

let _cachedPlatform: string | null = null;

/** Returns 'macos' | 'windows' | 'linux' | 'unknown' */
export function getPlatform(): string {
  if (_cachedPlatform) return _cachedPlatform;
  const ua = navigator.userAgent.toLowerCase();
  // Tauri on macOS: userAgent contains "mac"
  // Tauri on Windows: userAgent contains "windows"
  if (ua.includes("macintosh") || ua.includes("mac os x")) {
    _cachedPlatform = "macos";
  } else if (ua.includes("windows")) {
    _cachedPlatform = "windows";
  } else if (ua.includes("linux")) {
    _cachedPlatform = "linux";
  } else {
    _cachedPlatform = "unknown";
  }
  return _cachedPlatform;
}

export function isWindows(): boolean {
  return getPlatform() === "windows";
}

export function isMacOS(): boolean {
  return getPlatform() === "macos";
}

/**
 * Returns the display label for the platform's primary shortcut.
 * macOS: "Double Control (⌃ ⌃)"
 * Windows: "Alt + Space"
 */
export function getShortcutLabel(): string {
  if (isMacOS()) return "Double Control (⌃ ⌃)";
  return "Alt + Space";
}

/** Key display for rendering in KBD elements. */
export function getShortcutKeys(): string[] {
  if (isMacOS()) return ["⌃", "⌃"];
  return ["Alt", "Space"];
}

/** Accessibility note — macOS needs it; Windows does not. */
export function requiresAccessibilityPermission(): boolean {
  return isMacOS();
}
