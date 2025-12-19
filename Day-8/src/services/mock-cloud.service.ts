
import { z } from 'zod'

export const ResourceSchema = z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(['ec2', 'rds', 's3', 'lambda']),
    owner: z.string(),
    created_at: z.string(),
    cpu_usage_24h: z.number(), // 0-100%
    network_io_24h: z.number(), // MB
    cost_per_hour: z.number(),
    status: z.enum(['running', 'stopped', 'terminated']),
    tags: z.record(z.string(), z.string()).optional()
})

export type CloudResource = z.infer<typeof ResourceSchema>

const MOCK_RESOURCES: CloudResource[] = [
    {
        id: 'i-0a1b2c3d4e',
        name: 'test-env-db',
        type: 'rds',
        owner: 'rishi',
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        cpu_usage_24h: 1.2,
        network_io_24h: 5,
        cost_per_hour: 1.5,
        status: 'running',
        tags: { env: 'test', project: 'migration-v1' }
    },
    {
        id: 'i-9z8y7x6w5v',
        name: 'kafka-prod-broker-1',
        type: 'ec2',
        owner: 'devops-team',
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
        cpu_usage_24h: 45.0,
        network_io_24h: 15000,
        cost_per_hour: 4.0,
        status: 'running',
        tags: { env: 'prod', critical: 'true' }
    },
    {
        id: 'i-5t4r3e2w1q',
        name: 'jason-experiment-vm',
        type: 'ec2',
        owner: 'jason',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        cpu_usage_24h: 0.1,
        network_io_24h: 0,
        cost_per_hour: 0.85,
        status: 'running',
        tags: { env: 'dev' }
    }
]

export class MockCloudService {
    async getResources(): Promise<CloudResource[]> {
        return MOCK_RESOURCES.filter(r => r.status === 'running')
    }

    async getResource(resourceId: string): Promise<CloudResource | null> {
        return MOCK_RESOURCES.find(r => r.id === resourceId) ?? null
    }

    async terminateResource(resourceId: string): Promise<boolean> {
        const resource = MOCK_RESOURCES.find(r => r.id === resourceId)
        if (resource) {
            resource.status = 'terminated'
            return true
        }
        return false
    }

    async getMetrics(resourceId: string) {
        const resource = MOCK_RESOURCES.find(r => r.id === resourceId)
        if (!resource) return null
        return {
            cpu: resource.cpu_usage_24h,
            network: resource.network_io_24h
        }
    }
}

export const cloudService = new MockCloudService()
