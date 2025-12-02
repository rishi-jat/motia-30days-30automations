import { ApiRouteConfig, Handlers } from 'motia'
import { z } from 'zod'

const bodySchema = z.object({
    issueNumber: z.number(),
})

const responseSchema = z.object({
    message: z.string(),
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
    responseSchema: {
        200: responseSchema,
    },
    emits: ['issue.selected'],
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
        status: 200 as const,
        body: {
            message: `Issue #${issueNumber} selected for analysis. Workflow started.`,
            issueNumber,
        },
    }
}
