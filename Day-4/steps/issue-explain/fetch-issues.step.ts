import { ApiRouteConfig, Handlers } from 'motia'
import { z } from 'zod'
import { fetchIssues } from '../../src/services/github'
import { coreMiddleware } from '../../src/middlewares/core.middleware'

export const config: ApiRouteConfig = {
    type: 'api',
    name: 'FetchIssues',
    description: 'Fetch all open issues from GitHub repository (standalone endpoint)',
    flows: ['issue-explain'],
    method: 'GET',
    path: '/issues',
    emits: [],
    middleware: [coreMiddleware],
}

export const handler: Handlers['FetchIssues'] = async (_req, { logger }) => {
    const owner = process.env.GITHUB_OWNER
    const repo = process.env.GITHUB_REPO
    const token = process.env.GITHUB_TOKEN

    if (!owner || !repo || !token) {
        throw new Error('Missing required environment variables: GITHUB_OWNER, GITHUB_REPO, GITHUB_TOKEN')
    }

    logger.info('Fetching open issues', { owner, repo })

    const issues = await fetchIssues(owner, repo, token)

    logger.info('Issues fetched successfully', { count: issues.length })

    return { issues }
}
