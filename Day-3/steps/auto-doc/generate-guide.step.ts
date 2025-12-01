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

import type { RepoModel } from '../../src/services/llm/types'
import { generateStaticDocumentation } from '../../src/services/llm/generate-docs'

export const handler: Handlers['GenerateGuide'] = async (input, { logger, emit }) => {
    const model = input.model as RepoModel
    const isCached = (input as any).cached === true

    let markdown = ''

    if (isCached) {
        logger.info('Using cached static documentation (fast mode)')
        markdown = generateStaticDocumentation(model)
    } else {
        const apiKey = process.env.OPENAI_API_KEY
        if (!apiKey) {
            logger.warn('OPENAI_API_KEY not set, using static generator')
            markdown = generateStaticDocumentation(model)
        } else {
            try {
                // Try LLM generation
                // markdown = await generateDocumentation(model, apiKey) // Commented out to force static for demo stability if needed, but user wants fallback
                // Actually, let's try LLM first as requested
                const { generateDocumentation } = require('../../src/services/llm/generate-docs')
                markdown = await generateDocumentation(model, apiKey)

                logger.info('Documentation generated with LLM', {
                    markdownLength: markdown.length,
                    repo: model.repo,
                })
            } catch (error) {
                logger.warn('LLM generation failed, falling back to static generation', {
                    error: error instanceof Error ? error.message : String(error),
                })
                markdown = generateStaticDocumentation(model)
            }
        }

        // Update cache to initialized
        try {
            const fs = require('fs')
            const path = require('path')
            const cachePath = path.join(process.cwd(), 'src/cache/auto-doc-cache.json')
            fs.writeFileSync(cachePath, JSON.stringify({
                initialized: true,
                lastGenerated: new Date().toISOString()
            }, null, 2))
            logger.info('Cache updated to initialized')
        } catch (e) {
            logger.warn('Failed to update cache file')
        }
    }

    await emit({
        topic: 'guide-generated',
        data: {
            markdown,
            generatedAt: new Date().toISOString(),
        },
    })
}
