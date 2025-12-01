import { ExternalServiceError } from '../../errors/external-service.error'
import { githubTreeResponseSchema, type RepoTree } from './types'

export async function fetchRepositoryTree(
    owner: string,
    repo: string,
    token: string,
    branch = 'main'
): Promise<RepoTree[]> {
    try {
        // Step 1: Get the SHA of the branch
        const branchUrl = `https://api.github.com/repos/${owner}/${repo}/branches/${branch}`

        const branchResponse = await fetch(branchUrl, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/vnd.github.v3+json',
                'User-Agent': 'Motia-AutoDoc',
            },
        })

        if (!branchResponse.ok) {
            throw new ExternalServiceError(
                `GitHub API returned ${branchResponse.status} when fetching branch: ${branchResponse.statusText}`,
                {
                    status: branchResponse.status,
                    owner,
                    repo,
                    branch,
                }
            )
        }

        const branchData = await branchResponse.json()
        const treeSha = branchData.commit.commit.tree.sha

        // Step 2: Get the tree using the SHA
        const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${treeSha}?recursive=1`

        const response = await fetch(treeUrl, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/vnd.github.v3+json',
                'User-Agent': 'Motia-AutoDoc',
            },
        })

        if (!response.ok) {
            throw new ExternalServiceError(
                `GitHub API returned ${response.status}: ${response.statusText}`,
                {
                    status: response.status,
                    owner,
                    repo,
                }
            )
        }

        const data = await response.json()
        const validated = githubTreeResponseSchema.parse(data)

        // Convert GitHub tree format to our simplified format
        return validated.tree.map((node) => ({
            path: node.path,
            type: node.type === 'blob' ? ('file' as const) : ('dir' as const),
        }))
    } catch (error) {
        if (error instanceof ExternalServiceError) {
            throw error
        }
        throw new ExternalServiceError('Failed to fetch repository tree', {
            error: error instanceof Error ? error.message : String(error),
            owner,
            repo,
        })
    }
}
