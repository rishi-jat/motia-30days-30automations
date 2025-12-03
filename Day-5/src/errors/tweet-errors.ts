/**
 * Custom error classes for Day-5 Tweet workflow
 */

export class TweetError extends Error {
    constructor(message: string, public readonly code: string) {
        super(message);
        this.name = 'TweetError';
    }
}

export class AIGenerationError extends TweetError {
    constructor(message: string) {
        super(message, 'AI_GENERATION_ERROR');
        this.name = 'AIGenerationError';
    }
}

export class XAPIError extends TweetError {
    constructor(message: string, public readonly statusCode?: number) {
        super(message, 'X_API_ERROR');
        this.name = 'XAPIError';
    }
}

export class TweetValidationError extends TweetError {
    constructor(message: string) {
        super(message, 'TWEET_VALIDATION_ERROR');
        this.name = 'TweetValidationError';
    }
}

export class FileWriteError extends TweetError {
    constructor(message: string) {
        super(message, 'FILE_WRITE_ERROR');
        this.name = 'FileWriteError';
    }
}
