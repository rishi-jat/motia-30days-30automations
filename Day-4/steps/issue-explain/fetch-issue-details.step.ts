import { EventConfig, Handlers } from 'motia'
import { z } from 'zod'
import { fetchIssueDetails, scanRepo } from '../../src/services/github'

const inputSchema = z.object({
    issueNumber: z.number(),
    owner: z.string(),
    repo: z.string(),
    selectedAt: z.string(),
})

export const config: EventConfig = {
    type: 'event',
    name: 'FetchIssueDetails',
    description: 'Fetch full details of selected issue and scan repository',
    subscribes: ['issue.selected'],
    emits: ['issue.ready'],
    input: inputSchema,
    flows: ['issue-explain'],
}

export const handler: Handlers['FetchIssueDetails'] = async (input, { logger, emit }) => {
    const { issueNumber, owner, repo } = input

    const token = process.env.GITHUB_TOKEN
    const branch = process.env.GITHUB_BRANCH || 'main'

    if (!token) {
        throw new Error('GITHUB_TOKEN environment variable not set')
    }

    logger.info('Fetching issue details and scanning repository', { issueNumber, owner, repo })

    // Fetch issue details and scan repo in parallel
    const [issue, files] = await Promise.all([
        fetchIssueDetails(owner, repo, issueNumber, token),
        scanRepo(owner, repo, branch, token)
    ])

    logger.info('Issue and repository ready', {
        issueNumber: issue.number,
        title: issue.title,
        filesScanned: files.length,
    })

    await emit({
        topic: 'issue.ready',
        data: {
            issue: {
                id: issue.id,
                number: issue.number,
                title: issue.title,
                body: issue.body,
                state: issue.state,
                html_url: issue.html_url,
            },
            files,
            owner,
            repo,
        },
    })
}
