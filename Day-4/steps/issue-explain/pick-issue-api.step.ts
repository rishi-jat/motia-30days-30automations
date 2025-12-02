import { ApiRouteConfig, Handlers } from 'motia'
import { z } from 'zod'
import { coreMiddleware } from '../../src/middlewares/core.middleware'

const bodySchema = z.object({
    issueNumber: z.number(),
})

export const config: ApiRouteConfig = {
    type: 'api',
    name: 'PickIssue',
    description: 'Select an issue to analyze and generate fix guide',
    flows: ['issue-explain'],
    method: 'POST',
    path: '/pick-issue',
    bodySchema,
    emits: ['issue.selected'],
    middleware: [coreMiddleware],
}

export const handler: Handlers['PickIssue'] = async (req, { logger, emit }) => {
    const { issueNumber } = req.body as z.infer<typeof bodySchema>

    const owner = process.env.GITHUB_OWNER
    const repo = process.env.GITHUB_REPO

    if (!owner || !repo) {
        throw new Error('Missing GITHUB_OWNER or GITHUB_REPO environment variables')
    }

    logger.info('Issue selected for analysis', { issueNumber, owner, repo })

    await emit({
        topic: 'issue.selected',
        data: {
            issueNumber,
            owner,
            repo,
            selectedAt: new Date().toISOString(),
        },
    })

    return {
        message: `Issue #${issueNumber} selected for analysis. Workflow started.`,
        issueNumber,
    }
}
