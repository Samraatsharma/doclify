# Doclify User Guide: From Zero to Codebase Intelligence

Welcome to Doclify! This guide is written for complete beginners. If you don't know much about AI, APIs, or complex programming terms, you are in the right place. 

---

## PART 1 — EXPLAIN DOCLIFY LIKE I'M A COMPLETE BEGINNER

**What is Doclify?**
Imagine you download a large software project (like a React website or a Python app) with 150 different files. It's overwhelming. You don't know where to start, what the files do, or how they connect.

Doclify solves this problem. It is an **AI-powered assistant that reads your code and explains it to you**. 

- **Who should use it?** Developers, students, or project managers who need to quickly understand a codebase or write documentation for it.
- **What you give Doclify:** A folder containing your code (or a ZIP file, or a GitHub link).
- **What Doclify does:** It scans your project, reads the files one by one, uses AI to write a short 3-sentence summary of what each file does, and then combines all those summaries to understand the whole project.
- **What you get at the end:** A beautiful, comprehensive `README.md` file (a project instruction manual) that explains exactly what your app is, what technologies it uses, and how it works. You also get a dashboard where you can click on any file and see its AI summary.

**Real Example:**
"I have a React project with 150 files. I give it to Doclify. Doclify scans the project. AI understands the files. Doclify remembers this understanding. It generates a README explaining my entire React project."

---

## PART 2 — UNDERSTAND THE BIG PICTURE

Here is the complete visual flow of how Doclify works:

```text
USER (You)
 ↓
DOCLIFY FRONTEND (The beautiful web dashboard you click around in)
 ↓
BACKEND/API (The hidden engine that processes your clicks)
 ↓
PROJECT INGESTION (Doclify looks at your local folder, ZIP, or GitHub link)
 ↓
FILE DISCOVERY (Doclify finds all your code files and ignores junk files)
 ↓
FILE SUMMARIZATION (Stage 1: AI reads each file and writes a short summary)
 ↓
CONTEXT COMPACTION (Doclify gathers all those short summaries together)
 ↓
CACHE (Doclify saves the summaries in a hidden folder so it doesn't have to read them again)
 ↓
FINAL AI SYNTHESIS (Stage 2: AI looks at the gathered summaries and writes a full manual)
 ↓
README (The final instruction manual is created)
 ↓
USER (You read and download the README)
```

**Hinglish Explanation:**
Aap apna project Doclify ko dete ho. Doclify pehle aapke project ke saare kaam ke files dhundta hai (File Discovery). Phir wo ek AI ko bulata hai jo har file ko padh kar uska chhota summary likhta hai (File Summarization). In sab summaries ko wo ek jagah save kar leta hai taaki agli baar time waste na ho (Cache). Phir wo in saari summaries ko mila kar ek bada, final document banata hai jisme pure project ka explanation hota hai (Final AI Synthesis). Aur end mein aapko ek mast README file mil jati hai!

**Technical Explanation:**
The user uploads a project via the Vite+React SPA. The FastAPI backend receives it and runs a scanner that respects `.gitignore` rules to find valid source files. The system then chunks large files and sends them to the Groq API (Stage 1) to generate compact behavioral summaries. These summaries are saved locally in `.doclify/cache.json` to prevent redundant API calls. Finally, all summaries are concatenated and sent to the LLM (Stage 2) with a "Principal Documentation Architect" prompt to synthesize a comprehensive `README.md`.

---

## PART 3 — FIRST-TIME SETUP FROM ABSOLUTE ZERO (MACOS)

If you are on a Mac, follow these exact steps:

