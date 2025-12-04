/**
 * Custom error classes for Day-6 Log Analyzer workflow
 */

import { BaseError } from './base.error';

export class LogAnalyzerError extends Error {
    constructor(message: string, public readonly code: string) {
        super(message);
        this.name = 'LogAnalyzerError';
    }
}

export class LogSanitizationError extends LogAnalyzerError {
    constructor(message: string) {
        super(message, 'LOG_SANITIZATION_ERROR');
        this.name = 'LogSanitizationError';
    }
}

export class LogParseError extends LogAnalyzerError {
    constructor(message: string) {
        super(message, 'LOG_PARSE_ERROR');
        this.name = 'LogParseError';
    }
}

export class LLMAnalysisError extends LogAnalyzerError {
    constructor(message: string, public readonly statusCode?: number) {
        super(message, 'LLM_ANALYSIS_ERROR');
        this.name = 'LLMAnalysisError';
    }
}

export class FileWriteError extends LogAnalyzerError {
    constructor(message: string) {
        super(message, 'FILE_WRITE_ERROR');
        this.name = 'FileWriteError';
    }
}

export class ValidationError extends LogAnalyzerError {
    constructor(message: string) {
        super(message, 'VALIDATION_ERROR');
        this.name = 'ValidationError';
    }
}
