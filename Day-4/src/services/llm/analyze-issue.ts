import { generateMockAnalysis } from './mock'
import type { IssueAnalysis } from './types'

export async function analyzeIssue(
    issueTitle: string,
    issueBody: string | null,
    files: Array<{ path: string; content: string }>,
    apiKey: string
): Promise<IssueAnalysis> {
    // Use mock for demo (OpenAI API is rate-limited)
    console.log('🎯 Using smart mock analysis')
    return generateMockAnalysis(issueTitle, issueBody, files)
}
