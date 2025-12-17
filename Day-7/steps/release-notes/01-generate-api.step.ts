import { ApiRouteConfig, Handlers } from 'motia'
import { z } from 'zod'

// Inline error class
class BaseError extends Error {
    public readonly status: number
    public readonly code: string
    constructor(message: string, status: number = 500, code: string = 'INTERNAL_SERVER_ERROR') {
        super(message)
        this.status = status
        this.code = code
    }
    toJSON() {
        return { error: { message: this.message, code: this.code, status: this.status } }
    }
}

class InvalidRepoError extends BaseError {
    constructor(repo: string) {
        super(`Invalid repository format: ${repo}. Expected 'owner/repo'`, 400, 'INVALID_REPO')
    }
}

// Inline middleware
const coreMiddleware = async (req: any, ctx: any, next: () => Promise<any>) => {
    try {
        return await next()
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            ctx.logger.warn('Validation error', { issues: error.issues })
            return { status: 400, body: { error: 'Invalid request body', data: error.issues } }
        }
        if (error instanceof BaseError) {
            ctx.logger.warn('BaseError', { status: error.status, code: error.code, message: error.message })
            return { status: error.status, body: error.toJSON() }
        }
        ctx.logger.error('Unhandled error', { error: error.message, stack: error.stack })
        return { status: 500, body: { error: 'Internal Server Error' } }
    }
}

const bodySchema = z.object({
    repo: z.string().describe('GitHub repository in owner/repo format'),
    version: z.string().optional().describe('Version tag (e.g., v1.2.0). Auto-increments if not provided'),
})

export const config: ApiRouteConfig = {
    type: 'api',
    name: 'GenerateReleaseNotes',
    description: 'Trigger release notes generation for a GitHub repository',
    path: '/api/release-notes',
    method: 'POST',
    emits: ['release.fetch-commits'],
    flows: ['release-notes-generator'],
    middleware: [coreMiddleware],
    bodySchema,
    responseSchema: {
        202: z.object({ message: z.string(), traceId: z.string(), repo: z.string() }),
        400: z.object({ error: z.string() }),
    },
}

export const handler: Handlers['GenerateReleaseNotes'] = async (req, { emit, logger, traceId }) => {
    const { repo, version } = bodySchema.parse(req.body)

    const parts = repo.split('/')
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
        throw new InvalidRepoError(repo)
    }

    const [owner, repoName] = parts
    logger.info('Starting release notes generation', { repo, version, traceId })

    await emit({
        topic: 'release.fetch-commits',
        data: { owner, repo: repoName, version: version || 'auto' },
    })

    return {
        status: 202,
        body: { message: 'Release notes generation started', traceId, repo },
    }
}
