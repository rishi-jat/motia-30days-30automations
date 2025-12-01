import { EventConfig, Handlers } from 'motia'
import { z } from 'zod'
import type { RepoModel } from '../../src/services/llm/types'
import { coreMiddleware } from '../../src/middlewares/core.middleware'

const fileSchema = z.object({
    path: z.string(),
    content: z.string().optional(),
    snippet: z.string(),
    lines: z.number(),
    size: z.number(),
})

const inputSchema = z.object({
    owner: z.string(),
    repo: z.string(),
    branch: z.string(),
    files: z.array(fileSchema),
    cached: z.boolean().optional(),
})

const outputSchema = z.object({
    model: z.any(), // RepoModel type
})

export const config: EventConfig = {
    type: 'event',
    name: 'BuildRepoModel',
    description: 'Builds comprehensive repository model',
    subscribes: ['files-read'],
    emits: ['repo-model-built'],
    input: inputSchema,
    flows: ['auto-doc'],
}

export const handler: Handlers['BuildRepoModel'] = async (input, { logger, emit }) => {
    const { owner, repo, branch, files } = input
    const isCached = (input as any).cached === true

    let model: RepoModel

    if (isCached) {
        logger.info('Loading repository model from cache')
        try {
            model = require('../../src/cache/repo-model.json')
        } catch (e) {
            logger.warn('Failed to load cached model, rebuilding...')
            // Fallback to rebuilding if cache missing (though files might be empty if ReadFiles skipped)
            // In reality, if ReadFiles skipped, files is empty, so we can't rebuild.
            // We assume cache exists if ReadFiles said so.
            throw new Error('Cached model missing')
        }
    } else {
        logger.info('Building repository model', { fileCount: files.length })

        // Build structure from file paths
        const structure = files.map((file) => ({
            path: file.path,
            type: 'file' as const,
        }))

        // Infer modules from directory structure
        const modules = Array.from(
            new Set(
                files
                    .map((f) => f.path.split('/')[0])
                    .filter((dir) => dir && dir !== '.' && !dir.startsWith('.'))
            )
        )

        // Find workflows
        const workflows = files.filter(
            (f) => f.path.includes('/.github/workflows/') || f.path.includes('/workflows/')
        )

        // Find tests
        const tests = files.filter(
            (f) =>
                f.path.includes('/test/') ||
                f.path.includes('/tests/') ||
                f.path.includes('/__tests__/') ||
                f.path.includes('.test.') ||
                f.path.includes('.spec.')
        )

        // Find configs
        const configs = files.filter(
            (f) =>
                f.path === 'package.json' ||
                f.path === 'tsconfig.json' ||
                f.path.endsWith('.config.js') ||
                f.path.endsWith('.config.ts') ||
                f.path.endsWith('.json')
        )

        model = {
            owner,
            repo,
            branch,
            structure,
            files,
            modules,
            workflows: workflows.map((w) => w.path),
            tests: tests.map((t) => t.path),
            configs: configs.map((c) => c.path),
            timestamp: new Date().toISOString(),
        }

        // Save model to cache
        try {
            const fs = require('fs')
            const path = require('path')
            fs.writeFileSync(
                path.join(process.cwd(), 'src/cache/repo-model.json'),
                JSON.stringify(model, null, 2)
            )
            logger.info('Repository model cached')
        } catch (e) {
            logger.warn('Failed to cache repo model')
        }
    }

    logger.info('Repository model ready', {
        modules: model.modules.length,
        cached: isCached
    })

    await emit({
        topic: 'repo-model-built',
        data: {
            model,
            cached: isCached,
        },
    })
}
