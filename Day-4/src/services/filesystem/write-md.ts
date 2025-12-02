import * as fs from 'fs'
import * as path from 'path'
import type { WriteMarkdownOptions } from './types'

export async function writeMarkdown(options: WriteMarkdownOptions): Promise<void> {
    const { path: filePath, content } = options

    // Ensure directory exists
    const dir = path.dirname(filePath)
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
    }

    // Write file
    fs.writeFileSync(filePath, content, 'utf-8')
}
