import { EventConfig, Handlers } from 'motia'
import { z } from 'zod'
import { discordService } from '../../src/services/discord'

const inputSchema = z.object({
    releaseName: z.string(),
    releaseBody: z.string(),
    releaseUrl: z.string().url(),
    releaseTag: z.string(),
    publishedAt: z.string(),
    repositoryName: z.string(),
    repositoryUrl: z.string().url(),
    authorLogin: z.string().optional(),
})

export const config: EventConfig = {
    type: 'event',
    name: 'DiscordNotification',
    description: 'Sends GitHub release notifications to Discord via webhook',
    flows: ['github-release-notifier'],
    subscribes: ['github-release-published'],
    emits: [],
    input: inputSchema,
}

export const handler: Handlers['DiscordNotification'] = async (input, { logger }) => {
    const {
        releaseName,
        releaseBody,
        releaseUrl,
        releaseTag,
        repositoryName,
        authorLogin,
    } = input

    logger.info('Processing Discord notification', {
        repository: repositoryName,
        releaseTag,
    })

    // Get Discord webhook URL from environment variable
    const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL

    if (!discordWebhookUrl) {
        logger.error('DISCORD_WEBHOOK_URL environment variable not set')
        throw new Error('Discord webhook URL is not configured')
    }

    await discordService.sendNotification({
        webhookUrl: discordWebhookUrl,
        message: {
            content: `🚀 **New GitHub Release Published!**`,
            embeds: [
                {
                    title: releaseName || 'New Release',
                    description: releaseBody || 'No description provided',
                    url: releaseUrl,
                    color: 0x5865f2, // Discord blurple color
                    timestamp: new Date().toISOString(),
                },
            ],
        },
    })

    logger.info('Discord notification sent successfully', {
        repository: repositoryName,
        releaseTag,
        author: authorLogin,
    })
}
