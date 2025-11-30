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
    priority: prioritySchema,
})

export const config: EventConfig = {
    type: 'event',
    name: 'IssueLabelStateUpdater',
    description: 'Stores issue label state with priority',
    subscribes: ['issue-label-classified'],
    emits: ['issue-label-stored'],
    input: inputSchema,
    flows: ['github-issue-label'],
}

export const handler: Handlers['IssueLabelStateUpdater'] = async (input, { logger, state, emit }) => {
    try {
        const { issue, label, repository, priority } = input

        logger.info('Storing issue label state', {
            issueNumber: issue.number,
            labelName: label.name,
            priority,
        })

        // Store state using Motia State
        try {
            await state.set(`issues:${issue.number}`, {
                label: label.name,
                priority,
                repo: repository.fullName,
                updatedAt: new Date().toISOString(),
            })

            logger.info('Issue label state stored successfully', {
                issueNumber: issue.number,
                stateKey: `issues:${issue.number}`,
            })
        } catch (stateError: any) {
            logger.error('Failed to store issue label state', {
                error: stateError.message,
                issueNumber: issue.number
            })
            // Continue execution even if state storage fails
        }

        // Emit without 'state' field to match SlackLabelNotifier schema
        const { state: _, ...issueWithoutState } = issue

        logger.info('Emitting issue-label-stored', {
            payload: {
                issue: issueWithoutState,
                label,
                repository,
                priority
            }
        })

        await emit({
            topic: 'issue-label-stored',
            data: {
                issue: issueWithoutState,
                label,
                repository,
                priority,
            },
        })
    } catch (error: any) {
        logger.error('Error in IssueLabelStateUpdater', {
            error: error.message,
            stack: error.stack,
            input
        })
        throw error // Re-throw to ensure Motia knows it failed
    }
}
