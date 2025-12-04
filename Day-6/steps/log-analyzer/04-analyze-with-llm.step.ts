/**
 * Step 4: Analyze with LLM
 * Call OpenAI GPT-4 to analyze parsed logs and generate incident report
 */

import { EventConfig, Handlers } from 'motia';
import { z } from 'zod';
import { analyzeWithLLM, isMockMode } from '../../src/services/llm/analyzer';
import { LLMAnalysisError } from '../../src/errors/log-analyzer.errors';
import type { ParsedLogs } from '../../src/services/logs/parser';

// Schema for parsed logs structure
const StackFrameSchema = z.object({
    method: z.string(),
    file: z.string(),
    line: z.number(),
    column: z.number().optional(),
});

const LogEntrySchema = z.object({
    timestamp: z.string(),
    level: z.enum(['ERROR', 'WARN', 'INFO', 'DEBUG']),
    message: z.string(),
    fullLine: z.string(),
});

const ParsedLogsSchema = z.object({
    errors: z.array(LogEntrySchema),
    warnings: z.array(LogEntrySchema),
    stackFrames: z.array(StackFrameSchema),
    filePaths: z.array(z.string()),
    repeatedPatterns: z.array(z.object({
        pattern: z.string(),
        count: z.number(),
    })),
    rawLogs: z.string(),
    summary: z.object({
        totalLines: z.number(),
        errorCount: z.number(),
        warningCount: z.number(),
        hasStackTrace: z.boolean(),
    }),
});

const AnalyzeInputSchema = z.object({
    parsed: ParsedLogsSchema,
    metadata: z.object({
        originalLength: z.number(),
        wasTruncated: z.boolean(),
        ansiCodesRemoved: z.number(),
        receivedAt: z.string(),
    }),
});

export const config: EventConfig = {
    type: 'event',
    name: 'AnalyzeWithLLM',
    description: 'Analyze parsed logs with OpenAI GPT-4',
    flows: ['ai-log-analyzer'],
    subscribes: ['logs.parsed'],
    emits: ['logs.analyzed', 'logs.analysis_failed'],
    input: AnalyzeInputSchema,
};

export const handler: Handlers['AnalyzeWithLLM'] = async (input, { logger, emit }) => {
    const { parsed, metadata } = input;

    // Check if mock mode is enabled
    if (isMockMode()) {
        logger.info('Mock mode enabled - skipping LLM analysis');

        await emit({
            topic: 'logs.analysis_failed',
            data: {
                reason: 'MOCK_MODE',
                message: 'LLM analysis skipped (MOCK_LLM=true)',
                parsed,
                metadata,
            },
        });
        return;
    }

    try {
        logger.info('Analyzing logs with LLM', {
            errorCount: parsed.summary.errorCount,
            warningCount: parsed.summary.warningCount,
        });

        const report = await analyzeWithLLM(parsed as ParsedLogs);

        logger.info('LLM analysis completed successfully', {
            title: report.title,
            severity: report.severity,
        });

        await emit({
            topic: 'logs.analyzed',
            data: {
                report,
                parsed,
                metadata,
            },
        });
    } catch (error) {
        logger.error('LLM analysis failed', {
            error: error instanceof Error ? error.message : 'Unknown error'
        });

        // Emit failure event to trigger fallback
        await emit({
            topic: 'logs.analysis_failed',
            data: {
                reason: error instanceof LLMAnalysisError ? error.code : 'UNKNOWN_ERROR',
                message: error instanceof Error ? error.message : 'Unknown error',
                parsed,
                metadata,
            },
        });
    }
};
