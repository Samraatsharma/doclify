# REVIA V1.5.0 PUBLIC BETA — RELEASE NOTES
**Release Date**: September 2026  
**Build Status**: Production Public Beta Distribution  

---

## What's New in Revia v1.5.0

Revia v1.5.0 introduces cross-platform support, hybrid FTS5 + semantic vector search, and a brand new public web distribution portal.

### 🌟 Key Highlights
- **Cross-Platform Release**: Official support for macOS (Apple Silicon `arm64`) and Windows 10/11 (`x86_64`).
- **Hybrid FTS5 + FastEmbed Search**: Combines instant SQLite FTS5 BM25 full-text keyword ranking with 384-dimensional dense vector embeddings (`all-MiniLM-L6-v2`) for conceptual recall.
- **Ambient Shortcut Invocation**: Double-tap `Control` (`⌃ ⌃`) on macOS or press `Alt + Space` on Windows to toggle the floating search capsule instantly from anywhere.
- **Chrome History Ingestion**: Safely indexes local Chrome browsing history into an encrypted on-device SQLite database.
- **Floating Ambient Capsule UX**: Ultra-sleek translucent glassmorphic interface with top-right anchoring, animated Memory Core visualizer, auto-expansion, and auto-dismissal on blur.
- **100% Local Privacy Guarantee**: All text processing, vector math, and database storage remain strictly on your computer. Zero telemetry, zero external APIs, zero tracking.

---

## Official Release Packages

### 1. macOS Release Package
- **Filename**: `Revia_1.5.0_aarch64.zip`
- **Target Architecture**: Apple Silicon (M1 / M2 / M3 / M4)
- **File Size**: 14.1 MB (14,582,844 bytes)
- **SHA-256 Checksum**: `5d193b00d72632c9627f1226d16429fe1378b18958483c34cc437d1e39a87914`
- **Signing**: Ad-hoc codesigned app bundle (`com.revia.app`).

### 2. Windows Release Package
- **Filename**: `Revia_Windows_x64.zip`
- **Target Architecture**: Windows 10 / 11 (64-bit x86_64)
- **File Size**: 12.6 MB (13,242,179 bytes)
- **SHA-256 Checksum**: `5819bda1a2fc9da3bef50a9ccd83dd5628a177fa5eb7be51e9f68e994af7490d`
- **Contents**: `Revia.exe` (37.3 MB standalone PE binary) + `README.txt`.

---

## Installation Guidance

### macOS Users
Because this beta release is distributed directly outside the Mac App Store, macOS Gatekeeper may present an "unidentified developer" notice on first launch:
1. Open **System Settings → Privacy & Security**.
2. Scroll to the message regarding Revia and click **Open Anyway**.

### Windows Users
As an unsigned open beta release, Windows Defender SmartScreen may display an informational warning:
1. Click **More info**.
2. Click **Run anyway**.

---

## Feedback & Community
We welcome tester feedback! Please refer to `REVIA_BETA_TESTING_GUIDE.md` for test scenarios and bug reporting templates.
