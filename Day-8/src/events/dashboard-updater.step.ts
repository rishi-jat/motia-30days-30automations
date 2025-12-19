
import { EventConfig, Handlers } from 'motia'
import { DashboardDataSchema } from '../streams/dashboard.stream'

export const config: EventConfig = {
    name: 'DashboardUpdater',
    type: 'event',
    subscribes: ['dashboard-update'],
    emits: [],
    input: DashboardDataSchema,
    flows: ['cloud-janitor']
}

export const handler: Handlers['DashboardUpdater'] = async (item, { streams, logger }) => {
    await streams.cloudJanitorDashboard.set('zombies', item.id, item)
    logger.info('📊 Dashboard updated', { id: item.id, status: item.status })
}

