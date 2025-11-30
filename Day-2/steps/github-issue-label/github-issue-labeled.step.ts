import { ApiRouteConfig, Handlers } from 'motia'
import { z } from 'zod'
import { coreMiddleware } from '../../src/middlewares/core.middleware'

export const config: ApiRouteConfig = {
    type: 'api',
    name: 'GitHubWebhook',
    description: 'Receives GitHub issue and comment webhook events (production-safe)',
    flows: ['github-issue-label'],
    method: 'POST',
    path: '/github/issue-labeled',
    emits: ['issue-label-received', 'issue-comment-received'],
    middleware: [coreMiddleware],
}

export const handler: Handlers['GitHubWebhook'] = async (req, { logger, emit }) => {
    const payload = req.body as any // Defensive parsing - validate manually

    // Defensive extraction - NEVER assume fields exist
    const action = payload?.action
    const issueNumber = payload?.issue?.number
    const issueTitle = payload?.issue?.title
    const issueUrl = payload?.issue?.html_url
    const repoName = payload?.repository?.name
    const repoFullName = payload?.repository?.full_name
    const repoUrl = payload?.repository?.html_url

    logger.info('Received GitHub webhook', {
        action,
        issueNumber,
        hasIssue: !!payload?.issue,
        hasLabel: !!payload?.label,
        hasComment: !!payload?.comment,
    })

    // Handle: issues.labeled event
    if (action === 'labeled' && payload?.label) {
        const labelName = payload.label.name
        const labelColor = payload.label.color

        // If label data is missing, skip silently
        if (!labelName || !issueNumber) {
            logger.warn('Label event missing required fields', { labelName, issueNumber })
            return { status: 200, body: { ok: true } }
        }

        logger.info('Processing label event', { labelName, issueNumber })

        await emit({
            topic: 'issue-label-received',
            data: {
                issue: {
                    number: issueNumber,
                    title: issueTitle || 'Untitled',
                    url: issueUrl || '',
                    state: payload.issue?.state || 'unknown',
                },
                label: {
                    name: labelName,
                    color: labelColor || '000000',
                },
                repository: {
                    name: repoName || 'unknown',
                    fullName: repoFullName || 'unknown/unknown',
                    url: repoUrl || '',
                },
            },
        })

        return { status: 200, body: { ok: true } }
    }

    // Handle: issue_comment.created event
    if (action === 'created' && payload?.comment) {
        const commentBody = payload.comment.body
        const commentAuthor = payload.comment.user?.login
        const commentUrl = payload.comment.html_url

        // If comment data is missing, skip silently
        if (!commentBody || !issueNumber) {
            logger.warn('Comment event missing required fields', { hasBody: !!commentBody, issueNumber })
            return { status: 200, body: { ok: true } }
        }

        logger.info('Processing comment event', { commentAuthor, issueNumber })

        await emit({
            topic: 'issue-comment-received',
            data: {
                issue: {
                    number: issueNumber,
                    title: issueTitle || 'Untitled',
                    url: issueUrl || '',
                },
                comment: {
                    body: commentBody,
                    author: commentAuthor || 'anonymous',
                    url: commentUrl || '',
                },
                repository: {
                    name: repoName || 'unknown',
                    fullName: repoFullName || 'unknown/unknown',
                },
            },
        })

        return { status: 200, body: { ok: true } }
    }

    // Handle: any other GitHub event
    logger.info('Unhandled GitHub event', { action })
    return { status: 200, body: { ok: true } }
}
