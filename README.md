# 30 Days of Motia Automation 🚀

Hey! I'm taking on a 30-day challenge to master [Motia](https://motia.dev) by building real automation projects. No tutorials, no todo apps - just practical backend systems that actually do something useful.

## What's Motia?

It's this cool open-source framework that unifies everything you need for backend work - APIs, background jobs, queues, state management, and more. Think of it as a single tool that replaces your entire backend stack.

## The Challenge

Build 30 automation projects in 30 days. Each day, I'm converting n8n workflows or building new integrations from scratch using Motia. The goal is to get really good at event-driven architecture and understand how production backends actually work.

## Progress So Far

| Day | What I Built | Status |
|-----|--------------|--------|
| **1** | GitHub → Discord Release Notifier | ✅ Done |
| **2-30** | Coming up... | 🔜 |

---

## Day 1: GitHub Release Notifier

**Took:** ~4 hours | **Difficulty:** Medium | **Status:** Working! ✅

### The Idea

You know how annoying it is to manually check GitHub for new releases? I built a system that watches GitHub releases and instantly sends a nice formatted message to Discord. Originally an n8n workflow, but I rebuilt it properly in Motia.

### What It Does

```
GitHub sends webhook → My API catches it → Emits event → Discord gets notified
```

Pretty simple flow, but I went all in on the implementation:

**The Good Stuff:**
- Receives GitHub webhooks at `/github/webhook`
- Validates everything with Zod (no bad data gets through)
- Processes notifications in the background (fast API responses!)
- Sends beautiful Discord embeds with release info
- Has proper error handling (it actually tells you what went wrong)
- Follows DDD patterns (services, clean architecture, all that)

**Tech I Used:**
- Motia (obviously)
- TypeScript because I like my types
- Zod for validation
- Discord Webhooks API

### The Code Structure

I organized it properly this time:

```
Day-1/
├── src/
│   ├── errors/              # Custom error classes (BaseError, etc.)
│   ├── middlewares/         # Error catching middleware
│   └── services/discord/    # Discord integration service
├── steps/
│   └── github-release-notifier/
│       ├── github-webhook.step.ts      # Receives webhooks
│       └── discord-notification.step.ts # Sends to Discord
└── README.md
```

### What I Learned

1. **Error handling is crucial** - Built custom error classes and middleware that catches everything (ZodError, custom errors, generic exceptions)
2. **DDD actually makes sense** - Separating services from steps keeps things clean
3. **Event-driven is powerful** - API responds instantly, Discord notification happens in background
4. **Motia's patterns are solid** - Their `.mdc` documentation files are gold

### Try It Yourself

```bash
cd Day-1
npm install

# Add your Discord webhook
echo 'DISCORD_WEBHOOK_URL=your_webhook' > .env

npm run dev

# Test it
curl -X POST http://localhost:3000/github/webhook \
  -H "Content-Type: application/json" \
  -d @test-payload.json
```

Check the `Day-1/` folder for detailed setup instructions.

---

## What's Next?

I'm planning to build:

**Days 2-10:** Different integrations
- Slack notifications
- Email automations  
- Tweet schedulers
- Whatever seems useful

**Days 11-20:** Real-time stuff
- WebSocket connections
- Live data streams
- Chat systems

**Days 21-30:** Production-ready apps
- Deployment setups
- Monitoring
- Complex workflows

Haven't planned everything yet - I'm figuring it out as I go. If you have ideas, open an issue!

## Tech Stack

**Framework:** Motia  
**Language:** TypeScript (might try Python for some days)  
**Validation:** Zod  
**Architecture:** Event-driven, DDD patterns

**Integrations so far:**
- ✅ Discord
- ✅ GitHub Webhooks
- More coming...

## Run Any Day

Each day is independent:

```bash
cd Day-X
npm install
npm run dev
```

Check each day's README for specific setup.

## Learning Resources

Stuff that's been helpful:
- [Motia Docs](https://motia.dev/docs) - Actually good documentation
- [Motia Discord](https://discord.gg/motia) - Helpful community
- The `.mdc` files in each project - Architectural patterns

## The Repo

```
motia-30days-30automations/
├── Day-1/    # GitHub → Discord
├── Day-2/    # TBD
├── Day-3/    # TBD
...
└── Day-30/   # Final project
```

## About Me

I'm Rishi, learning backend development by building real stuff. Find me:
- GitHub: [@rishi-jat](https://github.com/rishi-jat)
- Twitter: [@rishixtwt](https://twitter.com/rishixtwt)
- LinkedIn: [rishi-jat](https://linkedin.com/in/rishi-jat-496245320)

## Contributing

This is my personal learning journey, but:
- ⭐ Star if you find it useful
- 🐛 Open issues if something's broken
- 💡 Suggest automation ideas
- 🍴 Fork and build your own version

## License

MIT - do whatever you want with it

---

**Building with [Motia](https://motia.dev) · One automation at a time**
