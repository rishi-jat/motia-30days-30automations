import { EventConfig, Handlers } from 'motia'
import { z } from 'zod'
import { scanRepo } from '../../src/services/github'

const issueSchema = z.object({
    id: z.number(),
    number: z.number(),
    title: z.string(),
    body: z.string().nullable(),
    state: z.string(),
    html_url: z.string(),
})

const inputSchema = z.object({
    issue: issueSchema,
    owner: z.string(),
    repo: z.string(),
})

export const config: EventConfig = {
    type: 'event',
    name: 'ScanRepo',
    description: 'Scan repository files for analysis',
    subscribes: ['issue.details.fetched'],
    emits: ['repo.scanned'],
    flows: ['issue-explain'],
}

export const handler: Handlers['ScanRepo'] = async (input, { logger, emit }) => {
    const parsed = inputSchema.parse(input)
    const { issue, owner, repo } = parsed

    const token = process.env.GITHUB_TOKEN
    const branch = process.env.GITHUB_BRANCH || 'main'

    if (!token) {
        throw new Error('GITHUB_TOKEN environment variable not set')
    }

    logger.info('Scanning repository', { owner, repo, branch })

    const files = await scanRepo(owner, repo, branch, token)

    logger.info('Repository scan complete', { filesScanned: files.length })

    await emit({
        topic: 'repo.scanned',
        data: {
            issue: {
                id: issue.id,
                number: issue.number,
                title: issue.title,
                body: issue.body,
            },
            files,
            owner,
            repo,
        },
    })
}
