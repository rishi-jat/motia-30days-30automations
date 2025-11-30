import { EventConfig, Handlers } from 'motia'
import { z } from 'zod'
import { sendNotification } from '../../src/services/slack/send-notification'
import { prioritySchema } from '../../src/services/slack/types'

const inputSchema = z.object({
    issue: z.any(),
    label: z.any(),
    repository: z.any(),
    priority: prioritySchema,
})

export const config: EventConfig = {
    type: 'event',
    name: 'SlackLabelNotifier',
    description: 'Sends Slack notifications with priority for labeled issues',
    subscribes: ['issue-label-stored'],
    emits: [],
    input: inputSchema,
    flows: ['github-issue-label'],
}

export const handler: Handlers['SlackLabelNotifier'] = async (input, { logger }) => {
    const { issue, label, repository, priority } = input

    logger.info('Sending Slack notification', {
        issueNumber: issue.number,
        labelName: label.name,
        priority,
    })

    const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL

    if (!slackWebhookUrl) {
        logger.error('SLACK_WEBHOOK_URL environment variable not set')
        throw new Error('Slack webhook URL is not configured')
    }

    // Determine color based on priority
    const priorityColors = {
        HIGH: '#ff0000',    // Red
        MEDIUM: '#ff9900',  // Orange
        LOW: '#36a64f',     // Green
    }

    await sendNotification({
        webhookUrl: slackWebhookUrl,
        message: {
            text: `🏷️ New label added to issue (Priority: ${priority})`,
            attachments: [
                {
                    title: issue.title,
                    title_link: issue.url,
                    text: `**Label:** ${label.name}\n**Priority:** ${priority}`,
                    footer: `Repository: ${repository.fullName} • Issue #${issue.number}`,
                    color: priorityColors[priority],
                },
            ],
        },
    })

    logger.info('Slack notification sent successfully', {
        issueNumber: issue.number,
        labelName: label.name,
        priority,
    })
}
