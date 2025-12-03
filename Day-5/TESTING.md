# 🧪 Day-5 Testing Guide

## Quick Test (Mock Mode)

This guide shows how to test Day-5 without needing X (Twitter) credentials.

### Step 1: Set Up Environment

```bash
cd Day-5
cp .env.example .env
```

Edit `.env` and add your OpenAI key:

```env
OPENAI_API_KEY=sk-your-actual-openai-key
MOCK_X=true
```

### Step 2: Install & Run

```bash
npm install
npm run dev
```

Server starts at `http://localhost:3005`

### Step 3: Send Test Request

Open a new terminal and run:

```bash
curl -X POST http://localhost:3005/tweet \
  -H "Content-Type: application/json" \
  -d '{
    "idea": "Just built an amazing AI-powered tweet automation with Motia!"
  }'
```

### Step 4: Verify Results

Watch the console output show:

```
✓ Receive Tweet Idea
✓ Generate Tweet Variations (or "Using cached variations")
✓ Select Best Tweet
✓ Post Tweet to X (Mock Mode)
✓ Write Tweet Result
```

Check generated file:

```bash
cat TWEET_RESULT.md
```

You should see:
- Original idea
- 3 AI-generated variations
- Selected best tweet
- Mock tweet URL

---

## Real X Posting

### Prerequisites

1. X Developer Account
2. App with OAuth 2.0 User Access Token
3. Read and Write permissions

### Setup

1. Get Bearer Token from [X Developer Portal](https://developer.twitter.com/)

2. Update `.env`:

```env
OPENAI_API_KEY=sk-your-key
X_BEARER_TOKEN=your-real-bearer-token
MOCK_X=false
```

3. Test with a safe tweet:

```bash
curl -X POST http://localhost:3005/tweet \
  -H "Content-Type: application/json" \
  -d '{"idea": "Testing my automation - feel free to ignore!"}'
```

4. Check your X profile for the posted tweet!

---

## Expected Workflow Events

```
1. POST /tweet → tweet.idea.received
2. AI Generate → tweet.variations.generated
3. Select Best → tweet.best.selected
4. Post to X  → tweet.posted.success
5. Write File → (no event, final step)
```

---

## Troubleshooting

### "OPENAI_API_KEY not configured"
- Check `.env` file exists
- Verify key starts with `sk-`
- Restart server after changing `.env`

### "X API request failed"
- Verify `X_BEARER_TOKEN` is correct
- Check token has write permissions
- Try setting `MOCK_X=true` first

### Cached Variations
- Same idea = cached results (1 hour)
- Change the idea text to generate new variations
- Or wait 1 hour for cache to expire

---

## Test Different Ideas

```bash
# Professional
curl -X POST http://localhost:3005/tweet \
  -H "Content-Type: application/json" \
  -d '{"idea": "Excited to share our latest feature release"}'

# Technical
curl -X POST http://localhost:3005/tweet \
  -H "Content-Type: application/json" \
  -d '{"idea": "Built a serverless event-driven system with 99.9% uptime"}'

# Casual
curl -X POST http://localhost:3005/tweet \
  -H "Content-Type: application/json" \
  -d '{"idea": "Coffee + Code = Perfect Monday morning"}'
```

---

## Stopping the Server

Press `Ctrl+C` in the terminal running `npm run dev`
