
import { ApiRouteConfig, Handlers } from 'motia'
import { z } from 'zod'
import { cloudService } from '../services/mock-cloud.service'

const BodySchema = z.object({
    resourceId: z.string()
})

export const config: ApiRouteConfig = {
    name: 'Reaper',
    type: 'api',
    path: '/reap-resource',
    method: 'POST',
    bodySchema: BodySchema,
    emits: ['dashboard-update'],
    responseSchema: {
        200: z.object({ success: z.boolean(), message: z.string() }),
        404: z.object({ error: z.string() })
    },
    flows: ['cloud-janitor']
}

export const handler: Handlers['Reaper'] = async (req, { emit, streams, logger }) => {
    const { resourceId } = req.body

    logger.info(`💀 Attempting to reap resource: ${resourceId}`)

    const resource = await cloudService.getResource(resourceId)
    if (!resource) {
        return { status: 404, body: { error: 'Resource not found' } }
    }

    const success = await cloudService.terminateResource(resourceId)

    if (!success) {
        return { status: 404, body: { error: 'Resource not found' } }
    }

    const currentStreamItem = await streams.cloudJanitorDashboard.get('zombies', resourceId)
    const now = new Date().toISOString()
    await emit({
        topic: 'dashboard-update',
        data: {
            id: resource.id,
            name: resource.name,
            type: resource.type,
            cost_per_hour: resource.cost_per_hour,
            status: 'terminated',
            reason: currentStreamItem?.reason ?? 'Terminated via API',
            detected_at: currentStreamItem?.detected_at ?? now
        }
    })

    logger.info(`💀 Resource reaped successfully.`)

    return {
        status: 200,
        body: { success: true, message: 'Resource terminated.' }
    }
}