1. **Where to download:** Download or clone the Doclify folder to your computer (e.g., on your Desktop).
2. **Open the folder:** Open Finder and double-click the `Doclify` folder so you can see all the files inside.
3. **What `setup.command` does:** It is an automated script. It checks if you have Python installed, creates an isolated "virtual environment" (a safe bubble for Python packages), installs required tools, builds the frontend, and creates a `.env` file for your passwords.
4. **Run `setup.command`:** Right-click `setup.command` and click "Open". (If Mac warns you about an unverified developer, click Open anyway).
5. **What Terminal shows:** A black window will open showing text scrolling by as it installs things. 
6. **Python Requirement:** You need Python 3.9 or higher installed on your Mac. The script will check this for you.
7. **Node.js Requirement:** Yes, Node.js is required to build the frontend dashboard the first time.
8. **Virtual Environment:** It creates a hidden folder called `.venv`. This keeps Doclify's Python tools separate from the rest of your Mac so nothing breaks.
9. **Dependencies:** They are installed securely inside that `.venv` folder.
10. **How `.env` works:** This is a hidden text file that stores your secret API key.
11. **Where to get the Groq API Key:** Go to [console.groq.com/keys](https://console.groq.com/keys), sign up for free, and click "Create API Key". It will look like `gsk_...`.
12. **Where to put the API key:** Open the Doclify folder in a text editor (like TextEdit or VS Code). Find the file named `.env` (if you can't see hidden files, press `Cmd + Shift + .`). Replace `your_groq_api_key_here` with your actual `gsk_...` key.
13. **Save it:** Just save the `.env` file normally.
14. **How to start Doclify:** Double-click the `start.command` file in Finder.
15. **Browser opens:** Your default web browser will automatically pop open.
16. **URL:** It will open `http://127.0.0.1:8000`.
17. **If something fails:** Read the text in the Terminal window. If it says "Missing GROQ_API_KEY", you forgot step 12.

*Manual Terminal Method:* Open Terminal, type `cd /path/to/Doclify`, run `./setup.sh`, then run `./start.sh`.

---

## PART 4 — WINDOWS

1. **Download/clone:** Download the Doclify folder to your PC.
2. **Open folder:** Open the folder in File Explorer.
3. **Run `setup.bat`:** Double-click `setup.bat`. It will create the Python virtual environment and install everything.
4. **API Key:** Open the `.env` file in Notepad and paste your Groq API key next to `GROQ_API_KEY=`.
5. **Start:** Double-click `start.bat`.
6. **Browser:** It will automatically open your browser to `http://127.0.0.1:8000`.
7. **Troubleshooting:** If the window closes instantly, open Command Prompt, navigate to the folder (`cd path\to\Doclify`), and type `start.bat` to see the error message.

---

## PART 5 — LINUX

1. Open your terminal and navigate to the Doclify folder.
2. **Permissions:** Run `chmod +x setup.sh start.sh` to make the scripts executable.
3. **Run setup:** Run `./setup.sh`.
4. **API Key:** Edit the `.env` file (e.g., `nano .env`) and add your Groq API key.
5. **Run app:** Run `./start.sh`.
6. **Browser:** It will print a URL (usually `http://127.0.0.1:8000`). Open it in your browser.

---

## PART 6 — FIRST PROJECT ANALYSIS

Let's document your first project! Imagine you have a React website on your computer.

**STEP 1:** Open Doclify in your browser (`http://127.0.0.1:8000`).
**STEP 2:** Click the big **"Analyze a project"** button or the **"+"** icon in the sidebar.
**STEP 3:** A window will pop up asking for a Project Name. Enter "My React Website".
**STEP 4:** Choose **"Local Directory"** and enter the path to your project (e.g., `/Users/me/Desktop/MyReactProject`). Click Import.
**STEP 5:** After importing, click the **"Analyze"** button in the top right corner.
**STEP 6:** A side drawer will slide out showing live progress:
- *Initializing:* Setting up the rules.
- *Extracting:* Finding and reading all your React code files.
- *Summarizing (1/20):* AI is reading file #1 and writing a short summary. You will see this count up.
- *Cache:* Saving the summaries so it's faster next time.
- *Synthesizing:* AI is reading all 20 summaries and writing the final master document.
- *Complete:* Done!
**STEP 7:** The progress drawer will show a success message.
**STEP 8:** Click on the **"README"** tab in the main window.
**STEP 9:** You will see a beautifully formatted instruction manual explaining your exact React website, its features, and its tech stack.
**STEP 10:** Click the "Copy" icon to copy it, or the "Download" icon to save it as a `README.md` file to put in your actual project folder!

---

## PART 7 — THREE WAYS TO GIVE DOCLIFY A PROJECT

**A. LOCAL PROJECT**
If your code is on your computer (e.g., `/Users/me/Desktop/MyReactProject`), enter this path. Doclify will read the files directly from that folder. It will not move or delete your files. It will create a tiny `.doclify` folder inside it to store the cache.

**B. ZIP FILE**
If you have a ZIP of your code, you can drag and drop it into Doclify. 
- *What to ZIP:* Just your code files.
- *What NOT to include:* Do NOT include the `node_modules` folder, `.git` folder, or huge video/image files. It slows down the AI.
- *What happens:* Doclify securely unzips it into a hidden safe folder (`.doclify_workspace`) on your computer. It is safely sandboxed.

**C. PUBLIC GITHUB REPOSITORY**
- *Where to paste:* In the "GitHub" tab of the import window.
- *What URL works:* A standard public URL like `https://github.com/facebook/react`. 
- *Behind the scenes:* Doclify runs a command to quickly download (clone) the latest version of the code into its safe workspace.
- *Private repos:* If the repository is private, it will fail because Doclify doesn't have your GitHub login.
- *Invalid URL:* Doclify will show a red error saying "Must be a valid GitHub URL".

---

## PART 8 — UNDERSTANDING THE DASHBOARD

- **Landing Page / Hero:** The beautiful screen with floating green dots (Canvas particle system). It explains what Doclify is.
- **Dashboard:** Shows cards for every project you have imported. Click a card to open it.
- **Project Workspace:** The main control center for a specific project.
- **Overview Tab:** Shows how many files you have, the programming languages used, and a visual diagram of the AI pipeline.
- **Files & Cache (File Explorer):** Shows a tree list of your files. If you click a file, the **File Inspector** on the right shows the exact source code AND the "Stage-1 AI Summary" (the 3 sentences the AI wrote about this specific file).
- **README Viewer:** Shows the final generated manual.
- **Raw Markdown:** A toggle switch in the README viewer to see the raw text formatting.
- **Settings:** Lets you view your configuration and features a **Model Selector** dropdown to change which AI brain (e.g., Llama 3.3) you want to use.

---

## PART 9 — HOW TO USE THE FILE EXPLORER

Go to the **Files** tab. You will see a directory tree (like a folder menu). 
Next to each file, you see its size. If it has a green checkmark, it means the AI has summarized it.

**Example: `src/auth.js`**
Click on `src/auth.js`. On the right side, you will see two things:
1. The actual code of `auth.js`.
2. A small paragraph above it: *"This file provides authentication functionality... It relies on bcrypt for password hashing..."*
**Why it exists:** This is the Stage-1 summary! Doclify's AI wrote this so that when it writes the final README, it doesn't have to read 10,000 lines of complex code again. It just reads these simple English summaries.

---

## PART 10 — HOW README GENERATION WORKS

**Hinglish Explanation:**
Maan lo aapke paas 100 files hain. Agar aap 100 files ka code ek saath ChatGPT ko doge, toh wo confuse ho jayega aur galat jawab dega (hallucination). Isliye Doclify 2 stages mein kaam karta hai. Stage 1: Wo har file ka ek chhota 3 line ka summary banata hai. Stage 2: Wo un 100 chhote summaries ko mila kar ek bada manual banata hai. Isse AI ko samajhne mein aasaani hoti hai aur wo ekdum accurate manual banata hai!

**Technical Explanation:**
LLMs (like Llama or GPT) suffer from "context limit" and "lost-in-the-middle" syndrome if you feed them raw gigabytes of code. Doclify uses a map-reduce architecture. 
- **Stage 1 (Map):** It chunks each file and asks the LLM to generate a dense, behavioral summary. 
- **Cache:** These summaries are saved locally.
- **Stage 2 (Reduce):** It concatenates only the summaries (not the raw code) and sends them to the LLM with a highly engineered system prompt. 
This drastically reduces token usage, eliminates hallucination, and produces a highly accurate README.

---

## PART 11 — CACHE AND UPDATE (SUPER IMPORTANT)

**FIRST RUN:**
You have 5 files. Doclify asks the AI to summarize all 5 files. It takes 10 seconds. It saves these 5 summaries in a hidden file called `cache.json`.

**SECOND RUN:**
If you click Analyze again, it takes 2 seconds. Why? It just reuses the saved summaries!

**WHAT IF I MODIFY A FILE?**
You edit `src/auth.js` to add a new feature.
Run this in terminal: `doclify update src/auth.js`
(Or use the Web UI to update that file).
- Doclify sees that only `src/auth.js` changed.
- It asks the AI to read ONLY `src/auth.js`.
- It reuses the saved summaries for the other 4 files.
- It generates a brand new README.
**Why this is amazing:** It saves time (3 seconds instead of 10), saves API calls, saves tokens, and saves money because you aren't paying the AI to re-read code that didn't change!

---

## PART 12 — CLI (COMMAND LINE INTERFACE)

You can run Doclify from your Terminal without the web browser!

| Command | What it does | Expected Result |
| :--- | :--- | :--- |
| `doclify init` | Scans your folder and creates a `doclify.yaml` settings file. | Says "Initialized doclify.yaml". |
| `doclify models` | Lists all available AI models you can use. | Shows a beautiful table of models. Error if API key is missing. |
| `doclify set default [model]`| Changes your default AI in the settings. | "Updated Default Model". |
| `doclify run` | Runs the full AI analysis on your folder. | Generates `README.md` and cache. |
| `doclify update [file]` | Updates the AI summary for just one file. | Generates new README instantly. |
| `doclify server` | Starts the backend and opens the web dashboard. | Browser opens to 127.0.0.1:8000. |

---

## PART 13 — THE API (Behind the Scenes)

The web dashboard talks to the backend Python engine using these simple endpoints:
- `GET /api/health`: Checks if the server is awake and the API key is present.
- `GET /api/models`: Asks Groq for a list of available AI models.
- `GET /api/projects`: Asks for a list of all your imported projects.
- `POST /api/projects/create/...`: Tells the backend to import a local folder, ZIP, or GitHub link.
- `GET /api/projects/{id}/files`: Asks for the list of files and their cached summaries to show in the File Explorer.
- `GET /api/projects/{id}/readme`: Asks for the generated markdown text to show on screen.
- `POST /api/projects/{id}/analyze`: Tells the backend to start the heavy AI work, and streams live progress back to the screen.

---

## PART 14 — AI MODEL / API KEY

- **Provider:** We use the **Groq API** because it uses special LPU chips that are lightning fast.
- **Default Model:** `llama-3.3-70b-versatile` (Meta's flagship open-source model).
- **Where is the key stored?** In a hidden file named `.env` on your computer.
- **Security:** The web browser NEVER sees your API key. GitHub NEVER sees your API key. It stays safely on your computer's backend.
- **Who pays?** You do, using your own Groq account (Groq currently has a very generous free tier).
- **How to change model:** Go to "Settings" in the Web UI, or type `doclify set default qwen/qwen3.6-27b` in terminal.
- **If key is missing:** The app will show a red error saying "Missing GROQ_API_KEY".

---

## PART 15 — REAL COMPLETE EXAMPLE

"I have a MERN project called ExpenseTracker."
1. **Start Doclify:** I double-click `start.command`. My browser opens.
2. **Create project:** I click "+", select "Local Directory", and type `/Users/me/ExpenseTracker`.
3. **Select project:** I click on the "ExpenseTracker" card on the dashboard.
4. **Analyze:** I click the "Analyze" button.
5. **Watch progress:** The drawer slides out. I watch it say "Summarizing file 1, 2, 3...".
6. **Understand summaries:** I click the "Files" tab, click `server.js`, and read the AI's short summary of my backend.
7. **Open README:** I click the "README" tab and see a gorgeous manual explaining my MERN stack.
8. **Download README:** I click the download icon and move the `README.md` into my actual project folder.
9. **Modify one file:** I open my code editor and add a new API route to `server.js`.
10. **Update project:** I go back to Doclify, click `server.js`, and click "Update File".
11. **See changed documentation:** In 3 seconds, my README is updated to include the new API route!

---

## PART 16 — WHAT SHOULD I NOT DO? (Beginner Checklist)

**DO NOT:**
- Do not upload or zip your `node_modules` or `.venv` folders. They contain thousands of junk files that will waste your API tokens!
- Do not commit your `.env` file to GitHub. Keep your API key secret!
- Do not commit the `.doclify` cache folder to GitHub (unless you want your team to share the cache).

---

## PART 17 — TROUBLESHOOTING

| Problem | Why it happens | What I should do |
| :--- | :--- | :--- |
| `setup.command` says "Python not found" | Mac doesn't have Python 3.9+ | Go to python.org and install Python 3. |
| Dashboard says "Missing API Key" | `.env` is missing or empty | Open `.env`, paste `GROQ_API_KEY=gsk_...` and save. |
| Model 404 Error / Not Found | The selected model is deprecated | Change model to `llama-3.3-70b-versatile` in Settings. |
| Analysis gets stuck forever | A massive file is stalling the AI | Check your code for massive generated files (like logs) and delete them or add them to `.gitignore`. |
| ZIP upload fails | Invalid ZIP structure | Ensure you zipped the *contents* of your folder, not just a random file. |
| Browser doesn't open automatically | OS permission issue | Manually open your browser and go to `http://127.0.0.1:8000`. |

---

## PART 18 — DEVELOPER MODE

Want to contribute to Doclify?
- **Frontend Development:** The React app is in `frontend/`. Run `npm install` and `npm run dev` to start the Vite hot-reloading server on port 3000.
- **Backend Development:** The FastAPI app is in `doclify/server.py`. It runs on port 8000.
- **AI Engine:** The core pipeline is in `doclify/components/`. Prompts are in `doclify/prompts/`.
- **Testing:** We use `pytest`. Run `source .venv/bin/activate && pytest tests/` to verify the API security and routing.
- **Production Build:** Run `npm run build` inside `frontend/`. This compiles the React app into static files in `frontend/dist/` which FastAPI automatically serves!

---

## PART 19 — ARCHITECTURE FOR INTERVIEWS

**30-Second Explanation:**
"Doclify is an AI documentation generator. Instead of feeding a whole repository into an LLM and hitting token limits, it uses a map-reduce architecture. It chunks files, generates behavioral summaries via Groq, caches them locally, and synthesizes a final README. It has a FastAPI backend and a React frontend."

**1-Minute Explanation:**
"Doclify solves codebase comprehension using a two-stage context engineering pipeline. First, a Python agent scans the repo respecting gitignore. It chunks files and hits the Groq API concurrently to generate Stage-1 summaries. These are stored in a local JSON cache, allowing O(1) incremental updates when a single file changes. Finally, a Stage-2 LLM synthesis step aggregates the cache into a production README. The architecture is split between a modular Python CLI/FastAPI backend and a Vite+React frontend that communicates via Server-Sent Events (SSE) for live streaming."

**3-Minute Technical Explanation:**
"The architecture is deeply decoupled. The core is a standalone Python package (`doclify`) that can be executed purely via CLI using `click`. 
For the Web Platform, `FastAPI` acts as a wrapper around the core engine. When an analysis starts, the backend spawns a daemon thread to run the AI pipeline and pushes state transitions (Init -> Extract -> Summarize -> Cache -> Synthesize) into a thread-safe Queue, which FastAPI yields as a `text/event-stream` (SSE) to the React frontend.
Security is a priority: The system utilizes strict path-traversal validation (`str(target).startswith(project_root)`) and Zip-Slip containment to sandbox uploaded codebases. 
The React frontend uses a dark zinc/emerald design system, featuring a WebGL/Canvas 3D particle torus operating on a 60FPS `requestAnimationFrame` loop. Because of the local caching mechanism, incremental documentation updates drop latency from 10+ seconds to ~3 seconds, saving massive amounts of API tokens while eliminating LLM hallucination."
