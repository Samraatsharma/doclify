# DOCLIFY QUICK START CHEAT SHEET

## 1. INSTALL
- **macOS:** Double-click `setup.command`
- **Windows:** Double-click `setup.bat`
- **Linux:** Run `./setup.sh` in terminal

## 2. ADD API KEY
1. Get a free API key at [console.groq.com/keys](https://console.groq.com/keys)
2. Open the `.env` file in the Doclify folder.
3. Paste your key: `GROQ_API_KEY=gsk_yourkeyhere`
4. Save the file.

## 3. START DOCLIFY
- **macOS:** Double-click `start.command`
- **Windows:** Double-click `start.bat`
- **Linux:** Run `./start.sh`
*(This will automatically open http://127.0.0.1:8000 in your browser)*

## 4. CREATE PROJECT
1. In the Web UI, click **"Analyze a project"**.
2. Select **Local Directory**, **ZIP File**, or **GitHub URL**.
3. Point it to your code and click Import.

## 5. ANALYZE
1. Click the **"Analyze"** button in the top right of your project workspace.
2. Watch the live progress as AI summarizes your code!

## 6. VIEW README
1. When analysis is complete, click the **README** tab.
2. Read your new documentation.
3. Click the **Download** icon to save it into your actual project!

## 7. UPDATE (When you change code)
1. If you modify a file in your project, go to the **Files** tab in Doclify.
2. Click the modified file.
3. Click **Update File**. (It only takes ~3 seconds because of the cache!)

## 8. CLI COMMANDS (For Terminal Users)
Run these inside the Doclify folder (after activating the `.venv`):
- `doclify init`: Setup a folder.
- `doclify run`: Generate README.
- `doclify update <file>`: Update one file.
- `doclify models`: List AI models.
- `doclify server`: Open web dashboard.

## 9. TROUBLESHOOTING
- **"Missing GROQ_API_KEY"**: You forgot Step 2! Edit the `.env` file.
- **Model 404 Error**: Change the model to `llama-3.3-70b-versatile` in the Settings tab.
- **Browser doesn't open**: Manually type `http://127.0.0.1:8000` into Chrome/Safari.
