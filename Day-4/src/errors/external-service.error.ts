import { BaseError } from './base.error'

export class ExternalServiceError extends BaseError {
    constructor(message: string, metadata: Record<string, unknown> = {}) {
        super(message, 502, 'EXTERNAL_SERVICE_ERROR', metadata)
    }
}
