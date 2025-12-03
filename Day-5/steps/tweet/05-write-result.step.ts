/**
 * Step 5: Write Result File
 * Writes TWEET_RESULT.md with all tweet data
 */

import { EventConfig, Handlers } from 'motia';
import { z } from 'zod';
import { writeTweetResult } from '../../src/services/file/write-result';
import { TweetVariationSchema } from '../../src/services/ai/generate-tweet';
import { FileWriteError } from '../../src/errors/tweet-errors';

const WriteResultInputSchema = z.object({
    original: z.string(),
    allVariations: z.array(TweetVariationSchema),
    selectedTweet: TweetVariationSchema,
    postResult: z.object({
        tweetId: z.string(),
        tweetUrl: z.string(),
        text: z.string(),
        timestamp: z.string(),
        isMock: z.boolean(),
    }),
});

export const config: EventConfig = {
    type: 'event',
    name: 'WriteTweetResult',
    description: 'Write TWEET_RESULT.md file with all data',
    flows: ['ai-x-auto-posting'],
    subscribes: ['tweet.posted.success'],
    emits: [],
    input: WriteResultInputSchema,
};

export const handler: Handlers['WriteTweetResult'] = async (input, { logger }) => {
    try {
        logger.info('Writing tweet result to file');

        const outputPath = process.env.OUTPUT_PATH || './TWEET_RESULT.md';

        await writeTweetResult({
            originalIdea: input.original,
            variations: input.allVariations,
            selectedTweet: input.selectedTweet,
            postResult: input.postResult,
        });

        logger.info('✅ Result written successfully', { filePath: outputPath });
    } catch (error) {
        if (error instanceof FileWriteError) {
            logger.error('File write failed', { error: error.message });
            throw error;
        }
        logger.error('Unexpected error in write-result', { error });
        throw new FileWriteError(
            `Failed to write result: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
};
