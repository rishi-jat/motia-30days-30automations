import { EventConfig, Handlers } from 'motia'
import { z } from 'zod'
import { sendNotification } from '../../src/services/slack/send-notification'

const inputSchema = z.object({
    issue: z.object({
        number: z.number(),
        title: z.string(),
        url: z.string().url(),
    }),
    comment: z.object({
        body: z.string(),
        author: z.string(),
        url: z.string().url(),
    }),
    repository: z.object({
        name: z.string(),
        fullName: z.string(),
    }),
})

export const config: EventConfig = {
    type: 'event',
    name: 'IssueCommentNotifier',
    description: 'Sends Slack notifications for new issue comments',
    subscribes: ['issue-comment-received'],
    emits: [],
    input: inputSchema,
    flows: ['github-issue-label'],
}

export const handler: Handlers['IssueCommentNotifier'] = async (input, { logger }) => {
    const { issue, comment, repository } = input

    logger.info('Sending comment notification to Slack', {
        issueNumber: issue.number,
        commentAuthor: comment.author,
    })

    const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL

    if (!slackWebhookUrl) {
        logger.error('SLACK_WEBHOOK_URL environment variable not set')
        throw new Error('Slack webhook URL is not configured')
    }

    await sendNotification({
        webhookUrl: slackWebhookUrl,
        message: {
            text: `💬 New Comment`,
            attachments: [
                {
                    title: `Issue #${issue.number} — "${issue.title}"`,
                    title_link: issue.url,
                    text: `**By:** @${comment.author}\n**Comment:** "${comment.body.substring(0, 200)}${comment.body.length > 200 ? '...' : ''}"`,
                    footer: `Repository: ${repository.fullName}`,
                    color: '#0366d6', // GitHub blue
                },
            ],
        },
    })

    logger.info('Comment notification sent successfully', {
        issueNumber: issue.number,
        commentAuthor: comment.author,
    })
}
