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
    flows: ['issue-explain'],
}

export const handler: Handlers['WriteFixGuide'] = async (input, { logger }) => {
    const parsed = inputSchema.parse(input)
    const { issueNumber, markdown, generatedAt } = parsed

    const outputDir = process.env.OUTPUT_DIR || './fix-guides'
    const fileName = `issue-${issueNumber}-fix-guide.md`
    const resolvedPath = path.resolve(outputDir, fileName)

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
