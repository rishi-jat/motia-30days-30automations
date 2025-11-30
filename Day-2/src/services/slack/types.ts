import { z } from 'zod'

// Priority levels
export const prioritySchema = z.enum(['HIGH', 'MEDIUM', 'LOW'])
export type Priority = z.infer<typeof prioritySchema>

// Slack message schemas
export const slackAttachmentSchema = z.object({
    title: z.string(),
    title_link: z.string().url(),
    text: z.string(),
    footer: z.string().optional(),
    color: z.string().optional(),
})

export const slackMessageSchema = z.object({
    text: z.string(),
    attachments: z.array(slackAttachmentSchema).optional(),
})

export type SlackAttachment = z.infer<typeof slackAttachmentSchema>
export type SlackMessage = z.infer<typeof slackMessageSchema>

// GitHub webhook schemas - ALL FIELDS OPTIONAL for production safety
export const githubLabelSchema = z.object({
    name: z.string().optional(),
    color: z.string().optional(),
}).optional()

export const githubUserSchema = z.object({
    login: z.string().optional(),
    avatar_url: z.string().optional(),
}).optional()

export const githubCommentSchema = z.object({
    body: z.string().optional(),
    user: githubUserSchema,
    html_url: z.string().optional(),
}).optional()

export const githubIssueSchema = z.object({
    title: z.string().optional(),
    html_url: z.string().optional(),
    number: z.number().optional(),
    state: z.string().optional(),
    body: z.string().nullable().optional(),
}).optional()

export const githubRepositorySchema = z.object({
    name: z.string().optional(),
    full_name: z.string().optional(),
    html_url: z.string().optional(),
}).optional()

// Generic GitHub webhook - accepts any action and event type
export const githubWebhookSchema = z.object({
    action: z.string().optional(),
    issue: githubIssueSchema,
    label: githubLabelSchema,
    comment: githubCommentSchema,
    repository: githubRepositorySchema,
}).passthrough() // Allow extra fields

export type GitHubLabel = z.infer<typeof githubLabelSchema>
export type GitHubUser = z.infer<typeof githubUserSchema>
export type GitHubComment = z.infer<typeof githubCommentSchema>
export type GitHubIssue = z.infer<typeof githubIssueSchema>
export type GitHubRepository = z.infer<typeof githubRepositorySchema>
export type GitHubWebhook = z.infer<typeof githubWebhookSchema>

// Issue state schema
export const issueStateSchema = z.object({
    label: z.string(),
    priority: prioritySchema,
    repo: z.string(),
    updatedAt: z.string(),
})

export type IssueState = z.infer<typeof issueStateSchema>
