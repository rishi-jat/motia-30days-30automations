import { BaseError } from './base.error'

export class NotFoundError extends BaseError {
    constructor(message: string, metadata?: Record<string, unknown>) {
        super(message, metadata)
    }
}
