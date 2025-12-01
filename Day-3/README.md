# Day 3: Auto-Documentation Generator 🤖

For Day 3, I wanted to solve a problem I've had forever: **documenting repos for contributors**.

Reading through an unfamiliar codebase to understand it is exhausting. What if I could generate a comprehensive guide automatically?

## What I Built

An AI-powered workflow that:
1.  **Scans** an entire GitHub repository (tree + files)
2.  **Reads** all relevant source files
3.  **Builds** a structured model of the repo
4.  **Generates** a comprehensive `CONTRIBUTOR_GUIDE.md` using AI
5.  **Runs automatically** every day via a cron job

The result? New contributors get a **complete walkthrough** of the codebase without reading thousands of lines manually.

## How It Works

I designed a **7-step event-driven pipeline**:

1.  **`CronTrigger`**: Runs daily at 9 AM. Emits `auto-doc-triggered`.
2.  **`FetchRepoTree`**: Calls GitHub API to get the full repository tree.
3.  **`FetchFileList`**: Filters the tree to only relevant files (`.ts`, `.js`, `.md`, etc.).
4.  **`ReadFiles`**: Fetches content for each file from GitHub.
5.  **`BuildRepoModel`**: Combines everything into a structured JSON model (modules, tests, configs, etc.).
6.  **`GenerateGuide`**: Sends the model to OpenAI GPT-4 with a detailed prompt.
7.  **`WriteGuide`**: Saves the AI-generated markdown to `CONTRIBUTOR_GUIDE.md`.

## The Generated Guide Includes:

- **Project Overview**: What it does and why it exists
- **Architecture**: How components connect
- **Folder Structure**: Explanation of every directory
- **File Summaries**: What each key file does
- **Mermaid Diagrams**: Visual flow of the system
- **Setup Instructions**: How to run locally
- **Contribution Guide**: How to add features
- **Starter Issues**: Beginner-friendly tasks
- **Glossary**: Project-specific terms
- **Code Patterns**: Event-driven, DDD, etc.

## How to Run It

1.  **Install**:
    ```bash
    npm install
    ```

2.  **Set up environment**:
    Create a `.env` file:
    ```bash
    GITHUB_TOKEN=ghp_...
    GITHUB_OWNER=your-username
    GITHUB_REPO=your-repo
    OPENAI_API_KEY=sk-...
    OUTPUT_PATH=./CONTRIBUTOR_GUIDE.md
    ```

3.  **Run the workflow**:
    ```bash
    npm run dev
    ```

The cron will trigger daily at 9 AM, or you can manually trigger it from the Motia Workbench.

## Example Output

The generated `CONTRIBUTOR_GUIDE.md` will be **very comprehensive** (potentially 1000+ lines). It's designed to replace hours of manual exploration with a single document.

## What I Learned

- **GitHub API**: I learned how to use the `git/trees` endpoint with `?recursive=1` to get everything in one shot.
- **LLM Prompting**: Crafting a prompt that produces structured, consistent markdown is hard. I spent time iterating on the template.
- **Event-Driven Pipelines**: Breaking this into 7 small steps (instead of one giant cron job) makes it so much easier to debug and extend.

Onto Day 4! 👋
