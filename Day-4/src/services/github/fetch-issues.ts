import { z } from 'zod'
import { ExternalServiceError } from '../../errors/external-service.error'
import { issueListItemSchema, type IssueListItem } from './types'

export async function fetchIssues(
    owner: string,
    repo: string,
    token: string
): Promise<IssueListItem[]> {
    try {
        const url = `https://api.github.com/repos/${owner}/${repo}/issues?state=open&per_page=100`

        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28',
            },
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new ExternalServiceError(`GitHub API returned ${response.status}`, {
                status: response.status,
                error: errorText,
            })
        }

        const data = await response.json()

        // Validate and map to simple list items
        const issues = data
            .filter((issue: any) => !issue.pull_request) // Exclude pull requests
            .map((issue: any) => ({
                id: issue.id,
                number: issue.number,
                title: issue.title,
            }))

        // Validate schema
        return z.array(issueListItemSchema).parse(issues)
    } catch (error) {
        if (error instanceof ExternalServiceError) {
            throw error
        }
        throw new ExternalServiceError('Failed to fetch issues from GitHub', {
            error: error instanceof Error ? error.message : String(error),
        })
    }
}
