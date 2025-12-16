import { EventConfig, Handlers } from 'motia'
import { z } from 'zod'

// GitHub API types
interface GitHubCommit {
    sha: string
    message: string
    author: string
    date: string
    url: string
}

interface GitHubTag {
    name: string
    sha: string
}

// Inline GitHub service
const GITHUB_API = 'https://api.github.com'

function getHeaders(): HeadersInit {
    const token = process.env.GITHUB_TOKEN
    return {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'Motia-Release-Notes-Generator',
        ...(token && { Authorization: `Bearer ${token}` }),
    }
}

async function getLatestTag(owner: string, repo: string): Promise<GitHubTag | null> {
    const url = `${GITHUB_API}/repos/${owner}/${repo}/tags?per_page=1`
    const res = await fetch(url, { headers: getHeaders() })
    if (!res.ok || res.status === 404) return null
    const tags = await res.json()
    if (!tags.length) return null
    return { name: tags[0].name, sha: tags[0].commit.sha }
}

async function getCommitsSince(owner: string, repo: string, since?: string): Promise<GitHubCommit[]> {
    const params = new URLSearchParams({ per_page: '100' })
    if (since) params.append('since', since)

    const url = `${GITHUB_API}/repos/${owner}/${repo}/commits?${params}`
    const res = await fetch(url, { headers: getHeaders() })
    if (!res.ok) throw new Error(`GitHub API error: ${res.statusText}`)

    const commits = await res.json()
    return commits.map((c: any) => ({
        sha: c.sha.slice(0, 7),
        message: c.commit.message.split('\n')[0],
        author: c.commit.author?.name || c.author?.login || 'Unknown',
        date: c.commit.author?.date || '',
        url: c.html_url,
    }))
}

async function getTagCommitDate(owner: string, repo: string, sha: string): Promise<string> {
    const url = `${GITHUB_API}/repos/${owner}/${repo}/commits/${sha}`
    const res = await fetch(url, { headers: getHeaders() })
    if (!res.ok) return ''
    const commit = await res.json()
    return commit.commit?.author?.date || ''
}

const inputSchema = z.object({
    owner: z.string(),
    repo: z.string(),
    version: z.string(),
})

export const config: EventConfig = {
    type: 'event',
    name: 'FetchGitHubCommits',
    description: 'Fetches commits from GitHub since the last tag',
    subscribes: ['release.fetch-commits'],
    emits: ['release.analyze-commits'],
    input: inputSchema,
    flows: ['release-notes-generator'],
}

export const handler: Handlers['FetchGitHubCommits'] = async (input, { emit, logger }) => {
    const { owner, repo, version } = input
    logger.info('Fetching commits from GitHub', { owner, repo })

    const latestTag = await getLatestTag(owner, repo)
    let since: string | undefined
    if (latestTag) {
        since = await getTagCommitDate(owner, repo, latestTag.sha)
    }

    const commits = await getCommitsSince(owner, repo, since)
    logger.info('Fetched commits', { count: commits.length, latestTag: latestTag?.name })

    let nextVersion = version
    if (version === 'auto') {
        if (latestTag) {
            const match = latestTag.name.match(/v?(\d+)\.(\d+)\.(\d+)/)
            if (match) {
                const [, major, minor, patch] = match
                nextVersion = `v${major}.${minor}.${parseInt(patch) + 1}`
            } else {
                nextVersion = 'v1.0.0'
            }
        } else {
            nextVersion = 'v1.0.0'
        }
    }

    await emit({
        topic: 'release.analyze-commits',
        data: {
            repo: `${owner}/${repo}`,
            commits,
            version: nextVersion,
            lastTag: latestTag?.name || null,
        },
    })
}
