/**
 * Step 1: Upload Logs API
 * POST /analyze-logs - Receives raw logs and starts the analysis workflow
 */

import { ApiRouteConfig, Handlers } from 'motia';
import { z } from 'zod';

// Input validation schema
const UploadLogsInputSchema = z.object({
    logs: z.string().min(1, 'Logs cannot be empty').max(100000, 'Logs too large (max 100KB)'),
});

export const config: ApiRouteConfig = {
    type: 'api',
    name: 'UploadLogsApi',
    description: 'POST /analyze-logs - Receives raw logs and starts analysis workflow',
    flows: ['ai-log-analyzer'],
    method: 'POST',
    path: '/analyze-logs',
    bodySchema: UploadLogsInputSchema,
    responseSchema: {
        200: z.object({
            success: z.boolean(),
            message: z.string(),
            logsReceived: z.number(),
        }),
        400: z.object({
            success: z.boolean(),
            error: z.string(),
        }),
    },
    emits: ['logs.received'],
};

export const handler: Handlers['UploadLogsApi'] = async (req, { logger, emit }) => {
    try {
        const validated = UploadLogsInputSchema.parse(req.body);

        logger.info('Raw logs received', {
            length: validated.logs.length,
            preview: validated.logs.substring(0, 100) + '...'
        });

        await emit({
            topic: 'logs.received',
            data: {
                rawLogs: validated.logs,
                receivedAt: new Date().toISOString(),
            },
        });

        return {
            status: 200,
            body: {
                success: true,
                message: 'Logs received successfully. Analysis in progress.',
                logsReceived: validated.logs.length,
            },
        };
    } catch (error) {
        logger.error('Error receiving logs', { error });
        return {
            status: 400,
            body: {
                success: false,
                error: error instanceof Error ? error.message : 'Invalid request',
            },
        };
    }
};
