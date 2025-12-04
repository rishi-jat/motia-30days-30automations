/**
 * Step 6: Write Report
 * Writes final INCIDENT_REPORT.md file
 * Subscribes to both logs.analyzed (LLM success) and report.ready (fallback)
 */

import { EventConfig, Handlers } from 'motia';
import { z } from 'zod';
import { writeIncidentReport } from '../../src/services/filesystem/write-report';
import { FileWriteError } from '../../src/errors/log-analyzer.errors';
import type { ParsedLogs } from '../../src/services/logs/parser';
import type { IncidentReport } from '../../src/services/llm/analyzer';

// Schema for incident report
const IncidentReportSchema = z.object({
    title: z.string(),
    summary: z.string(),
    severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    rootCause: z.string(),
    stackFrameResponsible: z.string(),
    impact: z.string(),
    fixPlan: z.string(),
    preventionPlan: z.string(),
    affectedComponents: z.array(z.string()),
    timestamp: z.string(),
    generatedBy: z.string(),
});

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

const WriteReportInputSchema = z.object({
    report: IncidentReportSchema,
    parsed: ParsedLogsSchema,
    metadata: z.object({
        originalLength: z.number(),
        wasTruncated: z.boolean(),
        ansiCodesRemoved: z.number(),
        receivedAt: z.string(),
    }),
    isFallback: z.boolean().optional(),
});

export const config: EventConfig = {
    type: 'event',
    name: 'WriteReport',
    description: 'Write final INCIDENT_REPORT.md file',
    flows: ['ai-log-analyzer'],
    subscribes: ['logs.analyzed', 'report.ready'],
    emits: [], // Terminal step
    input: WriteReportInputSchema,
};

export const handler: Handlers['WriteReport'] = async (input, { logger }) => {
    try {
        const { report, parsed, isFallback } = input;

        logger.info('Writing incident report', {
            title: report.title,
            severity: report.severity,
            isFallback: isFallback || false,
        });

        const outputPath = await writeIncidentReport({
            report: report as IncidentReport,
            parsed: parsed as ParsedLogs,
            isFallback: isFallback || false,
        });

        logger.info('✅ Incident report written successfully', {
            filePath: outputPath,
            isFallback: isFallback || false,
        });
    } catch (error) {
        if (error instanceof FileWriteError) {
            logger.error('Failed to write incident report', { error: error.message });
            throw error;
        }
        logger.error('Unexpected error in write-report', { error });
        throw new FileWriteError(
            `Failed to write report: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
};
