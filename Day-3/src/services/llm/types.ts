import { z } from 'zod'

export const llmResponseSchema = z.object({
    content: z.string(),
    usage: z
        .object({
            prompt_tokens: z.number(),
            completion_tokens: z.number(),
            total_tokens: z.number(),
        })
        .optional(),
})

export type LLMResponse = z.infer<typeof llmResponseSchema>

export interface RepoModel {
    owner: string
    repo: string
    branch: string
    structure: Array<{ path: string; type: 'file' | 'dir' }>
    files: Array<{
        path: string
        content?: string
        snippet: string
        lines: number
        size: number
    }>
    modules: string[]
    workflows: string[]
    tests: string[]
    configs: string[]
    timestamp: string
}
