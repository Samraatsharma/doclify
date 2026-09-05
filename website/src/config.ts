/**
 * Central Revia Website & Release Configuration
 * 
 * Update this file when releasing new versions or pointing to production distribution URLs.
 */

export interface ReleaseConfig {
  version: string;
  releaseDate: string;
  appName: string;
  tagline: string;
  subheadline: string;
  githubOwner: string;
  githubRepo: string;
  zipFilename: string;
  zipSha256: string;
  zipSize: string;
  // Legacy aliases for backward compatibility if needed
  dmgFilename?: string;
  dmgSha256?: string;
  dmgSize?: string;
  signingStatus: string;
  releaseDownloadUrl: string;
  githubReleasePageUrl: string;
  supportedOS: string;
  supportedArchitecture: string;
  shortcutDefault: string;
  shortcutDisplay: string;
  // Windows Beta
  windowsBetaAvailable: boolean;
  windowsDownloadUrl?: string;
  windowsFilename?: string;
  windowsSize?: string;
  windowsSha256?: string;
}

export const CONFIG: ReleaseConfig = {
  version: "1.5.0",
  releaseDate: "September 2026",
  appName: "Revia",
  tagline: "Your computer remembers, so you don't have to.",
  subheadline: "Find that thing you saw on your Mac — even when you can't remember where you saw it.",
  githubOwner: "Samraatsharma",
  githubRepo: "doclify",
  zipFilename: "Revia_1.5.0_aarch64.zip",
  zipSha256: "5d193b00d72632c9627f1226d16429fe1378b18958483c34cc437d1e39a87914",
  zipSize: "14.1 MB",
  // Legacy aliases
  dmgFilename: "Revia_1.5.0_aarch64.zip",
  dmgSha256: "5d193b00d72632c9627f1226d16429fe1378b18958483c34cc437d1e39a87914",
  dmgSize: "14.1 MB",
  signingStatus: "Free beta (not yet notarized by Apple)",
  // Direct downloadable ZIP hosted on site
  releaseDownloadUrl: "/downloads/Revia_1.5.0_aarch64.zip",
  githubReleasePageUrl: "https://github.com/Samraatsharma/doclify/releases",
  supportedOS: "macOS 12.0 Monterey or later",
  supportedArchitecture: "Apple Silicon (M1 / M2 / M3 / M4)",
  shortcutDefault: "DoubleControl",
  shortcutDisplay: "⌃ ⌃  (Double-Tap Control)",
  // Windows Beta — live release
  windowsBetaAvailable: true,
  windowsDownloadUrl: "/downloads/Revia_Windows_x64.zip",
  windowsFilename: "Revia_Windows_x64.zip",
  windowsSize: "12.6 MB",
  windowsSha256: "5819bda1a2fc9da3bef50a9ccd83dd5628a177fa5eb7be51e9f68e994af7490d",
};

/**
 * Utility to detect visitor's operating system
 */
export function getVisitorPlatform(): { isMac: boolean; platformName: string } {
  if (typeof window === "undefined" || !navigator) {
    return { isMac: true, platformName: "macOS" };
  }
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes("mac")) {
    return { isMac: true, platformName: "macOS" };
  } else if (userAgent.includes("win")) {
    return { isMac: false, platformName: "Windows" };
  } else if (userAgent.includes("linux")) {
    return { isMac: false, platformName: "Linux" };
  } else if (userAgent.includes("iphone") || userAgent.includes("ipad")) {
    return { isMac: false, platformName: "iOS" };
  } else if (userAgent.includes("android")) {
    return { isMac: false, platformName: "Android" };
  }
  return { isMac: true, platformName: "macOS" };
}
