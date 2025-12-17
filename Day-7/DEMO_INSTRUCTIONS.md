# 🎥 Day-7 Real Testing & Demo Guide

Your Day-7 workflow is **WORKING**, but your GitHub token is invalid (`Unauthorized`).

## 1. Fix Authentication
1. Open `.env` file.
2. Replace `GITHUB_TOKEN` with your **newly generated token**.
   (Make sure it starts with `github_pat_` and has no extra spaces)
3. **Restart the Server** (Critical!):
   - Press `Ctrl+C` in your terminal to stop the current one.
   - Run: `npm run dev`

## 2. Recording the Demo
Once you see `🚀 Server ready...`:

### Step A: Show the Setup
"Here is my Day-7 project. It uses Motia to generate release notes automatically."

### Step B: Run the Test (Real Repo)
Paste this command in a new terminal tab:

```bash
curl -X POST http://localhost:3000/api/release-notes \
  -H "Content-Type: application/json" \
  -d '{"repo": "rishi-jat/motia-github-release-notifier"}'
```

### Step C: Show the Result
1. Wait about **10-15 seconds**.
2. Look in the `Day-7/output/` folder.
3. You will see a new file (e.g., `rishi-jat-motia-....md`).
4. Open it to show the AI-generated notes!

## Troubleshooting
- If you see `Unauthorized` in logs: Your token is still wrong.
- If you see `Not Found`: The repo name might be wrong (check `git remote -v`).
