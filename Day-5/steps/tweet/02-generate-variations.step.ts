/**
 * Step 2: Generate Tweet Variations
 * Uses AI to generate 3 tweet variations from the idea
 */

import { EventConfig, Handlers } from 'motia';
import { z } from 'zod';
import { generateTweetVariations } from '../../src/services/ai/generate-tweet';
import { AIGenerationError } from '../../src/errors/tweet-errors';

const GenerateVariationsInputSchema = z.object({
    idea: z.string(),
    receivedAt: z.string(),
});

export const config: EventConfig = {
    type: 'event',
    name: 'GenerateTweetVariations',
    description: 'Generate 3 optimized tweet variations using AI',
    flows: ['ai-x-auto-posting'],
    subscribes: ['tweet.idea.received'],
    emits: ['tweet.variations.generated'],
    input: GenerateVariationsInputSchema,
};

export const handler: Handlers['GenerateTweetVariations'] = async (input, { logger, emit, state }) => {
    try {
        logger.info('Generating tweet variations', { idea: input.idea });

        // Check state first (acts as cache)
        const cached = await state.get<string>('tweet-variations', input.idea);

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

        // Store in state
        await state.set('tweet-variations', input.idea, JSON.stringify(result));

        logger.info('Tweet variations generated', { count: result.variations.length });

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
