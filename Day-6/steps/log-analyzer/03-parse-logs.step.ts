/**
 * Step 3: Parse Logs
 * Extract ERROR lines, WARN lines, stack frames, and file paths
 */

import { EventConfig, Handlers } from 'motia';
import { z } from 'zod';
import { parseLogs } from '../../src/services/logs/parser';
import { LogParseError } from '../../src/errors/log-analyzer.errors';

const ParseLogsInputSchema = z.object({
    sanitizedLogs: z.string(),
    originalLength: z.number(),
    wasTruncated: z.boolean(),
    ansiCodesRemoved: z.number(),
    receivedAt: z.string(),
});

export const config: EventConfig = {
    type: 'event',
    name: 'ParseLogs',
    description: 'Extract errors, warnings, stack frames from sanitized logs',
    flows: ['ai-log-analyzer'],
    subscribes: ['logs.sanitized'],
    emits: ['logs.parsed'],
    input: ParseLogsInputSchema,
};

export const handler: Handlers['ParseLogs'] = async (input, { logger, emit }) => {
    try {
        logger.info('Parsing sanitized logs', {
            length: input.sanitizedLogs.length
        });

        const parsed = parseLogs(input.sanitizedLogs);

        logger.info('Logs parsed successfully', {
            errorCount: parsed.summary.errorCount,
            warningCount: parsed.summary.warningCount,
            stackFrameCount: parsed.stackFrames.length,
            filePathCount: parsed.filePaths.length,
            repeatedPatterns: parsed.repeatedPatterns.length,
        });

        await emit({
            topic: 'logs.parsed',
            data: {
                parsed,
                metadata: {
                    originalLength: input.originalLength,
                    wasTruncated: input.wasTruncated,
                    ansiCodesRemoved: input.ansiCodesRemoved,
                    receivedAt: input.receivedAt,
                },
            },
        });
    } catch (error) {
        if (error instanceof LogParseError) {
            logger.error('Log parsing failed', { error: error.message });
            throw error;
        }
        logger.error('Unexpected error in parse-logs', { error });
        throw new LogParseError(
            `Failed to parse logs: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
};
