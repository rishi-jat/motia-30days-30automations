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
    const owner = req.body.owner || process.env.GITHUB_OWNER || 'motiaDev'
    const repo = req.body.repo || process.env.GITHUB_REPO || 'motia'
    const branch = req.body.branch || process.env.GITHUB_BRANCH || 'main'

    logger.info('Auto-doc manually triggered via API', { owner, repo, branch })

    await emit({
        topic: 'auto-doc-triggered',
        data: {
            owner,
            repo,
            branch,
            triggeredAt: new Date().toISOString(),
        },
    })

    return {
        message: 'Auto-doc workflow triggered successfully!',
        owner,
        repo,
        branch,
    }
}
