import type { Middleware } from 'motia'
import { BaseError } from '../errors/base.error'

export const coreMiddleware: Middleware = async (ctx, next) => {
    try {
        await next()
    } catch (error) {
        if (error instanceof BaseError) {
            ctx.logger.error(error.message, error.metadata)
            throw error
        }

        ctx.logger.error('Unexpected error', {
            error: error instanceof Error ? error.message : String(error),
        })
        throw error
    }
}
