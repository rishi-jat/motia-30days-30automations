/**
 * Step 3: Select Best Tweet
 * Selects the best tweet variation based on criteria
 */

import { EventConfig, Handlers } from 'motia';
import { z } from 'zod';
import { selectBestTweet, TweetVariationSchema } from '../../src/services/ai/generate-tweet';
import { TweetValidationError } from '../../src/errors/tweet-errors';

const SelectBestInputSchema = z.object({
    original: z.string(),
    variations: z.array(TweetVariationSchema),
    cached: z.boolean().optional(),
});

export const config: EventConfig = {
    type: 'event',
    name: 'SelectBestTweet',
    description: 'Select the best tweet from generated variations',
    flows: ['ai-x-auto-posting'],
    subscribes: ['tweet.variations.generated'],
    emits: ['tweet.best.selected'],
    input: SelectBestInputSchema,
};

export const handler: Handlers['SelectBestTweet'] = async (input, { logger, emit }) => {
    try {
        logger.info('Selecting best tweet', { variationsCount: input.variations.length });

        const bestTweet = selectBestTweet(input.variations);

        logger.info('Selected best tweet', {
            text: bestTweet.text,
            length: bestTweet.length
        });

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
