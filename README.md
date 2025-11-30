# 30 Days of Motia Automation

I’m Rishi, and this repository is my personal challenge: build 30 practical, production-ready backend automations in 30 days.

The goal is simple — move beyond no‑code tools, understand event‑driven systems properly, and build things that actually solve problems. I’m using Motia because it lets me focus on logic while the platform handles the infrastructure pieces.

This repo is my daily log of what I build, what breaks, and what I learn along the way.

---

## Progress

| Day | Project | Key Insight | Status |
|-----|---------|-------------|--------|
| **1** | [GitHub Release → Discord](./Day-1) | Validating incoming webhooks early prevents bad payloads from taking down the workflow. | Shipped |
| **2** | [GitHub Issues → Slack](./Day-2) | Defensive code matters — GitHub events can be inconsistent, and you can’t trust fields to always exist. | Shipped |
| **3** | Coming Soon | — | In progress |
| ... | | | |
| **30** | Finale | — | Upcoming |

---

## Day 1: GitHub Release Notifier

I often miss important library releases, and email notifications aren’t reliable.  
To fix that, I built a workflow that listens for GitHub release events and posts a formatted update to a Discord channel.

**Tech:** Webhooks, Zod validation, Discord embeds.

---

## Day 2: GitHub Issue Labeler

For Day 2, I focused on making things production‑safe.  
GitHub sends a wide range of issue-related events, and some of them have missing or unexpected fields. The workflow now handles multiple event types gracefully and keeps state without crashing on edge cases.

**Tech:** Multi‑event handling, state management, error‑tolerant execution.

---

## Stack

All automations in this challenge are built with:

- Motia  
- TypeScript  
- Zod  
- Node.js  

---

## Connect

I’m sharing the daily progress on:

- Twitter/X: https://twitter.com/rishixtwt  
- GitHub: https://github.com/rishi-jat  
- LinkedIn: https://linkedin.com/in/rishi-jat-496245320  

If you have an idea for an upcoming day, feel free to suggest it.

---

*Made with ❤️ by Rishi.*
