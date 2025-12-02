import { EventConfig, Handlers } from 'motia'
import { z } from 'zod'
import { fetchIssueDetails } from '../../src/services/github'

const inputSchema = z.object({
    issueNumber: z.number(),
    owner: z.string(),
    repo: z.string(),
})

export const config: EventConfig = {
    type: 'event',
    name: 'FetchIssueDetails',
    description: 'Fetch full details of selected issue',
    subscribes: ['issue.selected'],
    emits: ['issue.details.fetched'],
    input: inputSchema,
    flows: ['issue-explain'],
}

export const handler: Handlers['FetchIssueDetails'] = async (input, { logger, emit }) => {
    const { issueNumber, owner, repo } = input

    const token = process.env.GITHUB_TOKEN
    if (!token) {
        throw new Error('GITHUB_TOKEN environment variable not set')
    }

    logger.info('Fetching issue details', { issueNumber, owner, repo })

    const issue = await fetchIssueDetails(owner, repo, issueNumber, token)

    logger.info('Issue details fetched', {
        issueNumber: issue.number,
        title: issue.title,
    })

    await emit({
        topic: 'issue.details.fetched',
        data: {
            issue: {
                id: issue.id,
                number: issue.number,
                title: issue.title,
                body: issue.body,
                state: issue.state,
                html_url: issue.html_url,
            },
            owner,
            repo,
        },
    })
}
