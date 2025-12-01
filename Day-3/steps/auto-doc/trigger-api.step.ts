import { ApiRouteConfig, Handlers } from 'motia'
import { z } from 'zod'

export const config: ApiRouteConfig = {
    type: 'api',
    name: 'TriggerAutoDoc',
    description: 'Manually trigger the auto-doc workflow via API',
    flows: ['auto-doc'],
    method: 'POST',
    path: '/trigger-auto-doc',
    bodySchema: z.object({
        owner: z.string().optional(),
        repo: z.string().optional(),
        branch: z.string().optional(),
    }),
    responseSchema: {
        200: z.object({
            message: z.string(),
            owner: z.string(),
            repo: z.string(),
            branch: z.string(),
        }),
    },
    emits: ['auto-doc-triggered'],
}

export const handler: Handlers['TriggerAutoDoc'] = async (req, { logger, emit }) => {
    logger.info('Auto-doc manually triggered via API')

    await emit({
        topic: 'auto-doc-triggered',
        data: {
            owner: process.env.GITHUB_OWNER || 'MotiaDev',
            repo: process.env.GITHUB_REPO || 'motia',
            branch: process.env.GITHUB_BRANCH || 'main',
            triggeredAt: new Date().toISOString(),
        },
    })

    return {
        message: 'Auto-doc workflow triggered successfully!',
        owner: process.env.GITHUB_OWNER || 'MotiaDev',
        repo: process.env.GITHUB_REPO || 'motia',
        branch: process.env.GITHUB_BRANCH || 'main',
    }
}
