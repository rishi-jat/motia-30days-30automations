import { BaseError } from './base.error'

export class ExternalServiceError extends BaseError {
    constructor(message: string = 'External Service Error', metadata: Record<string, any> = {}) {
        super(message, 502, 'EXTERNAL_SERVICE_ERROR', metadata)
    }
}
