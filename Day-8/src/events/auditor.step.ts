
import { EventConfig, Handlers } from 'motia'
import { ResourceSchema } from '../services/mock-cloud.service'
import { aiAuditor } from '../services/ai-auditor.service'
import { z } from 'zod'

export const config: EventConfig = {
    name: 'ResourceAuditor',
    type: 'event',
    subscribes: ['audit-resource'],
    emits: [],
    input: ResourceSchema,
    flows: ['cloud-janitor']
}

export const handler: Handlers['ResourceAuditor'] = async (resource, { streams, logger }) => {
    const audit = await aiAuditor.auditResource(resource)

    if (audit.isZombie) {
        logger.warn(`🧟 Zombie Detected: ${resource.name}`, { reason: audit.reason })

        // Update the Dashboard Stream to show this zombie
        // await streams.cloudJanitorDashboard.set('zombies', resource.id, {
        //     id: resource.id,
        //     name: resource.name,
        //     type: resource.type,
        //     cost_per_hour: resource.cost_per_hour,
        //     status: 'zombie_detected',
        //     reason: audit.reason,
        //     detected_at: new Date().toISOString()
        // })
    } else {
        logger.info(`✅ Resource Clean: ${resource.name}`)
    }
}
