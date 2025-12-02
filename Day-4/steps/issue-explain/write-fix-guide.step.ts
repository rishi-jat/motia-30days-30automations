import { EventConfig, Handlers } from 'motia'
import { z } from 'zod'
import { writeMarkdown } from '../../src/services/filesystem'
import * as path from 'path'

const inputSchema = z.object({
    issueNumber: z.number(),
    markdown: z.string(),
    generatedAt: z.string(),
})

export const config: EventConfig = {
    type: 'event',
    name: 'WriteFixGuide',
    description: 'Write generated fix guide to disk',
    subscribes: ['fix-guide.generated'],
    emits: [],
    input: inputSchema,
    flows: ['issue-explain'],
}

export const handler: Handlers['WriteFixGuide'] = async (input, { logger }) => {
    const { issueNumber, markdown, generatedAt } = input as unknown as z.infer<typeof inputSchema>

    const outputPath = process.env.OUTPUT_PATH || './FIX_GUIDE.md'
    const resolvedPath = path.resolve(outputPath)

    logger.info('Writing fix guide to disk', {
        issueNumber,
        path: resolvedPath,
    })

    await writeMarkdown({
        path: resolvedPath,
        content: markdown,
    })

    logger.info('Fix guide written successfully', {
        issueNumber,
        path: resolvedPath,
        generatedAt,
    })
}
