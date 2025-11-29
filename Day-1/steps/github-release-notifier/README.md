# GitHub Release Notifier

A Motia backend implementation that receives GitHub release webhooks and sends notifications to Discord.

## Architecture

```
GitHub Webhook → API Step → Event Emit → Discord Notification Event Step
```

**Flow:** `github-release-notifier`

### Steps

1. **GitHubWebhook** (API Step)
   - Endpoint: `POST /github/webhook`
   - Receives GitHub release webhook payloads
   - Validates with Zod schema
   - Emits `github-release-published` event

2. **DiscordNotification** (Event Step)
   - Subscribes to: `github-release-published`
   - Sends formatted notification to Discord webhook

## Setup

### Environment Variables

```bash
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_TOKEN
```

### GitHub Webhook Configuration

1. Go to your repository → Settings → Webhooks
2. Add webhook:
   - **Payload URL**: `https://your-domain.com/github/webhook`
   - **Content type**: `application/json`
   - **Events**: Select "Releases" only
3. Save webhook

## Testing

### Test with curl

```bash
curl -X POST http://localhost:3000/github/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "action": "published",
    "release": {
      "name": "v1.0.0",
      "body": "Initial release",
      "html_url": "https://github.com/vercel/next.js/releases/tag/v1.0.0",
      "tag_name": "v1.0.0",
      "published_at": "2025-11-29T12:30:00Z",
      "author": {
        "login": "developer",
        "avatar_url": "https://avatars.githubusercontent.com/u/123456"
      }
    },
    "repository": {
      "name": "next.js",
      "full_name": "vercel/next.js",
      "html_url": "https://github.com/vercel/next.js"
    }
  }'
```

### Test Invalid Payload (ZodError handling)

```bash
curl -X POST http://localhost:3000/github/webhook \
  -H "Content-Type: application/json" \
  -d '{"invalid": "data"}'
```

Expected: `400 Bad Request` with validation errors

## Implementation Details

### Error Handling

Following `error-handling.mdc` patterns:

- `BaseError` class for structured errors
- `ExternalServiceError` for Discord webhook failures
- Core middleware handles ZodError, BaseError, and generic errors

### Service Layer

Following DDD architecture from `architecture.mdc`:

- `src/services/discord/` - Discord integration service
- Named export functions
- Custom error classes

### Middleware

API step includes `coreMiddleware` for automatic error handling per `middlewares.mdc`.

## File Structure

```
steps/github-release-notifier/
├── github-webhook.step.ts      # API endpoint
└── discord-notification.step.ts # Event handler

src/
├── services/discord/
│   ├── types.ts                # Zod schemas & types
│   ├── send-notification.ts    # Discord webhook sender
│   └── index.ts                # Service aggregator
├── errors/
│   ├── base.error.ts           # Base error class
│   ├── external-service.error.ts
│   └── not-found.error.ts
└── middlewares/
    └── core.middleware.ts      # Error handling middleware
```

## Workbench

View at `http://localhost:3000` to see the complete flow visualization.
