import { EventConfig, Handlers } from 'motia'
import { z } from 'zod'
import { prioritySchema } from '../../src/services/slack/types'

const inputSchema = z.object({
    issue: z.object({
        number: z.number(),
        title: z.string(),
        url: z.string().url(),
        state: z.string(),
    }),
    label: z.object({
        name: z.string(),
        color: z.string(),
    }),
    repository: z.object({
        name: z.string(),
        fullName: z.string(),
        url: z.string().url(),
    }),
})

export const config: EventConfig = {
    type: 'event',
    name: 'IssueLabelClassifier',
    description: 'Classifies issue labels by priority (HIGH, MEDIUM, LOW)',
    subscribes: ['issue-label-received'],
    emits: ['issue-label-classified'],
    input: inputSchema,
    flows: ['github-issue-label'],
}

export const handler: Handlers['IssueLabelClassifier'] = async (input, { logger, emit }) => {
    const { issue, label, repository } = input

    logger.info('Classifying issue label', {
        issueNumber: issue.number,
        labelName: label.name,
    })

    // Priority classification logic
    const labelLower = label.name.toLowerCase()
    let priority: 'HIGH' | 'MEDIUM' | 'LOW'

    if (
        labelLower.includes('bug') ||
        labelLower.includes('critical') ||
        labelLower.includes('urgent')
    ) {
        priority = 'HIGH'
    } else if (
        labelLower.includes('enhancement') ||
        labelLower.includes('feature')
    ) {
        priority = 'MEDIUM'
    } else {
        priority = 'LOW'
    }

    logger.info('Issue label classified', {
        issueNumber: issue.number,
        labelName: label.name,
        priority,
    })

    await emit({
        topic: 'issue-label-classified',
        data: {
            issue,
            label,
            repository,
            priority,
        },
    })
}
