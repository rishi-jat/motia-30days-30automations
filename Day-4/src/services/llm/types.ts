import { z } from 'zod'

export const issueAnalysisSchema = z.object({
    summary: z.string(),
    rootCause: z.string(),
    filesLikelyInvolved: z.array(z.string()),
    functionsToCheck: z.array(z.string()),
    difficulty: z.enum(['Easy', 'Medium', 'Hard']),
    beginnerFriendly: z.boolean(),
})

export type IssueAnalysis = z.infer<typeof issueAnalysisSchema>

export interface FixGuideInput {
    issueNumber: number
    issueTitle: string
    issueBody: string
    analysis: IssueAnalysis
    repoFiles: Array<{ path: string; content: string }>
}
