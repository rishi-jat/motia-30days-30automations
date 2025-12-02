import { ApiRouteConfig, Handlers } from 'motia'
import { z } from 'zod'

export const config: ApiRouteConfig = {
    type: 'api',
    name: 'PickIssue',
    description: 'Select an issue to analyze and generate fix guide',
    flows: ['issue-explain'],
    method: 'POST',
    path: '/pick-issue',
    bodySchema: z.object({
        issueNumber: z.number(),
    }),
    responseSchema: {
        200: z.object({
            message: z.string(),
            issueNumber: z.number(),
        }),
    },
    emits: ['issue.selected'],
}

export const handler: Handlers['PickIssue'] = async (req, { logger, emit }) => {
    const { issueNumber } = req.body as { issueNumber: number }

    const owner = process.env.GITHUB_OWNER || ''
    const repo = process.env.GITHUB_REPO || ''

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
