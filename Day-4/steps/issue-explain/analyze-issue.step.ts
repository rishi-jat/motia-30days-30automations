import { EventConfig, Handlers } from 'motia'
import { z } from 'zod'
import { analyzeIssue, generateFixGuide } from '../../src/services/llm'

const inputSchema = z.object({
    issue: z.object({
        id: z.number(),
        number: z.number(),
        title: z.string(),
        body: z.string().nullable(),
        state: z.string().optional(),
        html_url: z.string().optional(),
    }),
    files: z.array(z.object({
        path: z.string(),
        content: z.string(),
        lines: z.number(),
    })),
    owner: z.string(),
    repo: z.string(),
})

export const config: EventConfig = {
    type: 'event',
    name: 'AnalyzeIssue',
    description: 'Analyze issue with AI and generate comprehensive fix guide',
    subscribes: ['issue.ready'],
    emits: ['fix-guide.generated'],
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

    const issueBody = typeof issue.body === 'string' ? issue.body : null
    
    // Analyze issue
    const analysis = await analyzeIssue(issue.title, issueBody, files, apiKey)

    logger.info('Analysis complete, generating fix guide', {
        issueNumber: issue.number,
        difficulty: analysis.difficulty,
        beginnerFriendly: analysis.beginnerFriendly,
    })

    // Generate fix guide
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

    await emit({
        topic: 'fix-guide.generated',
        data: {
            issueNumber: issue.number,
            markdown: fixGuide,
            generatedAt: new Date().toISOString(),
        },
    })
}
