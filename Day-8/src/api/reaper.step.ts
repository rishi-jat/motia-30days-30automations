
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
    emits: [],
    responseSchema: {
        200: z.object({ success: z.boolean(), message: z.string() }),
        404: z.object({ error: z.string() })
    },
    flows: ['cloud-janitor']
}

export const handler: Handlers['Reaper'] = async (req, { streams, logger }) => {
    const { resourceId } = req.body

    logger.info(`💀 Attempting to reap resource: ${resourceId}`)

    const success = await cloudService.terminateResource(resourceId)

    if (!success) {
        return { status: 404, body: { error: 'Resource not found' } }
    }

    // Update stream to reflect termination
    const currentStreamItem = await streams.cloudJanitorDashboard.get('zombies', resourceId)
    if (currentStreamItem) {
        await streams.cloudJanitorDashboard.set('zombies', resourceId, {
            ...currentStreamItem,
            status: 'terminated'
        })
    }

    logger.info(`💀 Resource reaped successfully.`)

    return {
        status: 200,
        body: { success: true, message: 'Resource terminated.' }
    }
}
