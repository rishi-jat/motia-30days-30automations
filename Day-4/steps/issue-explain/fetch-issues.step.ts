import { ApiRouteConfig, Handlers } from 'motia'
import { z } from 'zod'
import { fetchIssues } from '../../src/services/github'

export const config: ApiRouteConfig = {
    type: 'api',
    name: 'FetchIssues',
    description: 'Fetch all open issues from GitHub repository',
    flows: ['issue-explain'],
    method: 'GET',
    path: '/issues',
    emits: [],
    responseSchema: {
        200: z.object({
            issues: z.array(
                z.object({
                    id: z.number(),
                    number: z.number(),
                    title: z.string(),
                })
            ),
        }),
    },
}

export const handler: Handlers['FetchIssues'] = async (req, { logger }) => {
    const owner = process.env.GITHUB_OWNER
    const repo = process.env.GITHUB_REPO
    const token = process.env.GITHUB_TOKEN

    if (!owner || !repo || !token) {
        throw new Error('Missing required environment variables: GITHUB_OWNER, GITHUB_REPO, GITHUB_TOKEN')
    }

    logger.info('Fetching open issues', { owner, repo })

    const issues = await fetchIssues(owner, repo, token)

    logger.info('Issues fetched successfully', { count: issues.length })

    return {
        issues,
    }
}
