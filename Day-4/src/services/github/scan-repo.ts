import { ExternalServiceError } from '../../errors/external-service.error'
import { treeResponseSchema, type FileContent } from './types'
import { cache } from '../../cache'

const CODE_EXTENSIONS = ['.go', '.ts', '.js', '.py', '.md', '.yaml', '.yml', '.json', '.tsx', '.jsx']

export async function scanRepo(
    owner: string,
    repo: string,
    branch: string,
    token: string
): Promise<FileContent[]> {
    try {
        // Check cache first
        const cacheKey = `${owner}/${repo}/${branch}`
        const cached = await cache.get<FileContent[]>('repo-scan', cacheKey)
        if (cached) {
            console.log('✅ Using cached repo scan for:', cacheKey)
            return cached
        }

        // Step 1: Get branch SHA
        const branchUrl = `https://api.github.com/repos/${owner}/${repo}/branches/${branch}`
        const branchResponse = await fetch(branchUrl, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28',
            },
        })

        if (!branchResponse.ok) {
            throw new ExternalServiceError(`Failed to fetch branch ${branch}`, {
                status: branchResponse.status,
            })
        }

        const branchData = (await branchResponse.json()) as { commit: { sha: string } }
        const sha = branchData.commit.sha

        // Step 2: Get recursive tree
        const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${sha}?recursive=1`
        const treeResponse = await fetch(treeUrl, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28',
            },
        })

        if (!treeResponse.ok) {
            throw new ExternalServiceError(`Failed to fetch repository tree`, {
                status: treeResponse.status,
            })
        }

        const treeData = await treeResponse.json()
        const tree = treeResponseSchema.parse(treeData)

        // Step 3: Filter code files
        const codeFiles = tree.tree.filter((item) => {
            if (item.type !== 'blob') return false
            return CODE_EXTENSIONS.some((ext) => item.path.endsWith(ext))
        })

        // Step 4: Fetch file contents (first 80 lines)
        const files: FileContent[] = []

        for (const file of codeFiles.slice(0, 50)) {
            // Limit to 50 files to avoid rate limits
            try {
                const contentUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${file.path}?ref=${branch}`
                const contentResponse = await fetch(contentUrl, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/vnd.github+json',
                        'X-GitHub-Api-Version': '2022-11-28',
                    },
                })

                if (!contentResponse.ok) {
                    continue // Skip files that fail
                }

                const contentData = (await contentResponse.json()) as { content: string }
                const content = Buffer.from(contentData.content, 'base64').toString('utf-8')

                // Get first 80 lines
                const lines = content.split('\n')
                const snippet = lines.slice(0, 80).join('\n')

                files.push({
                    path: file.path,
                    content: snippet,
                    lines: Math.min(lines.length, 80),
                })
            } catch (error) {
                // Skip files that error
                continue
            }
        }

        // Cache the results
        await cache.set('repo-scan', files, cacheKey)

        return files
    } catch (error) {
        if (error instanceof ExternalServiceError) {
            throw error
        }
        throw new ExternalServiceError('Failed to scan repository', {
            error: error instanceof Error ? error.message : String(error),
        })
    }
}
