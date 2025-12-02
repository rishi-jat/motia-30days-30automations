import type { IssueAnalysis, FixGuideInput } from './types'

export function buildAnalysisPrompt(
    issueTitle: string,
    issueBody: string | null,
    files: Array<{ path: string; content: string }>
): string {
    const fileTree = files.map((f) => f.path).join('\n')
    const fileSnippets = files
        .slice(0, 10)
        .map((f) => `### ${f.path}\n\`\`\`\n${f.content.slice(0, 500)}\n\`\`\``)
        .join('\n\n')

    return `You are a code analysis expert. Analyze the following GitHub issue and provide structured insights.

**Issue Title:** ${issueTitle}

**Issue Description:**
${issueBody || 'No description provided'}

**Repository File Tree:**
\`\`\`
${fileTree}
\`\`\`

**File Snippets (first 10 files, truncated):**
${fileSnippets}

**Task:** Analyze this issue and provide a JSON response with the following structure:
{
  "summary": "Brief 1-2 sentence summary of the issue",
  "rootCause": "Detailed explanation of the likely root cause",
  "filesLikelyInvolved": ["list", "of", "file", "paths"],
  "functionsToCheck": ["list of function/method names to inspect"],
  "difficulty": "Easy" | "Medium" | "Hard",
  "beginnerFriendly": true | false
}

**Instructions:**
- Be specific about which files are likely involved
- Identify exact function/method names where possible
- Rate difficulty realistically
- Mark as beginner friendly only if it's truly suitable for newcomers
- Provide actionable insights

Return ONLY valid JSON, no markdown formatting.`
}

export function buildFixGuidePrompt(input: FixGuideInput): string {
    const { issueNumber, issueTitle, issueBody, analysis, repoFiles } = input

    const relevantFiles = repoFiles
        .filter((f) => analysis.filesLikelyInvolved.some((involved) => f.path.includes(involved)))
        .slice(0, 5)
        .map((f) => `### ${f.path}\n\`\`\`\n${f.content}\n\`\`\``)
        .join('\n\n')

    return `You are a senior developer writing a fix guide for a contributor.

**Issue #${issueNumber}: ${issueTitle}**

**Description:**
${issueBody || 'No description'}

**AI Analysis:**
- **Summary:** ${analysis.summary}
- **Root Cause:** ${analysis.rootCause}
- **Files Involved:** ${analysis.filesLikelyInvolved.join(', ')}
- **Functions to Check:** ${analysis.functionsToCheck.join(', ')}
- **Difficulty:** ${analysis.difficulty}
- **Beginner Friendly:** ${analysis.beginnerFriendly}

**Relevant Code Files:**
${relevantFiles || 'No relevant files identified'}

**Task:** Generate a comprehensive fix guide in Markdown format with the following sections:

# Fix Guide for Issue #${issueNumber}

## 📝 Summary
[Brief overview of what needs to be fixed]

## 🐛 Problem
[Detailed explanation of the problem]

## 🔍 Root Cause
[Technical explanation of why this is happening]

## 📂 Files to Check
[List files with brief descriptions of what to look for in each]

## 🔧 Functions to Inspect
[List specific functions/methods with context]

## ✅ How to Fix
[Step-by-step instructions on how to fix the issue]

## 💡 Suggested Patch (Optional)
[If applicable, provide a code snippet showing the fix]

## 📊 Difficulty
**${analysis.difficulty}**

## 👶 Beginner Friendly?
**${analysis.beginnerFriendly ? 'Yes' : 'No'}**

${analysis.beginnerFriendly ? '**Note:** This issue is suitable for first-time contributors!' : '**Note:** This issue may require experience with the codebase.'}

**Instructions:**
- Be thorough but concise
- Include code snippets where helpful
- Use clear, beginner-friendly language
- Provide context for technical decisions
- Make the guide actionable

Generate the complete guide now:`
}
