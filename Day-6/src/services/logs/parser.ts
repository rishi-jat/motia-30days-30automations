/**
 * Log Parser Service
 * Extracts structured information from sanitized logs
 */

import { LogParseError } from '../../errors/log-analyzer.errors';

export interface StackFrame {
    method: string;
    file: string;
    line: number;
    column?: number;
}

export interface LogEntry {
    timestamp: string;
    level: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
    message: string;
    fullLine: string;
}

export interface ParsedLogs {
    errors: LogEntry[];
    warnings: LogEntry[];
    stackFrames: StackFrame[];
    filePaths: string[];
    repeatedPatterns: { pattern: string; count: number }[];
    rawLogs: string;
    summary: {
        totalLines: number;
        errorCount: number;
        warningCount: number;
        hasStackTrace: boolean;
    };
}

// Regex patterns for parsing
const PATTERNS = {
    // Match lines with ERROR level
    errorLine: /^(\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}(?:[.,]\d{3})?(?:Z|[+-]\d{2}:?\d{2})?\s*)?(?:\[?ERROR\]?|\bERROR\b)[\s:\]]*(.+)$/gmi,

    // Match lines with WARN level
    warnLine: /^(\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}(?:[.,]\d{3})?(?:Z|[+-]\d{2}:?\d{2})?\s*)?(?:\[?WARN(?:ING)?\]?|\bWARN(?:ING)?\b)[\s:\]]*(.+)$/gmi,

    // Match timestamp at start of line
    timestamp: /^(\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}(?:[.,]\d{3})?(?:Z|[+-]\d{2}:?\d{2})?)/,

    // Match stack trace frames: at Function (file:line:col) or at file:line:col
    stackFrame: /^\s*at\s+(?:(.+?)\s+\()?([^()]+):(\d+)(?::(\d+))?\)?$/,

    // Match file paths
    filePath: /(?:\/[\w.-]+)+\.[a-zA-Z]{1,4}(?::\d+(?::\d+)?)?/g,

    // Match request/trace IDs
    requestId: /(?:RequestID|TraceID|CorrelationID)[=:]\s*([a-zA-Z0-9-]+)/gi,
};

/**
 * Parse sanitized logs into structured data
 */
export function parseLogs(sanitizedLogs: string): ParsedLogs {
    try {
        if (!sanitizedLogs || typeof sanitizedLogs !== 'string') {
            throw new LogParseError('Invalid log input: expected non-empty string');
        }

        const lines = sanitizedLogs.split('\n');
        const errors: LogEntry[] = [];
        const warnings: LogEntry[] = [];
        const stackFrames: StackFrame[] = [];
        const filePathSet = new Set<string>();
        const patternCounts = new Map<string, number>();

        // Parse each line
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) continue;

            // Check for ERROR lines
            const errorMatch = trimmedLine.match(/^(\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}(?:[.,]\d{3})?(?:Z|[+-]\d{2}:?\d{2})?\s*)?(?:\[?ERROR\]?|\bERROR\b)[\s:\]]*(.+)$/i);
            if (errorMatch) {
                errors.push({
                    timestamp: errorMatch[1]?.trim() || '',
                    level: 'ERROR',
                    message: errorMatch[2]?.trim() || trimmedLine,
                    fullLine: trimmedLine,
                });
            }

            // Check for WARN lines
            const warnMatch = trimmedLine.match(/^(\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}(?:[.,]\d{3})?(?:Z|[+-]\d{2}:?\d{2})?\s*)?(?:\[?WARN(?:ING)?\]?|\bWARN(?:ING)?\b)[\s:\]]*(.+)$/i);
            if (warnMatch) {
                warnings.push({
                    timestamp: warnMatch[1]?.trim() || '',
                    level: 'WARN',
                    message: warnMatch[2]?.trim() || trimmedLine,
                    fullLine: trimmedLine,
                });
            }

            // Check for stack frames
            const stackMatch = trimmedLine.match(PATTERNS.stackFrame);
            if (stackMatch) {
                stackFrames.push({
                    method: stackMatch[1] || '<anonymous>',
                    file: stackMatch[2],
                    line: parseInt(stackMatch[3], 10),
                    column: stackMatch[4] ? parseInt(stackMatch[4], 10) : undefined,
                });
            }

            // Extract file paths
            const pathMatches = trimmedLine.match(PATTERNS.filePath);
            if (pathMatches) {
                pathMatches.forEach(p => filePathSet.add(p.split(':')[0]));
            }

            // Track repeated patterns (error messages)
            if (errorMatch || warnMatch) {
                const message = (errorMatch?.[2] || warnMatch?.[2] || '').trim();
                // Normalize message for pattern detection (remove IDs, timestamps)
                const normalizedPattern = message
                    .replace(/\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}.*/g, '<timestamp>')
                    .replace(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, '<uuid>')
                    .replace(/\b[a-f0-9]{24,}\b/gi, '<id>')
                    .substring(0, 100);

                patternCounts.set(normalizedPattern, (patternCounts.get(normalizedPattern) || 0) + 1);
            }
        }

        // Find repeated patterns (occurring more than once)
        const repeatedPatterns = Array.from(patternCounts.entries())
            .filter(([_, count]) => count > 1)
            .map(([pattern, count]) => ({ pattern, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        return {
            errors,
            warnings,
            stackFrames,
            filePaths: Array.from(filePathSet),
            repeatedPatterns,
            rawLogs: sanitizedLogs,
            summary: {
                totalLines: lines.length,
                errorCount: errors.length,
                warningCount: warnings.length,
                hasStackTrace: stackFrames.length > 0,
            },
        };
    } catch (error) {
        if (error instanceof LogParseError) {
            throw error;
        }
        throw new LogParseError(
            `Failed to parse logs: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
}

/**
 * Get the primary error from parsed logs
 */
export function getPrimaryError(parsed: ParsedLogs): LogEntry | null {
    return parsed.errors[0] || null;
}

/**
 * Get the most relevant stack frame (first one, usually the culprit)
 */
export function getPrimaryStackFrame(parsed: ParsedLogs): StackFrame | null {
    return parsed.stackFrames[0] || null;
}
