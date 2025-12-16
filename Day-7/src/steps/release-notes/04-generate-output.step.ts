import { EventConfig, Handlers } from 'motia'
import { z } from 'zod'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

interface CategorizedCommits {
    features: string[]
    fixes: string[]
    breaking: string[]
    other: string[]
}

function generateReleaseNotes(repo: string, version: string, categories: CategorizedCommits, lastTag?: string): string {
    const lines: string[] = []
    const date = new Date().toISOString().split('T')[0]

    lines.push(`# 🚀 ${version} Release Notes`)
    lines.push('')
    lines.push(`**Repository:** ${repo}`)
    lines.push(`**Date:** ${date}`)
    if (lastTag) lines.push(`**Previous Version:** ${lastTag}`)
    lines.push('')

    if (categories.breaking.length) {
        lines.push('## ⚠️ Breaking Changes')
        categories.breaking.forEach((c) => lines.push(`- ${c}`))
        lines.push('')
    }

    if (categories.features.length) {
        lines.push('## ✨ New Features')
        categories.features.forEach((c) => lines.push(`- ${c}`))
        lines.push('')
    }

    if (categories.fixes.length) {
        lines.push('## 🐛 Bug Fixes')
        categories.fixes.forEach((c) => lines.push(`- ${c}`))
        lines.push('')
    }

    if (categories.other.length) {
        lines.push('## 📝 Other Changes')
        categories.other.forEach((c) => lines.push(`- ${c}`))
        lines.push('')
    }

    const total = categories.features.length + categories.fixes.length + categories.breaking.length + categories.other.length

    lines.push('---')
    lines.push(`*Generated with ❤️ by Motia Release Notes Generator*`)
    lines.push(`*${total} commits analyzed*`)

    return lines.join('\n')
}

const categoriesSchema = z.object({
    features: z.array(z.string()),
    fixes: z.array(z.string()),
    breaking: z.array(z.string()),
    other: z.array(z.string()),
})

const inputSchema = z.object({
    repo: z.string(),
    version: z.string(),
    categories: categoriesSchema,
    lastTag: z.string().nullable(),
})

export const config: EventConfig = {
    type: 'event',
    name: 'GenerateReleaseNotesOutput',
    description: 'Generates the final release notes markdown file',
    subscribes: ['release.generate-notes'],
    emits: [],
    input: inputSchema,
    flows: ['release-notes-generator'],
}

export const handler: Handlers['GenerateReleaseNotesOutput'] = async (input, { logger, state }) => {
    const { repo, version, categories, lastTag } = input
    logger.info('Generating release notes', { repo, version })

    const releaseNotes = generateReleaseNotes(repo, version, categories, lastTag || undefined)

    const outputDir = join(process.cwd(), 'output')
    await mkdir(outputDir, { recursive: true })

    const filename = `${repo.replace('/', '-')}-${version}.md`
    const filepath = join(outputDir, filename)

    await writeFile(filepath, releaseNotes, 'utf-8')
    logger.info('Release notes saved', { filepath })

    const stateKey = `${repo}:${version}`
    await state.set('release-notes', stateKey, {
        repo,
        version,
        markdown: releaseNotes,
        createdAt: new Date().toISOString(),
    })

    logger.info('Release notes generation complete', { repo, version, stateKey })
}
