# 30 Days of Motia Automation 🚀

I'm challenging myself to build 30 real-world automation projects in 30 days using [Motia](https://motia.dev).

The goal isn't just to write code, but to actually understand how to build scalable, event-driven backends without getting bogged down in boilerplate. I'm converting a lot of my old n8n workflows into proper code because I want more control and better error handling.

## Progress

| Day | Project | Status |
|-----|---------|--------|
| **1** | GitHub → Discord Notifier | ✅ Done |
| **2-30** | *Cooking...* | 🔜 |

---

## Day 1: GitHub Release Notifier

I started with something I actually needed. I maintain a few repos and I hate manually checking for releases or relying on email spam. I wanted a clean Discord notification whenever a new release drops.

### How it works

It's a pretty straightforward event-driven flow:
1. GitHub hits my webhook endpoint
2. The API validates the payload (so nothing crashes if GitHub changes something)
3. It emits an event internally
4. A background worker picks that up and formats a nice Discord embed

### The Stack

- **Motia** (obviously)
- **TypeScript**
- **Zod** for validation (lifesaver)
- **Discord Webhooks**

### What I learned today

Honestly, the coolest part was the error handling. I set up this middleware that catches everything - validation errors, custom logic errors, you name it. It feels way more robust than my old low-code setup where things would just silently fail.

Also, structuring it with Domain-Driven Design (DDD) felt like overkill at first for a simple notifier, but now that I see the code, it's super clean. The logic is separated from the API handlers, which makes testing way easier.

### Running it

If you want to try it out:

```bash
cd Day-1
npm install
# You'll need a Discord webhook URL in your .env file
npm run dev
```

Check the `Day-1` folder for the full code.

---

## What's coming next?

I'm not 100% sure what I'll build for the rest of the month, but I'm thinking about:
- Slack bots
- Email automation
- Maybe some cron jobs for data scraping?
- Real-time dashboards

If you have ideas, let me know!

## Connect with me

I'm documenting this whole journey here and on my socials:
- GitHub: [@rishi-jat](https://github.com/rishi-jat)
- Twitter: [@rishixtwt](https://twitter.com/rishixtwt)
- LinkedIn: [rishi-jat](https://linkedin.com/in/rishi-jat-496245320)

Feel free to fork this and follow along if you want to learn Motia too!
