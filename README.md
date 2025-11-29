# 🚀 30 Days of Motia Automation

A comprehensive 30-day challenge building production-ready backend automations using **[Motia](https://motia.dev)** - an open-source unified backend framework.

> **Goal:** Master Motia by converting n8n workflows, building event-driven systems, and creating scalable backend solutions following exact architectural patterns.

## 📊 Challenge Progress

| Day | Project | Status | Tech Stack |
|-----|---------|--------|------------|
| **1** | [GitHub Release Notifier](#-day-1-github-release-notifier) | ✅ Complete | Motia, TypeScript, Discord API, Zod |
| **2** | TBD | 🔜 Coming Soon | - |
| **3-30** | TBD | ⏳ Planned | - |

---

## 📅 Day 1: GitHub Release Notifier

**Status:** ✅ Complete | **Directory:** [`Day-1/`](./Day-1)

### Overview

Converted an n8n GitHub Release webhook → Discord notification workflow into a production-ready Motia backend with full error handling, DDD architecture, and type safety.

### What Was Built

#### **Architecture**
```
GitHub Webhook → API Step → Event Emit → Discord Notification Event Step
```

#### **Features Implemented**
- ✅ **API Webhook Endpoint** - `POST /github/webhook` receives GitHub release webhooks
- ✅ **Event-Driven Processing** - Background Discord notifications via event emits
- ✅ **Error Handling Middleware** - Catches ZodError, custom errors, generic errors
- ✅ **Custom Error Classes** - BaseError, ExternalServiceError, NotFoundError
- ✅ **DDD Service Layer** - Discord service following Domain-Driven Design
- ✅ **Full Type Safety** - Zod schemas, auto-generated TypeScript types
- ✅ **Production-Ready Logging** - Structured logging with context

#### **Tech Stack**
- **Framework:** Motia v0.13.1
- **Language:** TypeScript
- **Validation:** Zod
- **Integration:** Discord Webhooks
- **Architecture:** DDD (Domain-Driven Design)

#### **File Structure**
```
Day-1/
├── src/
│   ├── errors/                    # Custom error classes
│   │   ├── base.error.ts
│   │   ├── external-service.error.ts
│   │   └── not-found.error.ts
│   ├── middlewares/               # Error handling middleware
│   │   └── core.middleware.ts
│   └── services/discord/          # DDD service layer
│       ├── types.ts
│       ├── send-notification.ts
│       └── index.ts
├── steps/github-release-notifier/
│   ├── github-webhook.step.ts    # API endpoint
│   ├── discord-notification.step.ts # Event handler
│   └── README.md                 # Setup guide
└── [Motia config files]
```

#### **Key Learnings**
- Exact `.mdc` pattern implementation from Motia documentation
- Error handling middleware for ZodError and custom errors
- DDD service organization with named exports
- Event-driven architecture for background processing
- Environment variable management with `.env`

#### **Setup & Run**
```bash
cd Day-1
npm install

# Set environment variable
echo 'DISCORD_WEBHOOK_URL=your_webhook_url' > .env

# Start development server
npm run dev

# Test webhook
curl -X POST http://localhost:3000/github/webhook \
  -H "Content-Type: application/json" \
  -d @test-payload.json
```

**[📖 View Full Day-1 Documentation](./Day-1/steps/github-release-notifier/README.md)**

---

## 🎯 Challenge Goals

### Learning Objectives

- ✅ Master Motia's step types (API, Event, Cron)
- ✅ Implement exact `.mdc` architectural patterns
- ✅ Build production-ready error handling
- ✅ Apply Domain-Driven Design principles
- ✅ Create type-safe backends with Zod
- 🔜 Integrate with various external APIs
- 🔜 Build real-time streaming applications
- 🔜 Implement complex workflow orchestrations
- � Deploy to production environments

### Technical Focus Areas

1. **Event-Driven Architecture** - Background jobs, queueing, workflows
2. **Type Safety** - Zod schemas, TypeScript, auto-generated types
3. **Error Handling** - Middleware, custom errors, logging
4. **DDD Patterns** - Services, repositories, clean architecture
5. **API Integrations** - Discord, GitHub, Slack, and more
6. **Real-time Features** - WebSockets, SSE, streaming
7. **Production Practices** - Environment config, testing, deployment

---

## 🛠️ Technologies

### Core Stack
- **[Motia](https://motia.dev)** - Unified backend framework
- **TypeScript** - Type safety and developer experience
- **[Zod](https://zod.dev)** - Schema validation
- **Node.js** - Runtime environment

### Integrations (Growing)
- ✅ Discord API
- ✅ GitHub Webhooks
- 🔜 Slack API
- 🔜 OpenAI API
- 🔜 Email services
- 🔜 Database integrations

---

## 📁 Repository Structure

```
motia-automation/
├── README.md              # This file
├── .gitignore            # Shared ignore rules
├── Day-1/                # GitHub Release Notifier
│   ├── .env              # Day-1 environment variables
│   ├── steps/
│   ├── src/
│   └── README.md
├── Day-2/                # Next automation
├── Day-3/
...
└── Day-30/               # Final capstone project
```

**Note:** Each day is an independent Motia project with its own dependencies and configuration.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Git
- Code editor (VS Code recommended)

### Clone & Explore
```bash
git clone https://github.com/rishi-jat/motia-github-release-notifier.git
cd motia-automation

# Start with Day-1
cd Day-1
npm install
npm run dev
```

### Follow Along
Each day includes:
- ✅ Complete source code
- ✅ README with setup instructions
- ✅ Documentation and architecture notes
- ✅ Testing commands

---

## 📚 Resources

- **Motia Documentation:** https://motia.dev/docs
- **Motia GitHub:** https://github.com/MotiaDev/motia
- **Discord Community:** https://discord.gg/motia
- **n8n (Original Workflows):** https://n8n.io

---

## 👤 Author

**Rishi Jat**
- GitHub: [@rishi-jat](https://github.com/rishi-jat)
- Twitter: [@rishixtwt](https://twitter.com/rishixtwt)
- LinkedIn: [rishi-jat](https://linkedin.com/in/rishi-jat-496245320)

---

## 📝 License

This project is open source and available under the MIT License.

---

## 🤝 Contributing

While this is a personal learning challenge, feel free to:
- ⭐ Star the repository
- 🐛 Report issues
- 💡 Suggest new automation ideas
- 🔀 Fork and create your own version

---

## 🎓 Day-by-Day Curriculum (Coming Soon)

- **Days 1-10:** Fundamentals & Integrations
  - Day 1: ✅ GitHub → Discord notifications
  - Day 2-10: 🔜 Various API integrations

- **Days 11-20:** Advanced Patterns & Real-time
  - Streaming, WebSockets, Complex workflows

- **Days 21-30:** Production & Scale
  - Deployment, monitoring, advanced architectures

Stay tuned for daily updates! 🚀

---

<p align="center">
  <strong>Built with ❤️ using <a href="https://motia.dev">Motia</a></strong>
</p>
