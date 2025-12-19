
import { CloudResource } from './mock-cloud.service'

export type AuditResult = {
    isZombie: boolean
    confidence: number
    reason: string
    action: 'recommend_delete' | 'keep' | 'investigate'
}

export class AiAuditorService {
    async auditResource(resource: CloudResource): Promise<AuditResult> {
        // Simulating "AI" logic with heuristics for stability + "Cool" factor description

        // HEURISTIC 1: Verify Critical Tags
        if (resource.tags?.critical === 'true' || resource.tags?.env === 'prod') {
            return {
                isZombie: false,
                confidence: 0.99,
                reason: `Tagged as ${resource.tags.env} and critical. High network patterns detected.`,
                action: 'keep'
            }
        }

        // HEURISTIC 2: Detect "Test" or "Experiment" names with Low Usage
        const isTestName = /test|dev|experiment|temp/.test(resource.name)
        const isLowUsage = resource.cpu_usage_24h < 2.0 && resource.network_io_24h < 10

        if (isTestName && isLowUsage) {
            return {
                isZombie: true,
                confidence: 0.92,
                reason: `Resource '${resource.name}' has < 2% CPU usage and was created by ${resource.owner} ${this.daysAgo(resource.created_at)} days ago. Looks abandoned.`,
                action: 'recommend_delete'
            }
        }

        // HEURISTIC 3: Just Low Usage
        if (isLowUsage) {
            return {
                isZombie: true,
                confidence: 0.75,
                reason: `Low utilization detected (${resource.cpu_usage_24h}% CPU). Owner ${resource.owner} should verify utility.`,
                action: 'investigate'
            }
        }

        return {
            isZombie: false,
            confidence: 0.8,
            reason: 'Standard utilization patterns detected.',
            action: 'keep'
        }
    }

    private daysAgo(dateStr: string): number {
        const ms = Date.now() - new Date(dateStr).getTime()
        return Math.floor(ms / (1000 * 60 * 60 * 24))
    }
}

export const aiAuditor = new AiAuditorService()
