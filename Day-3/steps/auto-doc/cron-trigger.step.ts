import { CronConfig, Handlers } from 'motia'


export const config: CronConfig = {
    type: 'cron',
    name: 'AutoDocCronTrigger',
    description: 'Triggers the auto-documentation workflow daily',
    cron: '0 9 * * *', // Daily at 9 AM
    emits: ['auto-doc-triggered'],
    flows: ['auto-doc'],
}

export const handler: Handlers['AutoDocCronTrigger'] = async ({ logger, emit }) => {
    const owner = process.env.GITHUB_OWNER || 'rishi-jat'
    const repo = process.env.GITHUB_REPO || 'motia-30days-30automations'
    const branch = process.env.GITHUB_BRANCH || 'main'

    logger.info('Auto-doc workflow triggered', {
        owner,
        repo,
        branch,
    })

    await emit({
        topic: 'auto-doc-triggered',
        data: {
            owner,
            repo,
            branch,
            triggeredAt: new Date().toISOString(),
        },
    })
}
