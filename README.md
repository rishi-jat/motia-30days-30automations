# 30 Days of Motia Automation 🚀

**Hi, I'm Rishi.** 👋

I've decided to challenge myself: **Build 30 real-world, production-ready backend automations in 30 days.**

Why? Because I wanted to stop relying on flaky no-code tools and actually *master* event-driven architecture. I'm using [Motia](https://motia.dev) to build these because it lets me write actual code (TypeScript) but handles all the infrastructure boring stuff for me.

This repo is my daily log. No "hello world" apps here—only real tools that I (or you) can actually use.

---

## 🗺️ The Journey So Far

| Day | Project | The "Aha!" Moment | Status |
|-----|---------|-------------------|--------|
| **1** | [**GitHub Release → Discord**](./Day-1) | "Wait, I can validate webhooks *before* processing them?" | ✅ Shipped |
| **2** | [**GitHub Issues → Slack**](./Day-2) | "Defensive coding saves servers from crashing." | ✅ Shipped |
| **3** | *Coming Soon...* | *TBD* | 🚧 Brewing |
| ... | | | |
| **30** | *The Finale* | | 🔜 |

---

## 🧩 Day 1: Solving My FOMO
**Project:** [GitHub Release Notifier](./Day-1)

I always miss new releases from my favorite libraries. I used to rely on emails, but they get buried.
So, I built a bot that listens for GitHub releases and posts a beautiful card to my Discord server.

**Tech:** Webhooks, Zod Validation, Discord Embeds.

---

## �️ Day 2: Making It Bulletproof
**Project:** [GitHub Issue Labeler](./Day-2)

Day 1 was easy. Day 2 was about **production safety**.
I built a workflow that handles GitHub Issues (labels & comments). The hard part? GitHub sends *weird* data sometimes.
I learned how to write "defensive code" that gracefully handles missing fields, unknown events, and even database failures without crashing the whole system.

**Tech:** Multi-event handling, State Management, Graceful Degradation.

---

## 🛠️ The Stack

Everything in this repo is built with:
*   **Motia** (The backbone)
*   **TypeScript** (Because types save lives)
*   **Zod** (Trust no payload)
*   **Node.js**

---

## 🔗 Connect With Me

I'm documenting the daily struggle and wins here:

*   **Twitter/X:** [@rishixtwt](https://twitter.com/rishixtwt)
*   **GitHub:** [@rishi-jat](https://github.com/rishi-jat)
*   **LinkedIn:** [Rishi Jat](https://linkedin.com/in/rishi-jat-496245320)

Follow along! If you have an idea for Day 3, let me know. 👇

---
*Made with ❤️ (and a lot of coffee) by Rishi.*
