import { z } from 'zod'

// GitHub API Tree Response
export const githubTreeNodeSchema = z.object({
    path: z.string(),
    mode: z.string(),
    type: z.enum(['blob', 'tree']),
    sha: z.string(),
    size: z.number().optional(),
    url: z.string(),
})

export const githubTreeResponseSchema = z.object({
    sha: z.string(),
    url: z.string(),
    tree: z.array(githubTreeNodeSchema),
    truncated: z.boolean(),
})

// GitHub API Content Response
export const githubContentSchema = z.object({
    name: z.string(),
    path: z.string(),
    sha: z.string(),
    size: z.number(),
    url: z.string(),
    html_url: z.string(),
    git_url: z.string(),
    download_url: z.string().nullable(),
    type: z.enum(['file', 'dir']),
    content: z.string().optional(),
    encoding: z.string().optional(),
})

// Our Internal Types
export type GitHubTreeNode = z.infer<typeof githubTreeNodeSchema>
export type GitHubTreeResponse = z.infer<typeof githubTreeResponseSchema>
export type GitHubContent = z.infer<typeof githubContentSchema>

export interface RepoFile {
    path: string
    content: string
    snippet: string
    lines: number
    size: number
}

export interface RepoTree {
    path: string
    type: 'file' | 'dir'
}
