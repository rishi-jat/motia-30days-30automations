# Day 2: GitHub Issue Labels → Slack Notifier 🛠️

Day 1 was fun, but for Day 2, I wanted to tackle something real: **Production Safety**.

Building a webhook handler is easy. Building one that **doesn't crash** when GitHub sends you 50 different types of events is hard. That was my goal today.

I built a workflow that listens to GitHub Issues. When you label an issue (e.g., "bug"), it notifies Slack. When you comment, it notifies Slack. But most importantly, if you send it garbage, it just smiles and says "OK".

## The Challenge

GitHub webhooks are messy. You might subscribe to "Issues", but you'll get events for `opened`, `edited`, `deleted`, `labeled`, `unlabeled`, and more.

If your code does this:
```typescript
const label = payload.label.name // 💥 CRASH if payload.label is missing!
```
...your server dies. I wanted to avoid that.

## What I Built

I designed a **4-node event-driven flow**:

1.  **`GitHubWebhook` (API)**: The bouncer. It takes *any* request. It uses "defensive parsing" (lots of `?.` checks) to see what it is.
    -   Is it a label event? → Emit `issue-label-received`
    -   Is it a comment? → Emit `issue-comment-received`
    -   Is it weird? → Log it and ignore it. **No crashes.**

2.  **`IssueLabelClassifier`**: The brain. It looks at the label name.
    -   "bug", "urgent" → **HIGH Priority** 🔴
    -   "feature" → **MEDIUM Priority** 🟠
    -   Everything else → **LOW Priority** 🟢

3.  **`IssueLabelStateUpdater`**: The memory. It saves the issue state to Motia's built-in state store.
    -   *Self-correction:* I actually had a bug here where this step would crash if the state store was down. I fixed it by wrapping it in a `try-catch` block so the notification still goes out even if saving fails. Graceful degradation!

4.  **`SlackLabelNotifier`**: The messenger. It takes that priority and sends a beautifully colored Slack attachment.

## How to Run It

1.  **Install**:
    ```bash
    npm install
    ```

2.  **Setup Slack**:
    Get a generic webhook URL from Slack and put it in `.env`:
    ```bash
    SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
    ```

3.  **Run**:
    ```bash
    npm run dev
    ```

## Testing (Locally)

You don't need to spam a real GitHub repo to test this. I used `curl` to simulate events:

**Test a Label Event:**
```bash
curl -X POST http://localhost:3000/github/issue-labeled \
  -H "Content-Type: application/json" \
  -d '{
    "action": "labeled",
    "issue": { "number": 123, "title": "Production Crash", "html_url": "..." },
    "label": { "name": "urgent" },
    "repository": { "full_name": "my/repo" }
  }'
```
*Result:* You should see a **RED** notification in Slack.

**Test a Comment:**
```bash
curl -X POST http://localhost:3000/github/issue-labeled \
  -H "Content-Type: application/json" \
  -d '{
    "action": "created",
    "issue": { "number": 123 },
    "comment": { "body": "Fixed it!", "user": { "login": "rishi" } },
    "repository": { "full_name": "my/repo" }
  }'
```
*Result:* You get a comment notification.

## Key Takeaways

- **Defensive Coding is key.** Never trust the payload. Always check if fields exist.
- **Graceful Degradation.** If one part (like state storage) fails, the whole user experience shouldn't break.
- **Event-Driven is flexible.** I added the "Comment" feature halfway through, and I didn't have to touch the Label logic at all. I just added a new listener.

Day 2 is in the books! ✅
