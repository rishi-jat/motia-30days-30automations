// Mock Fix Guide Generator (for testing without OpenAI)

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
    const { issueNumber, issueTitle, issueBody, analysis, repoFiles } = input
    
    // Generate implementation steps based on the analysis
    const steps = generateImplementationSteps(analysis, issueTitle)
    const codeExamples = generateCodeExamples(analysis, issueTitle)
    const testingSteps = generateTestingGuidance(analysis)

    return `# 🔧 Fix Guide for Issue #${issueNumber}

> **${issueTitle}**

---

## 📋 Issue Overview

**Description:**
${issueBody || 'No detailed description provided. Refer to the issue title for context.'}

**Difficulty:** ${analysis.difficulty} ${analysis.beginnerFriendly ? '| ✅ **Beginner Friendly**' : '| ⚠️ **Requires Experience**'}

---

## 🔍 Technical Analysis

### Summary
${analysis.summary}

### Root Cause
${analysis.rootCause}

---

## 📂 Files to Modify

${analysis.filesLikelyInvolved.map((file, i) => `${i + 1}. \`${file}\`
   - ${getFileDescription(file)}`).join('\n\n')}

---

## 🎯 Key Functions/Components

${analysis.functionsToCheck.map((fn, i) => `${i + 1}. **\`${fn}\`**
   - ${getFunctionDescription(fn)}`).join('\n\n')}

---

## 🛠️ Implementation Guide

${steps}

---

## 💻 Code Examples

${codeExamples}

---

## ✅ Testing Strategy

${testingSteps}

---

## 🚀 Step-by-Step Workflow

### 1️⃣ **Setup**
\`\`\`bash
# Fork and clone the repository
git clone <repo-url>
cd <repo-directory>

# Create a feature branch
git checkout -b fix-issue-${issueNumber}

# Install dependencies
npm install
\`\`\`

### 2️⃣ **Implementation**
Follow the implementation guide above and modify the suggested files.

### 3️⃣ **Testing**
\`\`\`bash
# Run tests
npm test

# Test manually if needed
npm run dev
\`\`\`

### 4️⃣ **Commit & Push**
\`\`\`bash
git add .
git commit -m "fix: ${issueTitle} (#${issueNumber})"
git push origin fix-issue-${issueNumber}
\`\`\`

### 5️⃣ **Create Pull Request**
- Open a PR against the main branch
- Reference issue #${issueNumber}
- Add screenshots/demos if applicable
- Request review from maintainers

---

## 📚 Additional Resources

- Check existing similar implementations in the codebase
- Review project documentation and coding standards
- Test edge cases and error scenarios
- Consider backward compatibility

---

## ⚠️ Common Pitfalls

${getCommonPitfalls(analysis)}

---

## 💡 Tips for Success

- Write clean, readable code
- Add comprehensive error handling
- Include unit tests for new functionality
- Update documentation as needed
- Follow existing code patterns and conventions

---

**Generated:** ${new Date().toISOString()}
**Issue Reference:** [#${issueNumber}](../issues/${issueNumber})
**Estimated Time:** ${getEstimatedTime(analysis.difficulty)}

---

*This fix guide was generated using AI-powered analysis. For questions, refer to the project maintainers or community discussions.*
`
}

function getFileDescription(file: string): string {
    if (file.includes('route') || file.includes('api')) return 'API endpoint definition and routing logic'
    if (file.includes('service')) return 'Business logic and data processing'
    if (file.includes('middleware')) return 'Request/response processing middleware'
    if (file.includes('component') || file.includes('.tsx') || file.includes('.jsx')) return 'React component for UI rendering'
    if (file.includes('validator')) return 'Input validation and sanitization'
    if (file.includes('model') || file.includes('schema')) return 'Data model and schema definition'
    if (file.includes('config')) return 'Configuration and settings'
    if (file.includes('test') || file.includes('spec')) return 'Test cases and assertions'
    if (file.includes('README')) return 'Documentation and setup guide'
    return 'Core implementation file'
}

function getFunctionDescription(fn: string): string {
    if (fn.includes('handle') || fn.includes('Handler')) return 'Main request/event handler'
    if (fn.includes('validate') || fn.includes('Validate')) return 'Input validation logic'
    if (fn.includes('Component')) return 'React functional component'
    if (fn.includes('Service') || fn.includes('service')) return 'Service layer function'
    if (fn.includes('create') || fn.includes('Create')) return 'Creation/initialization logic'
    if (fn.includes('update') || fn.includes('Update')) return 'Update/modification logic'
    if (fn.includes('delete') || fn.includes('Delete')) return 'Deletion/cleanup logic'
    if (fn.includes('get') || fn.includes('fetch')) return 'Data fetching logic'
    return 'Core utility function'
}

