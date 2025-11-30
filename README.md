# 30 Days of Motia Automation 🚀

This repository is my personal challenge to build **30 real-world, production‑ready backend automations in 30 days** using [Motia](https://motia.dev).  
Everything here is built with ❤️ by Rishi — using Motia, TypeScript, clean architecture, and an event‑driven mindset.

The goal is simple:  
**Turn ideas and old n8n workflows into scalable, testable, maintainable backends — one day at a time.**

---

## 🌟 Progress Tracker

| Day | Project | Status |
|-----|---------|--------|
| **1** | GitHub → Discord Notifier | ✅ Done |
| **2** | GitHub Issue Labels → Slack | ✅ Done |
| **3-30** | *Cooking...* | 🔜 |

Each day lives in its own folder:

```
Day-1/
Day-2/
...
Day-30/
```

---

# 🧩 Day 1 — GitHub Release Notifier

For the first automation, I rebuilt an old n8n workflow as a proper backend service.

### What I Built
A simple flow that listens for `release.published` webhooks from GitHub and posts them to Discord. It replaces my flaky no-code setup with something that actually validates data before acting on it.

[Check out the Day 1 code](./Day-1)

---

# 🛠️ Day 2 — GitHub Issue Labels → Slack

Day 1 was about getting it working. Day 2 was about **making it bulletproof**.

### What I Built
A multi-event workflow that handles GitHub Issues.
- **Labels:** If you tag an issue as "bug", it pings Slack in RED. "Feature" gets ORANGE.
- **Comments:** It also listens for new comments and notifies the team.

### The Focus: Production Safety
I spent most of the time ensuring this **never crashes**. GitHub sends a lot of random events, and if you don't check for missing fields, your server dies. I implemented "defensive parsing" and graceful degradation (so if one part fails, the rest still works).

[Check out the Day 2 code](./Day-2)


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
