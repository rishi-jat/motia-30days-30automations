import { EventConfig, Handlers } from 'motia'
import { z } from 'zod'
import { coreMiddleware } from '../../src/middlewares/core.middleware'

const inputSchema = z.object({
    owner: z.string(),
    repo: z.string(),
    branch: z.string(),
    tree: z.array(
        z.object({
            path: z.string(),
            type: z.enum(['file', 'dir']),
        })
    ),
})

const outputSchema = z.object({
    owner: z.string(),
    repo: z.string(),
    branch: z.string(),
    files: z.array(z.string()),
})

export const config: EventConfig = {
    type: 'event',
    name: 'FetchFileList',
    description: 'Filters tree to get list of relevant files',
    subscribes: ['repo-tree-fetched'],
    emits: ['file-list-fetched'],
    input: inputSchema,
    flows: ['auto-doc'],
}

export const handler: Handlers['FetchFileList'] = async (input, { logger, emit }) => {
    const { owner, repo, branch, tree } = input

    logger.info('Filtering file list', { totalItems: tree.length })

    // Only include relevant file types
    const relevantExtensions = ['.ts', '.js', '.json', '.md', '.yml', '.yaml', '.txt', '.sh']
    const excludePaths = ['node_modules', '.git', 'dist', 'build', '.next', 'coverage']

    const files = tree
        .filter((item) => item.type === 'file')
        .filter((item) => {
            // Check if path contains excluded directories
            const hasExcludedPath = excludePaths.some((excluded) =>
                item.path.includes(`/${excluded}/`)
            )
            if (hasExcludedPath) return false

            // Check if file has relevant extension
            return relevantExtensions.some((ext) => item.path.endsWith(ext))
        })
        .map((item) => item.path)

    logger.info('File list filtered', {
        totalFiles: files.length,
        sampleFiles: files.slice(0, 5),
    })

    await emit({
        topic: 'file-list-fetched',
        data: {
            owner,
            repo,
            branch,
            files,
        },
    })
}
