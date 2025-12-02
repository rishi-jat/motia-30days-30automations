import { EventConfig, Handlers } from 'motia'
import { z } from 'zod'
import { analyzeIssue } from '../../src/services/llm'

const issueSchema = z.object({
    id: z.number(),
    number: z.number(),
    title: z.string(),
    body: z.string().nullable(),
})

const fileSchema = z.object({
    path: z.string(),
    content: z.string(),
    lines: z.number(),
})

const inputSchema = z.object({
    issue: issueSchema,
    files: z.array(fileSchema),
    owner: z.string(),
    repo: z.string(),
})

export const config: EventConfig = {
    type: 'event',
    name: 'AnalyzeIssue',
    description: 'Analyze issue with AI to identify root cause and affected files',
    subscribes: ['repo.scanned'],
    emits: ['issue.analyzed'],
    input: inputSchema,
    flows: ['issue-explain'],
}

export const handler: Handlers['AnalyzeIssue'] = async (input, { logger, emit }) => {
    const { issue, files, owner, repo } = input

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
        throw new Error('OPENAI_API_KEY environment variable not set')
    }

    logger.info('Analyzing issue with AI', {
        issueNumber: issue.number,
        fileCount: files.length,
    })

    const analysis = await analyzeIssue(issue.title, issue.body, files, apiKey)

    logger.info('Issue analysis complete', {
        issueNumber: issue.number,
        difficulty: analysis.difficulty,
        beginnerFriendly: analysis.beginnerFriendly,
        filesInvolved: analysis.filesLikelyInvolved.length,
    })

    await emit({
        topic: 'issue.analyzed',
        data: {
            issue: {
                id: issue.id,
                number: issue.number,
                title: issue.title,
                body: issue.body,
            },
            analysis: {
                summary: analysis.summary,
                rootCause: analysis.rootCause,
                filesLikelyInvolved: analysis.filesLikelyInvolved,
                functionsToCheck: analysis.functionsToCheck,
                difficulty: analysis.difficulty,
                beginnerFriendly: analysis.beginnerFriendly,
            },
            files,
            owner,
            repo,
        },
    })
}
