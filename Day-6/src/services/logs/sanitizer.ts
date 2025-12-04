/**
 * Log Sanitizer Service
 * Cleans raw logs by removing ANSI codes and normalizing
 */

import { LogSanitizationError } from '../../errors/log-analyzer.errors';

// ANSI escape code regex pattern
const ANSI_REGEX = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;

// Max log size (20KB)
const MAX_LOG_SIZE = 20000;

export interface SanitizeResult {
    sanitizedLogs: string;
    originalLength: number;
    wasTruncated: boolean;
    ansiCodesRemoved: number;
}

/**
 * Sanitize raw logs by removing ANSI codes and trimming size
 */
export function sanitizeLogs(rawLogs: string): SanitizeResult {
    try {
        if (!rawLogs || typeof rawLogs !== 'string') {
            throw new LogSanitizationError('Invalid log input: expected non-empty string');
        }

        const originalLength = rawLogs.length;

        // Count ANSI codes before removal
        const ansiMatches = rawLogs.match(ANSI_REGEX) || [];
        const ansiCodesRemoved = ansiMatches.length;

        // Remove ANSI escape codes
        let sanitized = rawLogs.replace(ANSI_REGEX, '');

        // Normalize line endings (CRLF -> LF)
        sanitized = sanitized.replace(/\r\n/g, '\n');

        // Remove null bytes and other control characters (except newlines/tabs)
        sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');

        // Trim excessive whitespace
        sanitized = sanitized
            .split('\n')
            .map(line => line.trimEnd())
            .join('\n');

        // Check if truncation is needed
        const wasTruncated = sanitized.length > MAX_LOG_SIZE;

        if (wasTruncated) {
            // Truncate at a line boundary if possible
            let truncated = sanitized.substring(0, MAX_LOG_SIZE);
            const lastNewline = truncated.lastIndexOf('\n');

            if (lastNewline > MAX_LOG_SIZE * 0.8) {
                truncated = truncated.substring(0, lastNewline);
            }

            sanitized = truncated + '\n\n[... TRUNCATED - Logs exceeded 20KB limit ...]';
        }

        return {
            sanitizedLogs: sanitized.trim(),
            originalLength,
            wasTruncated,
            ansiCodesRemoved,
        };
    } catch (error) {
        if (error instanceof LogSanitizationError) {
            throw error;
        }
        throw new LogSanitizationError(
            `Failed to sanitize logs: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
}
