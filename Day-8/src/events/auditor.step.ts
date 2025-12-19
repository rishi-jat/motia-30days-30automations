
import { EventConfig, Handlers } from 'motia'
import { ResourceSchema } from '../services/mock-cloud.service'
import { aiAuditor } from '../services/ai-auditor.service'
import { z } from 'zod'

export const config: EventConfig = {
    name: 'ResourceAuditor',
    type: 'event',
    subscribes: ['audit-resource'],
    emits: [{ topic: 'dashboard-update', label: 'Zombie found', conditional: true }],
    input: ResourceSchema,
    flows: ['cloud-janitor']
}

export const handler: Handlers['ResourceAuditor'] = async (resource, { emit, logger }) => {
    const audit = await aiAuditor.auditResource(resource)

    if (audit.isZombie) {
        logger.warn(`🧟 Zombie Detected: ${resource.name}`, { reason: audit.reason })

        await emit({
            topic: 'dashboard-update',
            data: {
                id: resource.id,
                name: resource.name,
                type: resource.type,
                cost_per_hour: resource.cost_per_hour,
                status: 'zombie_detected',
                reason: audit.reason,
                detected_at: new Date().toISOString()
            }
        })
    } else {
        logger.info(`✅ Resource Clean: ${resource.name}`)
    }
}
