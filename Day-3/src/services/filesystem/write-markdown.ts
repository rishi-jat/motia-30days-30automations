import { promises as fs } from 'fs'
import { dirname } from 'path'
import { ExternalServiceError } from '../../errors/external-service.error'

export async function writeMarkdownFile(
    filePath: string,
    content: string
): Promise<void> {
    try {
        // Ensure directory exists
        const dir = dirname(filePath)
        await fs.mkdir(dir, { recursive: true })

        // Write file
        await fs.writeFile(filePath, content, 'utf-8')
    } catch (error) {
        throw new ExternalServiceError('Failed to write markdown file', {
            error: error instanceof Error ? error.message : String(error),
            filePath,
        })
    }
}
