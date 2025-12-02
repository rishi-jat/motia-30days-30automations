import { ApiRouteConfig, Handlers } from 'motia'
import { z } from 'zod'
import { coreMiddleware } from '../../src/middlewares/core.middleware'
import { fetchIssueDetails, scanRepo } from '../../src/services/github'
import { analyzeIssue, generateFixGuide } from '../../src/services/llm'
import { writeMarkdown } from '../../src/services/filesystem'
import * as path from 'path'

const bodySchema = z.object({
    issueNumber: z.number(),
})

export const config: ApiRouteConfig = {
    type: 'api',
    name: 'AnalyzeIssueAPI',
    description: 'Analyze a single issue and return the fix guide directly',
    flows: ['issue-explain'],
    method: 'POST',
    path: '/analyze-issue',
    bodySchema,
    emits: [],
    middleware: [coreMiddleware],
}

export const handler: Handlers['AnalyzeIssueAPI'] = async (req, { logger }) => {
    const { issueNumber } = req.body as z.infer<typeof bodySchema>

    const owner = process.env.GITHUB_OWNER
    const repo = process.env.GITHUB_REPO
    const token = process.env.GITHUB_TOKEN
    const apiKey = process.env.OPENAI_API_KEY
    const branch = process.env.GITHUB_BRANCH || 'main'

    if (!owner || !repo || !token || !apiKey) {
        throw new Error('Missing required environment variables')
    }

    logger.info('Analyzing issue', { issueNumber, owner, repo })

    // Step 1: Fetch issue details and scan repo in parallel
    const [issue, files] = await Promise.all([
        fetchIssueDetails(owner, repo, issueNumber, token),
        scanRepo(owner, repo, branch, token)
    ])

    logger.info('Issue and repo fetched', {
        issueNumber: issue.number,
        title: issue.title,
        filesScanned: files.length,
    })

    // Step 2: Analyze issue (never fails - returns fallback if OpenAI errors)
    const issueBody = typeof issue.body === 'string' ? issue.body : null
    const analysis = await analyzeIssue(issue.title, issueBody, files, apiKey)

    logger.info('Analysis complete', {
        issueNumber: issue.number,
        difficulty: analysis.difficulty,
    })

    // Step 3: Generate fix guide (never fails - returns fallback if OpenAI errors)
    const fixGuide = await generateFixGuide(
        {
            issueNumber: issue.number,
            issueTitle: issue.title,
            issueBody: issueBody || '',
            analysis,
            repoFiles: files,
        },
        apiKey
    )

    logger.info('Fix guide generated', {
        issueNumber: issue.number,
        guideLength: fixGuide.length,
    })

    // Step 4: Write the FIX.md file
    const outputDir = process.env.OUTPUT_DIR || './fix-guides'
    const fileName = `issue-${issue.number}-FIX.md`
    const filePath = path.resolve(outputDir, fileName)

    await writeMarkdown({
        path: filePath,
        content: fixGuide,
    })

    logger.info('Fix guide written to disk', {
        path: filePath,
    })

    // Return everything in the response
    return {
        status: 200,
        body: {
            message: `✅ Fix guide generated: ${fileName}`,
            fixGuideFile: filePath,
            issue: {
                number: issue.number,
                title: issue.title,
                body: issue.body,
                url: issue.html_url,
                state: issue.state,
            },
            analysis: {
                summary: analysis.summary,
                rootCause: analysis.rootCause,
                filesInvolved: analysis.filesLikelyInvolved,
                functionsToCheck: analysis.functionsToCheck,
                difficulty: analysis.difficulty,
                beginnerFriendly: analysis.beginnerFriendly,
            },
            preview: fixGuide.substring(0, 500) + '...',
            analyzedAt: new Date().toISOString(),
        },
    }
}
