export class BaseError extends Error {
    public readonly metadata?: Record<string, unknown>

    constructor(message: string, metadata?: Record<string, unknown>) {
        super(message)
        this.name = this.constructor.name
        this.metadata = metadata
        Error.captureStackTrace(this, this.constructor)
    }
}
