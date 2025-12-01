import { ExternalServiceError } from '../../errors/external-service.error'
import { githubContentSchema, type RepoFile } from './types'

export async function fetchFileContent(
    owner: string,
    repo: string,
    path: string,
    token: string
): Promise<RepoFile> {
    try {
        const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`

        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/vnd.github.v3+json',
                'User-Agent': 'Motia-AutoDoc',
            },
        })

        if (!response.ok) {
            throw new ExternalServiceError(
                `GitHub API returned ${response.status} for ${path}`,
                {
                    status: response.status,
                    path,
                }
            )
        }

        const data = await response.json()
        const validated = githubContentSchema.parse(data)

        if (validated.type !== 'file' || !validated.content) {
            throw new ExternalServiceError('Path is not a file or has no content', {
                path,
                type: validated.type,
            })
        }

        // Decode base64 content
        const content = Buffer.from(validated.content, 'base64').toString('utf-8')
        const lines = content.split('\n')
        const snippet = lines.slice(0, 100).join('\n')

        return {
            path: validated.path,
            content,
            snippet,
            lines: lines.length,
            size: validated.size,
        }
    } catch (error) {
        if (error instanceof ExternalServiceError) {
            throw error
        }
        throw new ExternalServiceError('Failed to fetch file content', {
            error: error instanceof Error ? error.message : String(error),
            path,
        })
    }
}