function generateImplementationSteps(analysis: IssueAnalysis, title: string): string {
    const lower = title.toLowerCase()
    
    if (lower.includes('upload') || lower.includes('file')) {
        return `### Backend Implementation

1. **Install Dependencies**
   \`\`\`bash
   npm install multer @types/multer
   \`\`\`

2. **Create Multer Configuration**
   - Set up file size limits
   - Configure allowed file types
   - Define storage location

3. **Add Upload Route**
   - Create POST endpoint for file uploads
   - Add multer middleware
   - Handle file metadata

4. **Implement File Storage Service**
   - Save files to disk or cloud storage
   - Generate unique filenames
   - Store file metadata in database

### Frontend Implementation

1. **Create File Upload Component**
   - Add file input element
   - Show upload progress
   - Handle success/error states

2. **Add API Integration**
   - Call upload endpoint with FormData
   - Track upload progress
   - Display feedback to user`
    }
    
    if (lower.includes('bug') || lower.includes('error')) {
        return `### Debugging Steps

1. **Reproduce the Issue**
   - Follow the steps in the issue description
   - Identify the exact error message
   - Note when/how it occurs

2. **Locate the Bug**
   - Check the files listed above
   - Add logging to narrow down the source
   - Review recent changes that might have caused it

3. **Implement the Fix**
   - Add proper error handling
   - Validate inputs
   - Handle edge cases

4. **Verify the Fix**
   - Test the original scenario
   - Test edge cases
   - Ensure no regressions`
    }
    
    return `### Implementation Steps

1. **Analyze Requirements**
   - Review the issue description thoroughly
   - Identify all acceptance criteria
   - Plan the implementation approach

2. **Modify Core Logic**
   - Update the files listed above
   - Implement the required functionality
   - Follow existing code patterns

3. **Add Error Handling**
   - Handle edge cases
   - Add input validation
   - Provide meaningful error messages

4. **Update Documentation**
   - Add code comments
   - Update README if needed
   - Document new APIs/functions`
}

function generateCodeExamples(analysis: IssueAnalysis, title: string): string {
    const lower = title.toLowerCase()
    
    if (lower.includes('upload') || lower.includes('file')) {
        return `### Backend Example (Node.js/Express)

\`\`\`typescript
import multer from 'multer'
import path from 'path'

// Configure multer
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueName + path.extname(file.originalname))
    }
})

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|pdf/
        const valid = allowedTypes.test(file.mimetype)
        cb(null, valid)
    }
})

// Upload route
app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
        const file = req.file
        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' })
        }
        
        res.json({
            message: 'File uploaded successfully',
            filename: file.filename,
            path: file.path
        })
    } catch (error) {
        res.status(500).json({ error: 'Upload failed' })
    }
})
\`\`\`

### Frontend Example (React)

\`\`\`typescript
import { useState } from 'react'

function FileUpload() {
    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    
    const handleUpload = async () => {
        if (!file) return
        
        const formData = new FormData()
        formData.append('file', file)
        
        setUploading(true)
        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            })
            const data = await res.json()
            console.log('Upload success:', data)
        } catch (error) {
            console.error('Upload failed:', error)
        } finally {
            setUploading(false)
        }
    }
    
    return (
        <div>
            <input 
                type="file" 
                onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <button onClick={handleUpload} disabled={!file || uploading}>
                {uploading ? 'Uploading...' : 'Upload'}
            </button>
        </div>
    )
}
\`\`\``
    }
    
    return `### Example Implementation

\`\`\`typescript
// TODO: Add implementation based on the specific requirements
// Follow the patterns established in the codebase
// Add proper error handling and validation
\`\`\``
}

function generateTestingGuidance(analysis: IssueAnalysis): string {
    return `### Unit Tests
- Test each modified function independently
- Mock external dependencies
- Cover edge cases and error scenarios

### Integration Tests
- Test the complete workflow end-to-end
- Verify data persistence
- Check error handling

### Manual Testing
${analysis.difficulty === 'Easy' ? '- Quick smoke test should be sufficient' : '- Thorough testing of various scenarios'}
- Test with different input types
- Verify error messages
- Check performance if relevant`
}

function getCommonPitfalls(analysis: IssueAnalysis): string {
    const pitfalls = [
        '❌ Not validating user input properly',
        '❌ Missing error handling for edge cases',
        '❌ Forgetting to update tests',
        '❌ Not following existing code patterns'
    ]
    
    if (analysis.difficulty === 'Hard') {
        pitfalls.push('❌ Overlooking performance implications')
        pitfalls.push('❌ Not considering scalability')
    }
    
    return pitfalls.join('\n')
}

function getEstimatedTime(difficulty: string): string {
    switch (difficulty) {
        case 'Easy': return '1-2 hours'
        case 'Medium': return '3-5 hours'
        case 'Hard': return '1-2 days'
        default: return '3-5 hours'
    }
}
