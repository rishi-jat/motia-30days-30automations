
import { CronConfig, Handlers } from 'motia'
import { cloudService } from '../services/mock-cloud.service'

export const config: CronConfig = {
    name: 'InfrastructureScan',
    type: 'cron',
    // Runs every 10 seconds for demo purposes
    cron: '*/10 * * * * *',
    emits: ['audit-resource'],
    flows: ['cloud-janitor']
}

export const handler: Handlers['InfrastructureScan'] = async ({ emit, logger }) => {
    logger.info('📡 Starting Infrastructure Scan...')

    const resources = await cloudService.getResources()
    logger.info(`Found ${resources.length} active resources.`)

    for (const resource of resources) {
        await emit({
            topic: 'audit-resource',
            data: resource
        })
    }
}
