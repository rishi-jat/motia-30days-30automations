# GitHub Issue Workflow - Production-Safe Multi-Event Architecture

A bulletproof Motia backend that handles **any** GitHub webhook without crashing. Supports labels, comments, and gracefully ignores unknown events.

## 🛡️ Production Safety Features

- ✅ **Never crashes** - Defensive parsing with optional chaining everywhere
- ✅ **Multi-event support** - Handles both `issues.labeled` and `issue_comment.created`
- ✅ **Graceful degradation** - Returns `{ ok: true }` for unknown events
- ✅ **Missing fields protection** - Works even when GitHub sends incomplete data
- ✅ **Type-safe** - Full Zod validation with optional fields

## Architecture

```
GitHub Webhook (any type)
        ↓
GitHubWebhook (API) - Production-safe parsing
        ↓
     ┌──────┴──────┐
     ↓             ↓
Label Event    Comment Event
     ↓             ↓
Classifier    CommentNotifier
     ↓
StateUpdater
     ↓
SlackNotifier
```

## Supported Events

### 1. Issue Labeled (`issues.labeled`)
```
GitHub → API → Classifier → State → Slack
```
- Extracts: `issue.number`, `issue.title`, `label.name`
- Classifies priority (HIGH/MEDIUM/LOW)
- Stores in state
- Sends colored Slack notification

### 2. New Comment (`issue_comment.created`)
```
GitHub → API → CommentNotifier → Slack
```
- Extracts: `issue.number`, `comment.body`, `comment.user.login`
- Sends Slack notification with comment preview

### 3. Any Other Event
```
GitHub → API → Returns { ok: true }
```
- Logs event details
- Returns success
- **No crashes or errors**

## Steps Overview

### GitHubWebhook (API)
- **Path**: `POST /github/issue-labeled`
- **Purpose**: Production-safe webhook receiver
- **Emits**: `issue-label-received`, `issue-comment-received`
- **Safety**: Optional chaining on ALL field access

### IssueLabelClassifier (Event)
- Classifies label priority using keywords
- HIGH: bug, critical, urgent
- MEDIUM: enhancement, feature
- LOW: everything else

### IssueLabelStateUpdater (Event)
- Stores issue metadata in Motia state
- Key pattern: `issues:{number}`

### SlackLabelNotifier (Event)
- Sends priority-colored notifications
- 🔴 HIGH / 🟠 MEDIUM / 🟢 LOW

### IssueCommentNotifier (Event)
- Sends 💬 comment notifications
- Includes author and comment preview

## Setup

```bash
cd Day-2
npm install

# Set Slack webhook
echo 'SLACK_WEBHOOK_URL=https://hooks.slack.com/...' > .env

npm run dev
```

## GitHub Webhook Configuration

1. Repository → Settings → Webhooks
2. **Payload URL**: `https://your-domain.com/github/issue-labeled`
3. **Content type**: `application/json`
4. **Events**: Select:
   - ✅ Issues
   - ✅ Issue comments
5. Save

## Test It

### Test Label Event

```bash
curl -X POST http://localhost:3000/github/issue-labeled \
  -H "Content-Type: application/json" \
  -d '{
    "action": "labeled",
    "issue": {
      "number": 123,
      "title": "Critical bug",
      "html_url": "https://github.com/org/repo/issues/123"
    },
    "label": {
      "name": "bug"
    },
    "repository": {
      "full_name": "org/repo"
    }
  }'
```

Expected: 🔴 RED Slack notification

### Test Comment Event

```bash
curl -X POST http://localhost:3000/github/issue-labeled \
  -H "Content-Type: application/json" \
  -d '{
    "action": "created",
    "issue": {
      "number": 123,
      "title": "Feature request",
      "html_url": "https://github.com/org/repo/issues/123"
    },
    "comment": {
      "body": "This looks great! When can we ship it?",
      "user": {
        "login": "developer"
      }
    },
    "repository": {
      "full_name": "org/repo"
    }
  }'
```

Expected: 💬 Slack comment notification

### Test Invalid Event (No Crash!)

```bash
curl -X POST http://localhost:3000/github/issue-labeled \
  -H "Content-Type: application/json" \
  -d '{
    "action": "unknown_action",
    "something": "random"
  }'
```

Expected: `{ "ok": true }` (graceful handling)

### Test Missing Fields (No Crash!)

```bash
curl -X POST http://localhost:3000/github/issue-labeled \
  -H "Content-Type: application/json" \
  -d '{
    "action": "labeled"
  }'
```

Expected: `{ "ok": true }` (defensive parsing works!)

## What Makes This Production-Safe?

### Before (Crashes)
```typescript
const labelName = payload.label.name  // ❌ Crashes if label is undefined
```

### After (Safe)
```typescript
const labelName = payload?.label?.name  // ✅ Returns undefined safely
if (!labelName) {
  return { ok: true }  // Graceful exit
}
```

### All Fields Are Optional

```typescript
// Types allow ANY combination of fields
issue?: {
  number?: number
  title?: string
  ...
}
label?: {
  name?: string
  ...
}
```

### Defensive Checks Everywhere

```typescript
if (action === 'labeled' && payload?.label) {
  const labelName = payload.label.name
  if (!labelName || !issueNumber) {
    // Missing required fields → skip silently
    return { ok: true }
  }
  // Only proceed if ALL required data exists
}
```

## State Management

View state in Workbench: `http://localhost:3000`

State structure:
```json
{
  "label": "bug",
  "priority": "HIGH",
  "repo": "org/repo",
  "updatedAt": "2025-11-30T00:00:00.000Z"
}
```

## Architecture Benefits

- **Crash-proof**: Handles malformed/incomplete webhooks
- **Extensible**: Easy to add more event types
- **Observable**: Detailed logging at every step
- **Testable**: Can test with minimal payloads
- **Production-ready**: Used in real-world GitHub integrations

---

**Day 2: From prototype to production-grade system** 🚀
