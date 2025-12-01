import { EventConfig, Handlers } from 'motia'
import { z } from 'zod'
import { fetchFileContent } from '../../src/services/github'
import { coreMiddleware } from '../../src/middlewares/core.middleware'

const inputSchema = z.object({
    owner: z.string(),
    repo: z.string(),
    branch: z.string(),
    files: z.array(z.string()),
})

const fileSchema = z.object({
    path: z.string(),
    content: z.string(),
    snippet: z.string(),
    lines: z.number(),
    size: z.number(),
})

const outputSchema = z.object({
    owner: z.string(),
    repo: z.string(),
    branch: z.string(),
    files: z.array(fileSchema),
})

export const config: EventConfig = {
    type: 'event',
    name: 'ReadFiles',
    description: 'Reads content of all files',
    subscribes: ['file-list-fetched'],
    emits: ['files-read'],
    input: inputSchema,
    flows: ['auto-doc'],
}

export const handler: Handlers['ReadFiles'] = async (input, { logger, emit }) => {
    const { owner, repo, branch, files: filePaths } = input

    logger.info('Reading file contents', { totalFiles: filePaths.length })

    const token = process.env.GITHUB_TOKEN
    if (!token) {
        throw new Error('GitHub token is required')
    }

    const files = []
    for (const path of filePaths) {
        try {
            const fileContent = await fetchFileContent(owner, repo, path, token)
            files.push(fileContent)
            logger.info('File read successfully', { path, lines: fileContent.lines })
        } catch (error) {
            logger.warn('Failed to read file, skipping', {
                path,
                error: error instanceof Error ? error.message : String(error),
            })
        }
    }

    logger.info('All files read', { successfulReads: files.length })

    await emit({
        topic: 'files-read',
        data: {
            owner,
            repo,
            branch,
            files,
        },
    })
}
