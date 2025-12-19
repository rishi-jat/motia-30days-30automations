
import { StreamConfig } from 'motia'
import { z } from 'zod'

export const DashboardDataSchema = z.object({
    id: z.string(), // Resource ID
    name: z.string(),
    type: z.string(),
    cost_per_hour: z.number(),
    status: z.enum(['pending_review', 'zombie_detected', 'terminated']),
    reason: z.string(),
    detected_at: z.string()
})

export type DashboardItem = z.infer<typeof DashboardDataSchema>

export const config: StreamConfig = {
    name: 'cloudJanitorDashboard',
    schema: DashboardDataSchema,
    baseConfig: { storageType: 'default' },
}
