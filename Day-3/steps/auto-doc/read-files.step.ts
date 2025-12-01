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
    content: z.string().optional(), // Made optional/removed for optimization
    snippet: z.string(),
    lines: z.number(),
    size: z.number(),
})

const outputSchema = z.object({
    owner: z.string(),
    repo: z.string(),
    branch: z.string(),
    files: z.array(fileSchema),
    cached: z.boolean().optional(),
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

    // Check cache
    let isCached = false
    try {
        const cache = require('../../src/cache/auto-doc-cache.json')
        isCached = cache.initialized
    } catch (e) {
        // Cache file might not exist yet
    }

    if (isCached) {
        logger.info('Cache initialized, skipping file reading')
        await emit({
            topic: 'files-read',
            data: {
                owner,
                repo,
                branch,
                files: [],
                cached: true,
            },
        })
        return
    }

    logger.info('Reading file contents', { totalFiles: filePaths.length })

    const token = process.env.GITHUB_TOKEN
    if (!token) {
        throw new Error('GitHub token is required')
    }

    const files = []
    let filesWithSnippets = 0
    const MAX_SNIPPETS = 20

    for (const path of filePaths) {
        try {
            const fileContent = await fetchFileContent(owner, repo, path, token)

            // Optimize payload: Only keep snippets for the first few files
            const shouldKeepSnippet = filesWithSnippets < MAX_SNIPPETS
            if (shouldKeepSnippet) {
                filesWithSnippets++
            }

            files.push({
                path: fileContent.path,
                snippet: shouldKeepSnippet ? fileContent.snippet : '',
                lines: fileContent.lines,
                size: fileContent.size,
            })

            // Log every 50 files to avoid spam
            if (files.length % 50 === 0) {
                logger.info('Progress', { filesRead: files.length })
            }
        } catch (error) {
            logger.warn('Failed to read file, skipping', { path })
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
            cached: false,
        },
    })
}
