/**
 * Step 2: Generate Tweet Variations
 * Uses AI to generate 3 tweet variations from the idea
 */

import { EventConfig, Handlers } from 'motia';
import { z } from 'zod';
import { generateTweetVariations } from '../../src/services/ai/generate-tweet.js';
import { AIGenerationError } from '../../src/errors/tweet-errors.js';

// Input schema
const GenerateVariationsInputSchema = z.object({
    idea: z.string(),
    receivedAt: z.string(),
});

export const config: EventConfig = {
    type: 'event',
    name: 'GenerateTweetVariations',
    description: 'Generate 3 optimized tweet variations using AI',
    flows: ['day-5-ai-x-auto-posting'],
    subscribes: ['tweet.idea.received'],
    emits: ['tweet.variations.generated'],
    input: GenerateVariationsInputSchema,
};

export const handler: Handlers['GenerateTweetVariations'] = async (input, { logger, emit, cache }) => {
    try {
        logger.info('Generating tweet variations', { idea: input.idea });

        // Check cache first (cache for 1 hour based on idea)
        const cacheKey = `tweet-variations:${input.idea}`;
        const cached = await cache.get(cacheKey);

        if (cached) {
            logger.info('Using cached tweet variations');
            const variations = JSON.parse(cached);

            await emit({
                topic: 'tweet.variations.generated',
                data: {
                    original: input.idea,
                    variations: variations.variations,
                    cached: true,
                },
            });

            return;
        }

        // Generate new variations
        const result = await generateTweetVariations(input.idea);

        // Cache the result
        await cache.set(cacheKey, JSON.stringify(result), 3600); // 1 hour TTL

        logger.info('Tweet variations generated', { count: result.variations.length });

        // Emit event with variations
        await emit({
            topic: 'tweet.variations.generated',
            data: {
                original: result.original,
                variations: result.variations,
                cached: false,
            },
        });
    } catch (error) {
        if (error instanceof AIGenerationError) {
            logger.error('AI generation failed', { error: error.message });
            throw error;
        }
        logger.error('Unexpected error in generate-variations', { error });
        throw new AIGenerationError(
            `Failed to generate variations: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
};
