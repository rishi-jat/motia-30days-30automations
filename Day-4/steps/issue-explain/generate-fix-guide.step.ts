import { EventConfig, Handlers } from 'motia'
import { z } from 'zod'
import { generateFixGuide } from '../../src/services/llm'

const issueSchema = z.object({
    id: z.number(),
    number: z.number(),
    title: z.string(),
    body: z.string().nullable(),
})

const analysisSchema = z.object({
    summary: z.string(),
    rootCause: z.string(),
    filesLikelyInvolved: z.array(z.string()),
    functionsToCheck: z.array(z.string()),
    difficulty: z.enum(['Easy', 'Medium', 'Hard']),
    beginnerFriendly: z.boolean(),
})

const fileSchema = z.object({
    path: z.string(),
    content: z.string(),
    lines: z.number(),
})

const inputSchema = z.object({
    issue: issueSchema,
    analysis: analysisSchema,
    files: z.array(fileSchema),
    owner: z.string(),
    repo: z.string(),
})

export const config: EventConfig = {
    type: 'event',
    name: 'GenerateFixGuide',
    description: 'Generate comprehensive fix guide with AI',
    subscribes: ['issue.analyzed'],
    emits: ['fix-guide.generated'],
    input: inputSchema,
    flows: ['issue-explain'],
}

export const handler: Handlers['GenerateFixGuide'] = async (input, { logger, emit }) => {
    const { issue, analysis, files, owner, repo } = input

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
        throw new Error('OPENAI_API_KEY environment variable not set')
    }

    logger.info('Generating fix guide with AI', {
        issueNumber: issue.number,
        difficulty: analysis.difficulty,
    })

    const fixGuide = await generateFixGuide(
        {
            issueNumber: issue.number,
            issueTitle: issue.title,
            issueBody: issue.body || '',
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
