import { ExternalServiceError } from '../../errors/external-service.error'
import { NotFoundError } from '../../errors/not-found.error'
import { issueSchema, type Issue } from './types'

export async function fetchIssueDetails(
    owner: string,
    repo: string,
    issueNumber: number,
    token: string
): Promise<Issue> {
    try {
        const url = `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`

        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28',
            },
        })

        if (response.status === 404) {
            throw new NotFoundError(`Issue #${issueNumber} not found`, {
                owner,
                repo,
                issueNumber,
            })
        }

        if (!response.ok) {
            const errorText = await response.text()
            throw new ExternalServiceError(`GitHub API returned ${response.status}`, {
                status: response.status,
                error: errorText,
            })
        }

        const data = await response.json()

        // Validate schema
        return issueSchema.parse(data)
    } catch (error) {
        if (error instanceof NotFoundError || error instanceof ExternalServiceError) {
            throw error
        }
        throw new ExternalServiceError('Failed to fetch issue details from GitHub', {
            error: error instanceof Error ? error.message : String(error),
        })
    }
}
