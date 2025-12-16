import { EventConfig, Handlers } from 'motia'
import { z } from 'zod'

// OpenAI API config
const OPENAI_API = 'https://api.openai.com/v1/chat/completions'

interface CategorizedCommits {
    features: string[]
    fixes: string[]
    breaking: string[]
    other: string[]
}

async function categorizeCommits(commits: Array<{ sha: string; message: string }>): Promise<CategorizedCommits> {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) throw new Error('OPENAI_API_KEY not configured')

    const commitList = commits.map((c) => `- ${c.message} (${c.sha})`).join('\n')

    const prompt = `Analyze these git commits and categorize them. Return ONLY valid JSON, no markdown.

Commits:
${commitList}

Categorize into:
- features: New features or enhancements
- fixes: Bug fixes
- breaking: Breaking changes (look for BREAKING, breaking:, !)
- other: Docs, refactors, chores, tests

Return this exact JSON structure:
{"features":["commit descriptions"],"fixes":["commit descriptions"],"breaking":["commit descriptions"],"other":["commit descriptions"]}`

    const res = await fetch(OPENAI_API, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.3,
            max_tokens: 2000,
        }),
    })

    if (!res.ok) throw new Error(`OpenAI API error: ${res.statusText}`)

    const data = await res.json()
    const content = data.choices?.[0]?.message?.content || '{}'

    try {
        const cleaned = content.replace(/```json\n?|\n?```/g, '').trim()
        return JSON.parse(cleaned)
    } catch {
        throw new Error('Failed to parse LLM response')
    }
}

const commitSchema = z.object({
    sha: z.string(),
    message: z.string(),
    author: z.string(),
    date: z.string(),
    url: z.string(),
})

const inputSchema = z.object({
    repo: z.string(),
    commits: z.array(commitSchema),
    version: z.string(),
    lastTag: z.string().nullable(),
})

export const config: EventConfig = {
    type: 'event',
    name: 'AnalyzeCommitsWithAI',
    description: 'Uses OpenAI to categorize commits into features, fixes, breaking changes',
    subscribes: ['release.analyze-commits'],
    emits: ['release.generate-notes'],
    input: inputSchema,
    flows: ['release-notes-generator'],
}

export const handler: Handlers['AnalyzeCommitsWithAI'] = async (input, { emit, logger }) => {
    const { repo, commits, version, lastTag } = input
    logger.info('Analyzing commits with AI', { repo, commitCount: commits.length })

    const categories = await categorizeCommits(commits)
    logger.info('Commits categorized', {
        features: categories.features.length,
        fixes: categories.fixes.length,
        breaking: categories.breaking.length,
        other: categories.other.length,
    })

    await emit({
        topic: 'release.generate-notes',
        data: { repo, version, categories, lastTag },
    })
}
