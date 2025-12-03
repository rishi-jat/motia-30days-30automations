/**
 * Step 3: Select Best Tweet
 * Selects the best tweet variation based on criteria
 */

import { EventConfig, Handlers } from 'motia';
import { z } from 'zod';
import { selectBestTweet, TweetVariationSchema } from '../../src/services/ai/generate-tweet.js';
import { TweetValidationError } from '../../src/errors/tweet-errors.js';

// Input schema
const SelectBestInputSchema = z.object({
    original: z.string(),
    variations: z.array(TweetVariationSchema),
    cached: z.boolean().optional(),
});

export const config: EventConfig = {
    type: 'event',
    name: 'SelectBestTweet',
    description: 'Select the best tweet from generated variations',
    flows: ['day-5-ai-x-auto-posting'],
    subscribes: ['tweet.variations.generated'],
    emits: ['tweet.best.selected'],
    input: SelectBestInputSchema,
};

export const handler: Handlers['SelectBestTweet'] = async (input, { logger, emit }) => {
    try {
        logger.info('Selecting best tweet', { variationsCount: input.variations.length });

        // Select best tweet using our algorithm
        const bestTweet = selectBestTweet(input.variations);

        logger.info('Selected best tweet', {
            text: bestTweet.text,
            length: bestTweet.length
        });

        // Emit event with selected tweet
        await emit({
            topic: 'tweet.best.selected',
            data: {
                original: input.original,
                allVariations: input.variations,
                selectedTweet: bestTweet,
            },
        });
    } catch (error) {
        if (error instanceof TweetValidationError) {
            logger.error('Tweet validation failed', { error: error.message });
            throw error;
        }
        logger.error('Unexpected error in select-best', { error });
        throw new TweetValidationError(
            `Failed to select best tweet: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
};
