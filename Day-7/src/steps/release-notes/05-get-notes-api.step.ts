import { ApiRouteConfig, Handlers } from 'motia'
import { z } from 'zod'

// Inline middleware
const coreMiddleware = async (req: any, ctx: any, next: () => Promise<any>) => {
    try {
        return await next()
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            ctx.logger.warn('Validation error', { issues: error.issues })
            return { status: 400, body: { error: 'Invalid request body', data: error.issues } }
        }
        ctx.logger.error('Unhandled error', { error: error.message, stack: error.stack })
        return { status: 500, body: { error: 'Internal Server Error' } }
    }
}

export const config: ApiRouteConfig = {
    type: 'api',
    name: 'GetReleaseNotes',
    description: 'Retrieve generated release notes by repo and version',
    path: '/api/release-notes/:repo/:version',
    method: 'GET',
    emits: [],
    flows: ['release-notes-generator'],
    middleware: [coreMiddleware],
    virtualSubscribes: ['release.generate-notes'],
    responseSchema: {
        200: z.object({
            repo: z.string(),
            version: z.string(),
            markdown: z.string(),
            createdAt: z.string(),
        }),
        404: z.object({ error: z.string() }),
    },
}

interface ReleaseNotesState {
    repo: string
    version: string
    markdown: string
    createdAt: string
}

export const handler: Handlers['GetReleaseNotes'] = async (req, { state, logger }) => {
    const { repo, version } = req.pathParams
    const decodedRepo = decodeURIComponent(repo)
    const stateKey = `${decodedRepo}:${version}`

    logger.info('Retrieving release notes', { stateKey })

    const data = await state.get<ReleaseNotesState>('release-notes', stateKey)

    if (!data) {
        return {
            status: 404,
            body: { error: `Release notes not found for ${decodedRepo} ${version}` },
        }
    }

    return { status: 200, body: data }
}
