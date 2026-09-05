# REVIA V1.5.0 BETA — FRIEND & TESTER GUIDE
**Welcome to the Revia Public Beta Test!**  
*Your computer remembers, so you don't have to.*

---

## 1. Quick Download
Download the official beta release package for your operating system:
- **macOS (Apple Silicon M1/M2/M3/M4)**: Download `Revia_1.5.0_aarch64.zip`
- **Windows 10 / 11 (64-bit)**: Download `Revia_Windows_x64.zip`

---

## 2. Installation & First Launch

### For macOS Testers:
1. Double-click `Revia_1.5.0_aarch64.zip` to extract **Revia.app**.
2. Drag **Revia.app** into your `Applications` folder.
3. Double-click **Revia** to launch.
4. **First-Time Security Note**: If macOS displays a message saying *"Revia cannot be opened because it is from an unidentified developer"*:
   - Open **System Settings → Privacy & Security**.
   - Scroll down to find the message regarding Revia and click **Open Anyway**.
   - (Alternatively: Right-click **Revia.app** in Finder, select **Open**, and click **Open**).

### For Windows Testers:
1. Double-click `Revia_Windows_x64.zip` to extract the folder containing `Revia.exe`.
2. Double-click **Revia.exe** to launch.
3. **First-Time Security Note**: If Windows Defender SmartScreen appears:
   - Click **More info**.
   - Click **Run anyway**.

---

## 3. Step-by-Step Testing Checklist

| # | Test Case | Instructions | Status |
| :--- | :--- | :--- | :--- |
| **1** | **First-Run Setup** | Verify that Revia opens a centered setup window walking through browser memory & shortcuts. | `[  ] PASS  [  ] FAIL` |
| **2** | **Shortcut Summon** | Press **⌃ ⌃** (double-tap Control) on Mac or **Alt + Space** on Windows. Verify Revia appears top-center. | `[  ] PASS  [  ] FAIL` |
| **3** | **Text Search** | Type a query (e.g. `github`, `docs`, or a recent site you visited). Verify instant search results appear. | `[  ] PASS  [  ] FAIL` |
| **4** | **Voice Search (Mac)** | Click the Microphone icon or press the voice button. Speak a phrase. Verify real-time transcription works. | `[  ] PASS  [  ] FAIL` |
| **5** | **Open Result** | Click any search result card or press `Enter`. Verify your browser opens the target URL. | `[  ] PASS  [  ] FAIL` |
| **6** | **Escape / Dismiss** | Press the `Escape` key or click outside the window. Verify Revia smoothly hides to background. | `[  ] PASS  [  ] FAIL` |
| **7** | **System Tray** | Right-click the Revia icon near your system clock/menu bar. Verify settings, pause, and quit menu options. | `[  ] PASS  [  ] FAIL` |
| **8** | **Settings Modal** | Click **Settings...** from the tray or capsule. Verify you can customize settings. | `[  ] PASS  [  ] FAIL` |

---

## 4. How to Submit Bug Reports

If you encounter an error, crash, or unexpected behavior, please copy the template below and send it back to us:

```text
============================================================
REVIA BETA BUG REPORT
============================================================

Platform: [ macOS (Apple Silicon) / Windows 11 / Windows 10 ]
Version: 1.5.0 Beta

What I tried:
[Describe what action you performed]

What I expected:
[Describe what should have happened]

What happened:
[Describe what actually happened]

Exact error message (if any):
[Paste error text or notification]

Steps to reproduce:
1. 
2. 
3. 

Screenshot / Recording:
[Attach screenshot or image link if available]

Severity:
[ Low / Medium / High / Blocker ]
============================================================
```
