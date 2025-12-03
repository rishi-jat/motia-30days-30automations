/**
 * Step 1: Receive Tweet Idea (API Endpoint)
 * POST /tweet - Receives a tweet idea and emits event
 */

import { ApiRouteConfig, Handlers } from 'motia';
import { z } from 'zod';

// Input validation schema
const TweetIdeaInputSchema = z.object({
    idea: z.string().min(1, 'Tweet idea is required').max(500, 'Idea too long'),
});

export const config: ApiRouteConfig = {
    type: 'api',
    name: 'ReceiveTweetIdea',
    description: 'POST /tweet - Receives a tweet idea and starts the workflow',
    flows: ['ai-x-auto-posting'],
    method: 'POST',
    path: '/tweet',
    bodySchema: TweetIdeaInputSchema,
    responseSchema: {
        200: z.object({
            success: z.boolean(),
            message: z.string(),
            idea: z.string(),
        }),
        400: z.object({
            success: z.boolean(),
            error: z.string(),
        }),
    },
    emits: ['tweet.idea.received'],
};

export const handler: Handlers['ReceiveTweetIdea'] = async (req, { logger, emit }) => {
    try {
        const validated = TweetIdeaInputSchema.parse(req.body);

        logger.info('Tweet idea received', { idea: validated.idea });

        await emit({
            topic: 'tweet.idea.received',
            data: {
                idea: validated.idea,
                receivedAt: new Date().toISOString(),
            },
        });

        return {
            status: 200,
            body: {
                success: true,
                message: 'Tweet idea received successfully',
                idea: validated.idea,
            },
        };
    } catch (error) {
        logger.error('Error receiving tweet idea', { error });
        return {
            status: 400,
            body: {
                success: false,
                error: error instanceof Error ? error.message : 'Invalid request',
            },
        };
    }
};
