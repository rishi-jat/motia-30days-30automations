import { EventConfig, Handlers } from 'motia'
import { z } from 'zod'
import { fetchRepositoryTree } from '../../src/services/github'

const inputSchema = z.object({
    owner: z.string(),
    repo: z.string(),
    branch: z.string(),
    triggeredAt: z.string(),
})

export const config: EventConfig = {
    type: 'event',
    name: 'FetchRepoTree',
    description: 'Fetches repository tree from GitHub',
    subscribes: ['auto-doc-triggered'],
    emits: ['repo-tree-fetched'],
    input: inputSchema,
    flows: ['auto-doc'],
}

export const handler: Handlers['FetchRepoTree'] = async (input, { logger, emit }) => {
    const { owner, repo, branch } = input

    logger.info('Fetching repository tree', { owner, repo, branch })

    const token = process.env.GITHUB_TOKEN
    if (!token) {
        logger.error('GITHUB_TOKEN environment variable not set')
        throw new Error('GitHub token is required')
    }

    const tree = await fetchRepositoryTree(owner, repo, token, branch)

    logger.info('Repository tree fetched', {
        totalItems: tree.length,
        files: tree.filter((item) => item.type === 'file').length,
        dirs: tree.filter((item) => item.type === 'dir').length,
    })

    await emit({
        topic: 'repo-tree-fetched',
        data: {
            owner,
            repo,
            branch,
            tree,
        },
    })
}
