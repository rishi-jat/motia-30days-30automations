import type { DiscordMessage } from './types'
import { ExternalServiceError } from '../../errors/external-service.error'

export interface SendNotificationParams {
    webhookUrl: string
    message: DiscordMessage
}

/**
 * Sends a message to a Discord channel via webhook
 */
export async function sendNotification(params: SendNotificationParams): Promise<void> {
    const { webhookUrl, message } = params

    const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
    })

    if (!response.ok) {
        const errorText = await response.text()
        throw new ExternalServiceError(`Discord webhook failed: ${response.status} - ${errorText}`, {
            status: response.status,
            webhookUrl,
            errorText,
        })
    }
}
