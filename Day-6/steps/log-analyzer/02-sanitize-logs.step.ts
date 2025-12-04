/**
 * Step 2: Sanitize Logs
 * Removes ANSI codes and trims logs to max 20KB
 */

import { EventConfig, Handlers } from 'motia';
import { z } from 'zod';
import { sanitizeLogs } from '../../src/services/logs/sanitizer';
import { LogSanitizationError } from '../../src/errors/log-analyzer.errors';

const SanitizeLogsInputSchema = z.object({
    rawLogs: z.string(),
    receivedAt: z.string(),
});

export const config: EventConfig = {
    type: 'event',
    name: 'SanitizeLogs',
    description: 'Remove ANSI codes and normalize logs',
    flows: ['ai-log-analyzer'],
    subscribes: ['logs.received'],
    emits: ['logs.sanitized'],
    input: SanitizeLogsInputSchema,
};

export const handler: Handlers['SanitizeLogs'] = async (input, { logger, emit }) => {
    try {
        logger.info('Sanitizing logs', {
            inputLength: input.rawLogs.length
        });

        const result = sanitizeLogs(input.rawLogs);

        logger.info('Logs sanitized successfully', {
            originalLength: result.originalLength,
            sanitizedLength: result.sanitizedLogs.length,
            wasTruncated: result.wasTruncated,
            ansiCodesRemoved: result.ansiCodesRemoved,
        });

        await emit({
            topic: 'logs.sanitized',
            data: {
                sanitizedLogs: result.sanitizedLogs,
                originalLength: result.originalLength,
                wasTruncated: result.wasTruncated,
                ansiCodesRemoved: result.ansiCodesRemoved,
                receivedAt: input.receivedAt,
            },
        });
    } catch (error) {
        if (error instanceof LogSanitizationError) {
            logger.error('Log sanitization failed', { error: error.message });
            throw error;
        }
        logger.error('Unexpected error in sanitize-logs', { error });
        throw new LogSanitizationError(
            `Failed to sanitize logs: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
};
