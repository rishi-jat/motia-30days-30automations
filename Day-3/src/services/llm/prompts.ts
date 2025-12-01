import type { RepoModel } from './types'

export function buildDocumentationPrompt(repoModel: RepoModel): string {
    return `You are generating a comprehensive contributor guide for the "${repoModel.repo}" GitHub repository.

Your output must allow a complete beginner to understand the entire project deeply.

Use simple, clear, human-friendly language. Write as if you're explaining this to a new teammate.

You MUST include ALL of the following sections in your markdown output:

# Project Overview
- What this project does
- Why it exists  
- Who should use it

# Architecture Overview
- High-level system design
- How components interact
- Key technologies used

# Folder Structure
Explain each major directory:
${repoModel.structure
            .filter((item) => item.type === 'dir' && !item.path.includes('/'))
            .map((dir) => `- ${dir.path}/`)
            .join('\n')}

# File-by-File Summary
Provide concise summaries for key files.

# Mermaid Architecture Diagram
Create a flowchart showing how the system works. Use this format:
\`\`\`mermaid
flowchart TD
  A[Component A] --> B[Component B]
\`\`\`

# Execution Flow
Explain how the application runs from entry point to completion.

# Setup Instructions
- How to clone
- How to install dependencies
- How to run locally
- How to test

# Contribution Guide
- How to contribute
- Code style
- PR process
- Where to start

# Starter Issues
Based on the codebase, suggest 3-5 beginner-friendly tasks.

# Glossary
Explain any project-specific terms or acronyms.

# Understanding the Codebase
- Where is the main logic?
- Where are configs?
- Where are tests?
- Common patterns used

# Important Patterns
Identify and explain key patterns (e.g., event-driven, middleware, DDD, etc.)

---

Repository Information:
- Owner: ${repoModel.owner}
- Repo: ${repoModel.repo}
- Branch: ${repoModel.branch}
- Total Files: ${repoModel.files.length}
- Modules: ${repoModel.modules.join(', ') || 'None detected'}
- Workflows: ${repoModel.workflows.length} files
- Tests: ${repoModel.tests.length} files
- Configs: ${repoModel.configs.length} files

Key Files Sample:
${repoModel.files
            .slice(0, 10)
            .map((f) => `- ${f.path} (${f.lines} lines)`)
            .join('\n')}

File Snippets (for context):
${repoModel.files
            .slice(0, 5)
            .map(
                (f) => `
### ${f.path}
\`\`\`
${f.snippet}
\`\`\`
`
            )
            .join('\n')}

Generate the complete contributor guide now as valid Markdown.`
}
