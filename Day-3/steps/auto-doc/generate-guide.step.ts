import { EventConfig, Handlers } from 'motia'
import { z } from 'zod'
import { generateDocumentation } from '../../src/services/llm'
import { coreMiddleware } from '../../src/middlewares/core.middleware'

const inputSchema = z.object({
    model: z.any(), // RepoModel type
})

const outputSchema = z.object({
    markdown: z.string(),
    generatedAt: z.string(),
})

export const config: EventConfig = {
    type: 'event',
    name: 'GenerateGuide',
    description: 'Generates documentation using LLM',
    subscribes: ['repo-model-built'],
    emits: ['guide-generated'],
    input: inputSchema,
    flows: ['auto-doc'],
}

export const handler: Handlers['GenerateGuide'] = async (input, { logger, emit }) => {
    const { model } = input

    logger.info('Generating documentation with LLM', {
        repo: model.repo,
        fileCount: model.files.length,
    })

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
        logger.error('OPENAI_API_KEY environment variable not set')
        throw new Error('OpenAI API key is required')
    }

    const markdown = await generateDocumentation(model, apiKey)

    logger.info('Documentation generated', {
        markdownLength: markdown.length,
        repo: model.repo,
    })

    await emit({
        topic: 'guide-generated',
        data: {
            markdown,
            generatedAt: new Date().toISOString(),
        },
    })
}
