# Mock Fix Guide Generator (for testing without OpenAI)

import { IssueAnalysis, FixGuideInput } from './types'
import { RepoFile } from '../github/types'

export async function generateMockAnalysis(
    issueTitle: string,
    issueBody: string | null,
    files: RepoFile[]
): Promise<IssueAnalysis> {
    // Analyze issue content to generate realistic analysis
    const lowerTitle = issueTitle.toLowerCase()
    const lowerBody = (issueBody || '').toLowerCase()
    const combined = lowerTitle + ' ' + lowerBody
    
    // Smart file detection based on issue content
    let suggestedFiles: string[] = []
    let rootCause = ''
    let summary = ''
    let difficulty: 'Easy' | 'Medium' | 'Hard' = 'Medium'
    let beginnerFriendly = true
    let functions: string[] = []
    
    if (combined.includes('upload') || combined.includes('file')) {
        summary = 'This issue requests file upload functionality with both UI and server-side components. The implementation requires adding multipart form handling on the backend, file validation, storage integration, and a user-friendly file input component in the frontend.'
        rootCause = 'The application currently lacks file upload infrastructure. This includes missing middleware for handling multipart/form-data, no file storage service, absence of file type validation, and no UI components for file selection and upload progress tracking.'
        suggestedFiles = [
            'src/routes/api/upload.route.ts',
            'src/middleware/multer.config.ts',
            'src/services/file-storage.service.ts',
            'src/components/FileUpload.tsx',
            'src/validators/file.validator.ts'
        ]
        functions = [
            'handleFileUpload(req, res)',
            'validateFileType(file)',
            'saveToStorage(file, metadata)',
            'FileUploadComponent',
            'getUploadProgress()'
        ]
        difficulty = 'Medium'
        beginnerFriendly = true
    } else if (combined.includes('bug') || combined.includes('error') || combined.includes('crash') || combined.includes('fix')) {
        summary = 'Bug report requiring investigation of error handling, edge cases, and potential race conditions. The issue suggests an unhandled exception or logic error in the current implementation.'
        rootCause = 'Likely caused by insufficient input validation, missing null/undefined checks, or race conditions in async operations. The error handling middleware may not be catching all exceptions properly.'
        suggestedFiles = files.slice(0, 4).map(f => f.path)
        functions = ['errorHandler(error, req, res)', 'validateInput(data)', 'sanitizeData(input)', 'logError(error)']
        difficulty = 'Medium'
        beginnerFriendly = false
    } else if (combined.includes('performance') || combined.includes('slow') || combined.includes('optimize')) {
        summary = 'Performance optimization required. Initial analysis suggests inefficient database queries, missing indexes, or lack of caching layer. Response times can be significantly improved.'
        rootCause = 'Performance bottleneck caused by N+1 queries, missing database indexes, inefficient data fetching, or absence of caching strategy. Each request may be hitting the database unnecessarily.'
        suggestedFiles = files.filter(f => 
            f.path.includes('service') || 
            f.path.includes('controller') ||
            f.path.includes('repository') ||
            f.path.includes('model')
        ).slice(0, 5).map(f => f.path)
        functions = ['optimizeQuery()', 'addCaching(key, data)', 'createIndexes()', 'batchFetchData()']
        difficulty = 'Hard'
        beginnerFriendly = false
    } else if (combined.includes('feature') || combined.includes('add') || combined.includes('implement') || combined.includes('example')) {
        summary = `New feature request: ${issueTitle}. This requires adding new functionality to the existing codebase while maintaining backward compatibility and following established architectural patterns.`
        rootCause = 'Feature does not currently exist. Implementation requires creating new endpoints, services, and UI components following the existing project structure and coding standards.'
        
        // Smart file suggestions based on repo structure
        const hasSteps = files.some(f => f.path.includes('steps'))
        const hasServices = files.some(f => f.path.includes('services'))
        const hasComponents = files.some(f => f.path.includes('components'))
        
        if (hasSteps && hasServices) {
            suggestedFiles = [
                ...files.filter(f => f.path.includes('steps')).slice(0, 2).map(f => f.path),
                ...files.filter(f => f.path.includes('services')).slice(0, 2).map(f => f.path),
                'README.md'
            ]
        } else {
            suggestedFiles = files.slice(0, 5).map(f => f.path)
        }
        
        functions = ['createFeature()', 'addRoute(path, handler)', 'updateConfig()', 'renderComponent()']
        difficulty = 'Medium'
        beginnerFriendly = true
    } else if (combined.includes('test') || combined.includes('testing')) {
        summary = 'Testing infrastructure or test coverage improvement needed. Requires adding test cases, mocking dependencies, and ensuring proper test isolation.'
        rootCause = 'Insufficient test coverage or missing test infrastructure. The codebase needs additional unit tests, integration tests, or E2E tests to ensure reliability.'
        suggestedFiles = files.filter(f => f.path.includes('test') || f.path.includes('spec')).slice(0, 5).map(f => f.path)
        functions = ['setupTestEnvironment()', 'mockDependencies()', 'runTests()', 'assertExpectedBehavior()']
        difficulty = 'Easy'
        beginnerFriendly = true
    } else {
        summary = `Issue: "${issueTitle}". This requires investigation of the codebase, understanding the requirements, and implementing changes following project conventions.`
        rootCause = 'Detailed analysis needed. Review the issue description, existing code patterns, and project documentation to determine the best approach.'
        suggestedFiles = files.slice(0, 6).map(f => f.path)
        functions = ['analyzeRequirements()', 'reviewCode()', 'implementChanges()', 'addTests()']
        difficulty = 'Medium'
        beginnerFriendly = true
    }
    
    return {
        summary,
        rootCause,
        filesLikelyInvolved: suggestedFiles.length > 0 ? suggestedFiles : ['src/'],
        functionsToCheck: functions,
        difficulty,
        beginnerFriendly,
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
