# Day-6: AI Log Analyzer 🔍

A Motia-powered workflow that takes raw logs via API, analyzes them using LLM (GPT-4), and generates a comprehensive `INCIDENT_REPORT.md`.

## 🌊 Flow Architecture

```
POST /analyze-logs
       ↓
  logs.received
       ↓
  ┌─────────────┐
  │ Sanitize    │ ← Removes ANSI codes, trims to 20KB
  │ Logs        │
  └─────────────┘
       ↓
  logs.sanitized
       ↓
  ┌─────────────┐
  │ Parse       │ ← Extracts ERROR, WARN, stack frames
  │ Logs        │
  └─────────────┘
       ↓
  logs.parsed
       ↓
  ┌─────────────┐
  │ LLM         │ ← GPT-4 incident analysis
  │ Analysis    │
  └─────────────┘
       ↓
  ┌──────┴──────┐
  ↓             ↓
logs.analyzed  logs.analysis_failed
  ↓             ↓
  │      ┌─────────────┐
  │      │ Fallback    │ ← Basic heuristic report
  │      │ Report      │
  │      └─────────────┘
  │             ↓
  │        report.ready
  │             ↓
  └──────┬──────┘
         ↓
  ┌─────────────┐
  │ Write       │ → INCIDENT_REPORT.md
  │ Report      │
  └─────────────┘
```

## 🚀 Getting Started

### 1. Install Dependencies

```bash
cd Day-6
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:
```
OPENAI_API_KEY=sk-your-actual-api-key
OUTPUT_PATH=./INCIDENT_REPORT.md
MOCK_LLM=false
```

**Note:** Set `MOCK_LLM=true` to skip OpenAI calls and use the fallback analyzer.

### 3. Start the Server

```bash
npm run dev
```

Server runs at `http://localhost:3000`

## 📡 API Endpoints

### POST /analyze-logs

Upload raw logs for analysis.

**Request:**
```bash
curl -X POST http://localhost:3000/analyze-logs \
  -H "Content-Type: application/json" \
  -d '{"logs": "2025-01-11 14:23:01 ERROR [UserService] Failed to fetch user profile\nError: Cannot read properties of undefined"}'
```

**Response:**
```json
{
  "success": true,
  "message": "Logs received successfully. Analysis in progress.",
  "logsReceived": 142
}
```

## 🧪 Test Logs

Use these sample logs for testing:

```
2025-01-11 14:23:01 ERROR [UserService] Failed to fetch user profile
Error: Cannot read properties of undefined (reading 'id')
    at getUser (/app/services/user.js:42:18)
    at processRequest (/app/core/handler.js:77:5)
RequestID=a8f9sd8f9asd
2025-01-11 14:23:01 WARN Retrying request…
2025-01-11 14:23:02 ERROR Retry failed. Aborting.
```

**Full test command:**
```bash
curl -X POST http://localhost:3000/analyze-logs \
  -H "Content-Type: application/json" \
  -d '{
    "logs": "2025-01-11 14:23:01 ERROR [UserService] Failed to fetch user profile\nError: Cannot read properties of undefined (reading '\''id'\'')\n    at getUser (/app/services/user.js:42:18)\n    at processRequest (/app/core/handler.js:77:5)\nRequestID=a8f9sd8f9asd\n2025-01-11 14:23:01 WARN Retrying request…\n2025-01-11 14:23:02 ERROR Retry failed. Aborting."
  }'
```

## 📁 Project Structure

```
Day-6/
├── steps/
│   └── log-analyzer/
│       ├── 01-upload-logs-api.step.ts    # API endpoint
│       ├── 02-sanitize-logs.step.ts      # ANSI removal, trimming
│       ├── 03-parse-logs.step.ts         # Regex extraction
│       ├── 04-analyze-with-llm.step.ts   # GPT-4 analysis
│       ├── 05-fallback-basic-report.step.ts # Fallback generator
│       └── 06-write-report.step.ts       # File writer
├── src/
│   ├── errors/
│   │   ├── base.error.ts
│   │   └── log-analyzer.errors.ts
│   ├── middlewares/
│   │   └── core.middleware.ts
│   └── services/
│       ├── logs/
│       │   ├── sanitizer.ts
│       │   └── parser.ts
│       ├── llm/
│       │   ├── prompts.ts
│       │   └── analyzer.ts
│       └── filesystem/
│           └── write-report.ts
├── .env.example
├── motia.config.ts
├── package.json
└── README.md
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key for GPT-4 | Required |
| `OUTPUT_PATH` | Path for incident report | `./INCIDENT_REPORT.md` |
| `MOCK_LLM` | Skip OpenAI, use fallback | `false` |

## 📋 Output

The workflow generates an `INCIDENT_REPORT.md` with:

- **Title** - Short incident description
- **Severity** - LOW / MEDIUM / HIGH / CRITICAL
- **Summary** - What happened
- **Root Cause** - Why it happened
- **Stack Frame** - Where it happened
- **Impact** - Users/system affected
- **Fix Plan** - Steps to resolve
- **Prevention Plan** - How to prevent recurrence
- **Log Statistics** - Error/warning counts

## 🔄 Workflow Events

| Event | Description |
|-------|-------------|
| `logs.received` | Raw logs uploaded |
| `logs.sanitized` | ANSI removed, size trimmed |
| `logs.parsed` | Errors/stack frames extracted |
| `logs.analyzed` | LLM analysis complete |
| `logs.analysis_failed` | LLM failed, trigger fallback |
| `report.ready` | Fallback report ready |

## 🛡️ Error Handling

- **LogSanitizationError** - Invalid log input
- **LogParseError** - Regex parsing failure
- **LLMAnalysisError** - OpenAI API failure
- **FileWriteError** - Cannot write report

---

**Part of #30Days30Automations Challenge - Day 6** 🚀
