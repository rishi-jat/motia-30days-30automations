import { EventConfig, Handlers } from 'motia'
import { z } from 'zod'
import { writeMarkdownFile } from '../../src/services/filesystem'
import { coreMiddleware } from '../../src/middlewares/core.middleware'

const inputSchema = z.object({
    markdown: z.string(),
    generatedAt: z.string(),
})

export const config: EventConfig = {
    type: 'event',
    name: 'WriteGuide',
    description: 'Writes CONTRIBUTOR_GUIDE.md to filesystem',
    subscribes: ['guide-generated'],
    emits: [],
    input: inputSchema,
    flows: ['auto-doc'],
}

export const handler: Handlers['WriteGuide'] = async (input, { logger }) => {
    const { markdown, generatedAt } = input

    logger.info('Writing CONTRIBUTOR_GUIDE.md', {
        markdownLength: markdown.length,
        generatedAt,
    })

    const outputPath = process.env.OUTPUT_PATH || './CONTRIBUTOR_GUIDE.md'

    await writeMarkdownFile(outputPath, markdown)

    logger.info('CONTRIBUTOR_GUIDE.md written successfully', {
        path: outputPath,
        size: markdown.length,
    })
}
