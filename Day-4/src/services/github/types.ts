import { z } from 'zod'

export const issueSchema = z.object({
    id: z.number(),
    number: z.number(),
    title: z.string(),
    body: z.string().nullable(),
    state: z.string(),
    html_url: z.string(),
})

export const issueListItemSchema = z.object({
    id: z.number(),
    number: z.number(),
    title: z.string(),
})

export const treeItemSchema = z.object({
    path: z.string(),
    mode: z.string(),
    type: z.string(),
    sha: z.string(),
    size: z.number().optional(),
})

export const treeResponseSchema = z.object({
    sha: z.string(),
    url: z.string(),
    tree: z.array(treeItemSchema),
    truncated: z.boolean(),
})

export const fileContentSchema = z.object({
    path: z.string(),
    content: z.string(),
    lines: z.number(),
})

export type Issue = z.infer<typeof issueSchema>
export type IssueListItem = z.infer<typeof issueListItemSchema>
export type TreeResponse = z.infer<typeof treeResponseSchema>
export type FileContent = z.infer<typeof fileContentSchema>
