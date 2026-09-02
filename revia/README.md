# Revia (v1.0.0)

> **Your computer remembers, so you don’t have to.**

Revia is a local-first desktop memory and search application for macOS.

---

## 1. Product Vision

A user often remembers seeing something on their computer—a website, article, documentation page, product, or piece of information—but cannot recall where they saw it or what the exact URL was.

Instead of manually digging through browser history, Revia allows the user to press a global keyboard shortcut (`Cmd+Shift+Space`), type a natural description of what they remember (e.g., *"article about AI agents yesterday"* or *"github react router"*), and find the page instantly.

---

## 2. Core V1.0 Features

- **Menu Bar Utility**: Runs quietly in the macOS menu bar without cluttering the dock or requiring a heavy window to remain open.
- **Global Keyboard Shortcut**: Toggle the search bar instantly from any application (default: `CommandOrControl+Shift+Space`, customizable in Settings).
- **Floating Search Window**: Compact, spotlight-style floating interface with frosted glass styling and keyboard-first navigation.
- **Real Chrome History Ingestion**: Safely reads Google Chrome browsing history from `~/Library/Application Support/Google/Chrome/Default/History` using read-only temporary copies that never lock or mutate Chrome's database.
- **Incremental Indexing**: Uses high-watermark timestamps to only ingest new visits on subsequent runs.
- **Local SQLite Engine with FTS5**: Full-text search over titles, domains, paths, and URLs with BM25 ranking, exact-phrase boosts, visit-frequency boosts, and recency weighting.
- **Deterministic Temporal Filtering**: Understands date constraints like `"yesterday"`, `"today"`, `"last week"`, `"this week"`, and `"past 30 days"`.
- **Keyboard-First Experience**:
  - `↑` / `↓`: Navigate results
  - `↵ Enter`: Open in default browser
  - `⌘C`: Copy link
  - `Esc`: Close window
- **Onboarding Flow**: 4-screen introduction covering value proposition, keyboard shortcuts, privacy verification, and initial indexing with real progress tracking.
- **Settings & Memory Management**:
  - Customize global shortcut and result limits.
  - Pause / resume memory indexing anytime.
  - Re-index Chrome on demand.
  - Clear Revia's local memory index without affecting Chrome's actual history.
- **100% Local-First & Zero-Cloud**: No accounts, no cloud database, no telemetry, no mandatory external AI API.

---

## 3. Architecture Overview

Revia is structured into modular layers designed to be extended for future memory sources (Files, PDFs, Documents, Clipboard, Screen Memory):

```
revia/
├── src-tauri/                 # Native Rust Desktop Core
│   ├── src/
│   │   ├── commands.rs        # Tauri IPC command handlers
│   │   ├── db/                # SQLite WAL storage & migrations
│   │   │   ├── models.rs      # MemoryItem, MemoryStats, IngestionStats
│   │   │   ├── schema.rs      # Schema v1 + FTS5 virtual table + triggers
│   │   │   └── mod.rs         # Database pool & queries
│   │   ├── search/            # Query parser & ranking engine
│   │   │   └── mod.rs         # Deterministic date tokenizer + BM25 scorer
│   │   ├── sources/           # Extensible MemorySourceTrait
│   │   │   ├── chrome.rs      # Google Chrome safe reader & timestamp converter
│   │   │   └── mod.rs         # MemorySource abstraction
│   │   ├── settings/          # Persistent AppSettings store
│   │   │   └── mod.rs
│   │   ├── lib.rs             # Tray icon, global shortcut, app lifecycle
│   │   └── main.rs            # Entry point
│   ├── Cargo.toml
│   └── tauri.conf.json        # Tauri v2 bundle configuration
├── src/                       # React + TypeScript UI
│   ├── components/
│   │   ├── HeaderBar.tsx      # Draggable utility bar with memory status
│   │   ├── SearchWindow.tsx   # Search input, date chips, and results
│   │   ├── SettingsModal.tsx  # General, Memory, Privacy, and About tabs
│   │   └── Onboarding.tsx     # 4-step first-run onboarding
│   ├── types.ts               # Shared TypeScript models
│   ├── App.tsx                # Main container & state coordination
│   └── index.css              # macOS vibrancy tokens & typography
├── package.json
└── vite.config.ts
```

---

## 4. Local Data Storage

- **Database File**: `~/Library/Application Support/com.revia.app/revia.db`
- **Stored Data**:
  - `memory_items`: URLs, sanitized titles, domains, paths, visit counts, timestamps.
  - `memory_visits`: Individual visit timestamp events.
  - `memory_items_fts`: SQLite FTS5 index for fast full-text queries.
  - `ingestion_state`: Incremental synchronization watermarks.
  - `app_settings`: User configurations (global shortcut, pause state, onboarding status).
- **Clearing Data**: You can reset Revia's index at any time from **Settings → Memory → Clear Revia Memory...**. This never touches Google Chrome's actual database.

---

## 5. Build & Run Instructions

### Prerequisites
- macOS 11.0+ (Apple Silicon or Intel)
- Node.js 18+ & npm
- Rust & Cargo (`rustc --version` >= 1.75)

### Development Mode
```bash
cd revia
npm install
npm run tauri dev
```

### Production Build
```bash
cd revia
npm run tauri build
```

This compiles the release binary and packages:
- `.app` bundle into `revia/src-tauri/target/release/bundle/macos/Revia.app`
- `.dmg` installer into `revia/src-tauri/target/release/bundle/dmg/Revia_1.0.0_aarch64.dmg`

---

## 6. Future Roadmap (Post-V1.0)

- **V1.5**: Semantic / natural-language embeddings, contextual ranking, advanced temporal understanding.
- **V2.0**: Local files, PDFs, and document indexing.
- **V3.0**: Clipboard history memory.
- **V4.0**: Screen activity & visual memory.
- **V5.0**: Windows platform support (isolated via `MemorySourceTrait`).
