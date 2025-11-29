# 30 Days of Motia Automation 🚀

This repository is my personal challenge to build **30 real-world, production‑ready backend automations in 30 days** using [Motia](https://motia.dev).  
Everything here is built with ❤️ by Rishi — using Motia, TypeScript, clean architecture, and an event‑driven mindset.

The goal is simple:  
**Turn ideas and old n8n workflows into scalable, testable, maintainable backends — one day at a time.**

---

## 🌟 Progress Tracker

| Day | Project | Status |
|-----|---------|--------|
| **1** | GitHub Release → Discord Notifier | ✅ Completed |
| **2–30** | Coming Soon | 🔜 |

Each day lives in its own folder:

```
Day-1/
Day-2/
...
Day-30/
```

---

# 🧩 Day 1 — GitHub Release Notifier

For the first automation, I rebuilt an old n8n workflow as a proper backend service in Motia.

### 🔥 What it does

Whenever a GitHub repository publishes a new release:

1. GitHub sends a webhook  
2. Motia’s API step receives and validates it using Zod  
3. An internal event `github-release-published` is emitted  
4. An event step listens, formats a rich Discord embed, and sends the notification  

This replaces noisy emails + unreliable no‑code triggers with a **clean, fast, scalable event-driven backend**.

---

## 🛠️ Tech Stack

- **Motia** (API Steps, Event Steps, Flow Orchestration)
- **TypeScript**
- **Zod** (runtime-safe validation)
- **Domain-Driven Design Services**
- **Custom Error Middleware**
- **Discord Webhooks**

---

## 📚 What I Learned on Day 1

### ✔ Event-driven design is incredibly powerful  
API stays fast; background workers handle all heavy lifting.

### ✔ Motia + AI accelerates backend development  
Paste JSON → scaffold → refine → ship.

### ✔ Clean architecture pays off  
Separating services, steps, validations, and middleware makes the automation genuinely maintainable.

### ✔ This is miles better than the old n8n workflow  
More control, better errors, easier to read, easier to test.

Made with ❤️ by Rishi.

---

## ▶️ Running the Day‑1 Automation

```bash
cd Day-1
npm install
npm run dev
```

Create a `.env` file:

```
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_ID/YOUR_TOKEN
```

### Test it using curl:

```bash
curl -X POST http://localhost:3000/github/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "action": "published",
    "release": {
      "name": "v1.0.0",
      "body": "Initial release",
      "html_url": "https://github.com/vercel/next.js/releases/tag/v1.0.0"
    },
    "repository": {
      "full_name": "vercel/next.js"
    }
  }'
```

You’ll instantly see the formatted message in your Discord channel.

---

# 🚀 What’s Coming Next (Days 2–30)

I'm exploring:

- Slack and Discord bots  
- Email automation  
- Cron-based pipelines  
- Real-time data dashboards  
- GitHub automation tools  
- AI-powered workflows  
- Multi-step backend flows  
- Monitoring + audit pipelines  

If you have ideas, DM me — I’d love to build them.

---

## 🔗 Follow the Journey

Daily updates here and on socials:

- GitHub: https://github.com/rishi-jat  
- X (Twitter): https://twitter.com/rishixtwt  
- LinkedIn: https://linkedin.com/in/rishi-jat-496245320  

**Hashtag:** `#30days30automations`

---

## ❤️ Made by Rishi — Powered by Motia  
This challenge is helping me grow, experiment, and understand scalable backend systems deeply.  
Day 1 done.  
Day 2 loading…
