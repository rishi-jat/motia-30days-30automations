import { ApiRouteConfig, Handlers } from 'motia'
import { githubWebhookSchema } from '../../src/services/discord/types'
import { coreMiddleware } from '../../src/middlewares/core.middleware'

export const config: ApiRouteConfig = {
    type: 'api',
    name: 'GitHubWebhook',
    description: 'Receives GitHub release webhook events and emits them for processing',
    flows: ['github-release-notifier'],
    method: 'POST',
    path: '/github/webhook',
    bodySchema: githubWebhookSchema,
    responseSchema: {
        200: githubWebhookSchema.pick({ action: true }),
    },
    emits: ['github-release-published'],
    middleware: [coreMiddleware],
}

export const handler: Handlers['GitHubWebhook'] = async (req, { logger, emit }) => {
    const { action, release, repository } = req.body

    logger.info('GitHub webhook received', {
        action,
        repository: repository.full_name,
        releaseName: release.name,
        releaseTag: release.tag_name,
    })

    // Only process release published/created events
    if (action === 'published' || action === 'created' || action === 'released') {
        logger.info('Processing release event', { releaseTag: release.tag_name })

        await emit({
            topic: 'github-release-published',
            data: {
                releaseName: release.name,
                releaseBody: release.body || '',
                releaseUrl: release.html_url,
                releaseTag: release.tag_name,
                publishedAt: release.published_at,
                repositoryName: repository.full_name,
                repositoryUrl: repository.html_url,
                authorLogin: release.author?.login,
            },
        })

        logger.info('GitHub release event emitted successfully', {
            releaseTag: release.tag_name,
        })
    } else {
        logger.info('Ignoring non-release action', { action })
    }

    return {
        status: 200,
        body: { action },
    }
}
