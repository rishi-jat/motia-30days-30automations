/**
 * Step 5: Fallback Basic Report
 * Generates a lightweight incident report when LLM fails
 */

import { EventConfig, Handlers } from 'motia';
import { z } from 'zod';
import type { ParsedLogs } from '../../src/services/logs/parser';
import type { IncidentReport } from '../../src/services/llm/analyzer';

// Schema for parsed logs structure (same as step 4)
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

const FallbackInputSchema = z.object({
    reason: z.string(),
    message: z.string(),
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
    name: 'FallbackBasicReport',
    description: 'Generate basic incident report when LLM is unavailable',
    flows: ['ai-log-analyzer'],
    subscribes: ['logs.analysis_failed'],
    emits: ['report.ready'],
    input: FallbackInputSchema,
};

/**
 * Determine severity based on error patterns
 */
function determineSeverity(parsed: ParsedLogs): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const { summary, errors } = parsed;

    // Critical: Multiple errors or critical keywords
    const criticalKeywords = ['fatal', 'crash', 'unhandled', 'panic', 'oom', 'out of memory'];
    const hasCritical = errors.some(e =>
        criticalKeywords.some(k => e.message.toLowerCase().includes(k))
    );
    if (hasCritical) return 'CRITICAL';

    // High: Stack trace present with multiple errors
    if (summary.hasStackTrace && summary.errorCount > 2) return 'HIGH';

    // Medium: Has errors or stack trace
    if (summary.errorCount > 0 || summary.hasStackTrace) return 'MEDIUM';

    // Low: Warnings only
    return 'LOW';
}

/**
 * Generate basic incident report from parsed data
 */
function generateBasicReport(parsed: ParsedLogs): IncidentReport {
    const primaryError = parsed.errors[0];
    const primaryStackFrame = parsed.stackFrames[0];

    const title = primaryError
        ? `Error: ${primaryError.message.substring(0, 60)}...`
        : 'Log Analysis Report - No Specific Error Found';

    const summary = primaryError
        ? `${parsed.summary.errorCount} error(s) detected. Primary error: "${primaryError.message}"`
        : `Analyzed ${parsed.summary.totalLines} log lines with ${parsed.summary.warningCount} warning(s).`;

    const rootCause = primaryError
        ? `Based on error message: "${primaryError.message}". ${primaryStackFrame
            ? `Error originated in ${primaryStackFrame.file} at line ${primaryStackFrame.line}.`
            : 'No stack trace available for detailed analysis.'
        }`
        : 'Unable to determine root cause - no error messages found.';

    const stackFrameResponsible = primaryStackFrame
        ? `${primaryStackFrame.method} (${primaryStackFrame.file}:${primaryStackFrame.line})`
        : 'No stack frame available';

    const affectedComponents = parsed.filePaths.slice(0, 5);

    return {
        title,
        summary,
        severity: determineSeverity(parsed),
        rootCause,
        stackFrameResponsible,
        impact: `Potential impact on ${parsed.filePaths.length} component(s). Requires investigation.`,
        fixPlan: primaryStackFrame
            ? `1. Review ${primaryStackFrame.file} at line ${primaryStackFrame.line}\n2. Check for null/undefined values\n3. Add error handling if missing\n4. Test with similar input scenarios`
            : '1. Review the error messages\n2. Check recent code changes\n3. Add logging if needed\n4. Monitor for recurrence',
        preventionPlan: '1. Add comprehensive error handling\n2. Implement input validation\n3. Add monitoring alerts\n4. Write unit tests for edge cases',
        affectedComponents,
        timestamp: new Date().toISOString(),
        generatedBy: 'llm', // Using 'llm' as literal type requires this even for fallback
    };
}

export const handler: Handlers['FallbackBasicReport'] = async (input, { logger, emit }) => {
    logger.info('Generating fallback basic report', {
        reason: input.reason,
        errorCount: input.parsed.summary.errorCount,
    });

    const report = generateBasicReport(input.parsed as ParsedLogs);

    logger.info('Fallback report generated', {
        title: report.title,
        severity: report.severity,
    });

    await emit({
        topic: 'report.ready',
        data: {
            report,
            parsed: input.parsed,
            metadata: input.metadata,
            isFallback: true,
        },
    });
};
