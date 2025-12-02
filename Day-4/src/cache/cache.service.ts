import * as fs from 'fs/promises'
import * as path from 'path'
import * as crypto from 'crypto'

interface CacheEntry<T> {
    data: T
    timestamp: number
    key: string
}

export class CacheService {
    private cacheDir: string
    private ttl: number // Time to live in milliseconds

    constructor(cacheDir: string = '.cache', ttl: number = 24 * 60 * 60 * 1000) {
        this.cacheDir = cacheDir
        this.ttl = ttl
    }

    private generateKey(namespace: string, ...args: any[]): string {
        const data = JSON.stringify({ namespace, args })
        return crypto.createHash('md5').update(data).digest('hex')
    }

    private getCachePath(key: string): string {
        return path.join(this.cacheDir, `${key}.json`)
    }

    async ensureCacheDir(): Promise<void> {
        try {
            await fs.mkdir(this.cacheDir, { recursive: true })
        } catch (error) {
            // Directory might already exist
        }
    }

    async get<T>(namespace: string, ...args: any[]): Promise<T | null> {
        try {
            const key = this.generateKey(namespace, ...args)
            const cachePath = this.getCachePath(key)

            const data = await fs.readFile(cachePath, 'utf-8')
            const entry: CacheEntry<T> = JSON.parse(data)

            // Check if cache is still valid
            const now = Date.now()
            if (now - entry.timestamp > this.ttl) {
                // Cache expired, delete it
                await fs.unlink(cachePath)
                return null
            }

            return entry.data
        } catch (error) {
            // Cache miss or error reading
            return null
        }
    }

    async set<T>(namespace: string, data: T, ...args: any[]): Promise<void> {
        try {
            await this.ensureCacheDir()

            const key = this.generateKey(namespace, ...args)
            const cachePath = this.getCachePath(key)

            const entry: CacheEntry<T> = {
                data,
                timestamp: Date.now(),
                key,
            }

            await fs.writeFile(cachePath, JSON.stringify(entry, null, 2))
        } catch (error) {
            console.error('Failed to write cache:', error)
        }
    }

    async clear(): Promise<void> {
        try {
            const files = await fs.readdir(this.cacheDir)
            await Promise.all(
                files.map((file) => fs.unlink(path.join(this.cacheDir, file)))
            )
        } catch (error) {
            // Cache directory might not exist
        }
    }

    async has(namespace: string, ...args: any[]): Promise<boolean> {
        const data = await this.get(namespace, ...args)
        return data !== null
    }
}

// Export a singleton instance
export const cache = new CacheService()
