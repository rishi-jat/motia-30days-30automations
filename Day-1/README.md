# Day 1: GitHub Release → Discord Notifier 🚀

For the first day of my **30 Days of Motia** challenge, I wanted to solve a simple problem: I always miss new releases from my favorite open-source libraries.

I used to have an n8n workflow for this, but it was flaky and hard to debug. So, I rebuilt it as a proper backend service using Motia.

## What I Built

A simple, event-driven automation that:
1.  **Listens** for GitHub webhooks (`release.published`)
2.  **Validates** the payload (so we don't process garbage)
3.  **Formats** a nice Discord embed message
4.  **Sends** it to my server

It sounds simple, but doing it with **TypeScript and Zod** means it's way more robust than my old drag-and-drop setup.

## How It Works

I split the logic into two parts (Steps):

1.  **`GitHubWebhook` (API Step)**: This is the entry point. It receives the POST request from GitHub, checks if it's actually a release event, and if so, emits an internal event called `github-release-published`.
2.  **`DiscordNotification` (Event Step)**: This listens for that internal event. When it hears it, it grabs the release details (version, body, URL) and shoots a message to Discord.

Separating them means I can easily add more listeners later (like sending an email or a Slack msg) without touching the webhook logic.

## How to Run It

If you want to try this out:

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Set up your environment**:
    Create a `.env` file in this folder:
    ```bash
    DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your-id/your-token
    ```

3.  **Start the server**:
    ```bash
    npm run dev
    ```

## Testing It

You don't need to wait for a real library to release something. You can fake it with `curl`:

```bash
curl -X POST http://localhost:3000/github/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "action": "published",
    "release": {
      "name": "v1.0.0",
      "body": "Initial release with cool features!",
      "html_url": "https://github.com/vercel/next.js/releases/tag/v1.0.0"
    },
    "repository": {
      "full_name": "vercel/next.js"
    }
  }'
```

If everything works, you should see a message pop up in your Discord!

## What I Learned

- **Motia is fast.** I got the basic flow running in about 10 minutes.
- **Zod is a lifesaver.** Defining the schema upfront made writing the logic so much easier because I knew exactly what data I had.
- **Event-driven is clean.** I love that my API handler doesn't know anything about Discord. It just says "Hey, a release happened!" and moves on.

Onto Day 2! 👋

