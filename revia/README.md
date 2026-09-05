# Revia (v1.5.0)

> *“Your computer remembers, so you don’t have to.”*

Revia is a private, local-first macOS memory assistant that helps you instantly rediscover websites, articles, PRs, and research you've seen before. It lives quietly in your menu bar and summons instantly from any application with a single keystroke.

---

## Quick Start (User Guide)

### 1. Installation
The release build is packaged as both a standalone macOS application and a disk image:
- **Application Bundle**: `/Applications/Revia.app`
- **Release DMG**: `revia/src-tauri/target/release/bundle/dmg/Revia_1.5.0_aarch64.dmg`

To install:
1. Open the DMG or drag `Revia.app` into your macOS `/Applications` folder.
2. Launch `Revia` from Spotlight (`Cmd + Space` → `Revia`) or Finder.

### 2. Invoking Revia
Revia runs in the background and can be summoned over any active app (Chrome, VS Code, Terminal, Finder):
- **Default Shortcut**: `⌥ Option + Space` (or `Control + Space` if configured)
- **Menu Bar**: Click the Revia orb icon in your macOS menu bar and select **Show Assistant**.

### 3. Using Revia
- **Natural Queries**: Type keywords, topics, or domains:
  - `react authentication`
  - `electric cars`
  - `github PR`
- **Temporal Search**: Revia understands relative time references:
  - `saw yesterday`
  - `this morning`
  - `past few days`
  - `last week`
- **Voice Search**: Click the microphone icon or press `Cmd + M` to speak your query. (Uses macOS speech recognition; grant microphone permission when prompted).
- **Keyboard Navigation**:
  - `↓` / `↑` : Select results
  - `Enter` : Open selected link in your default browser
  - `Cmd + C` : Copy link to clipboard
  - `Cmd + E` : Expand to view all results
  - `Esc` : Clear search query or hide Revia

### 4. Preferences & Settings
Click the Settings gear icon on the Revia bar or choose **Preferences** from the menu bar:
- **Global Shortcut**: Customize your invocation hotkey.
- **Launch at Login**: Enable or disable background launch on system startup.
- **Max Results**: Choose between 10, 20, or 50 items.
- **Pause Memory**: Temporarily halt automatic indexing.
- **Re-index Chrome**: Trigger an immediate background synchronization.
- **Clear Memory**: Permanently purge all indexed items and vector embeddings from local storage.

### 5. Uninstalling Revia
1. Quit Revia from the menu bar icon (**Quit Revia**).
2. Move `/Applications/Revia.app` to the Trash.
3. (Optional) Remove local database and vector cache:
   ```bash
   rm -rf ~/Library/Application\ Support/com.revia.app
   ```

---

## Privacy & Local Architecture

- **100% Local-First**: Chrome history indexing, SQLite FTS5 lexical matching, and 384-dimensional MiniLM vector embeddings run entirely on-device using Apple Silicon acceleration.
- **Zero Cloud & Telemetry**: Search queries, visited URLs, and memory embeddings are never transmitted to any third-party cloud service or AI provider.
- **Voice Privacy**: Voice dictation uses macOS WebKit SpeechRecognition. Depending on your macOS Dictation settings, dictation is handled on-device or via Apple's secure speech services.

---

## Developer Guide

### Prerequisites
- macOS 11.0+ (Apple Silicon recommended)
- Node.js 18+ & npm
- Rust 1.75+ with `cargo`

### Building from Source
```bash
cd revia

# 1. Install frontend dependencies
npm install

# 2. Run unit test suite (Rust & TypeScript)
npm run build
cd src-tauri && cargo test && cd ..

# 3. Build release .app and .dmg
npm run tauri build
```

---

## Technical Specifications
- **Framework**: Tauri v2, React 19, TypeScript, Vite
- **Storage**: SQLite 3 with FTS5 BM25 Full-Text Search
- **Embeddings**: `fastembed-rs` (AllMiniLML6V2Q, 384 dimensions, quantized ONNX runtime)
- **Windowing**: AppKit `NSApplicationActivationPolicyAccessory` with main-thread activation dispatch
