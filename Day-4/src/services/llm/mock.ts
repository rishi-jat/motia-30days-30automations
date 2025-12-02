# Mock Fix Guide Generator (for testing without OpenAI)

import { IssueAnalysis, FixGuideInput } from './types'

export async function generateMockAnalysis(
    issueTitle: string,
    issueBody: string | null
): Promise<IssueAnalysis> {
    // Return a mock analysis instantly
    return {
        summary: `This issue is about: ${issueTitle}`,
        rootCause: `The root cause needs investigation. Based on the title "${issueTitle}", this appears to be a feature request or bug that requires code changes.`,
        filesLikelyInvolved: [
            'src/main.ts',
            'src/services/issue-handler.ts',
            'README.md'
        ],
        functionsToCheck: [
            'handleIssue()',
            'processRequest()',
            'validateInput()'
        ],
        difficulty: 'Medium' as const,
        beginnerFriendly: true,
    }
}

export async function generateMockFixGuide(input: FixGuideInput): Promise<string> {
    const { issueNumber, issueTitle, issueBody, analysis } = input

    return `# Fix Guide for Issue #${issueNumber}

## 📋 Issue Summary
**Title:** ${issueTitle}

**Description:**
${issueBody || 'No description provided'}

---

## 🔍 Analysis

### Summary
${analysis.summary}

### Root Cause
${analysis.rootCause}

### Difficulty Level
**${analysis.difficulty}** ${analysis.beginnerFriendly ? '✅ Beginner Friendly' : '⚠️ Advanced'}

---

## 📂 Files to Modify

${analysis.filesLikelyInvolved.map((file, i) => `${i + 1}. \`${file}\``).join('\n')}

---

## 🔧 Functions to Check

${analysis.functionsToCheck.map((fn, i) => `${i + 1}. \`${fn}\``).join('\n')}

---

## 🛠️ How to Fix

### Step 1: Understand the Problem
Read through the issue description carefully and understand what the user is requesting.

### Step 2: Locate the Code
Navigate to the files listed above and find the relevant functions.

### Step 3: Implement the Fix
Make the necessary code changes based on the requirements.

### Step 4: Test Your Changes
Run the application and verify the fix works as expected.

### Step 5: Submit a Pull Request
Once tested, create a PR with a clear description of your changes.

---

## 💡 Suggested Approach

1. Fork the repository
2. Create a new branch: \`git checkout -b fix-issue-${issueNumber}\`
3. Make your changes
4. Test thoroughly
5. Commit: \`git commit -m "Fix: ${issueTitle}"\`
6. Push and create PR

---

## 📝 Notes
- This is a mock fix guide generated for testing
- For real AI-powered analysis, ensure your OpenAI API key is valid
- Check the official documentation for more details

---

**Generated:** ${new Date().toISOString()}
**Issue:** #${issueNumber}
`
}
