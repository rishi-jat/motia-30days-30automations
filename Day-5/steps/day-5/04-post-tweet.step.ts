/**
 * Step 4: Post Tweet to X
 * Posts the selected tweet to X (Twitter) with mock mode support
 */

import { EventConfig, Handlers } from 'motia';
import { z } from 'zod';
import { postTweet } from '../../src/services/xapi/post-tweet.js';
import { TweetVariationSchema } from '../../src/services/ai/generate-tweet.js';
import { XAPIError } from '../../src/errors/tweet-errors.js';

// Input schema
const PostTweetInputSchema = z.object({
    original: z.string(),
    allVariations: z.array(TweetVariationSchema),
    selectedTweet: TweetVariationSchema,
});

export const config: EventConfig = {
    type: 'event',
    name: 'PostTweetToX',
    description: 'Post the selected tweet to X (Twitter)',
    flows: ['day-5-ai-x-auto-posting'],
    subscribes: ['tweet.best.selected'],
    emits: ['tweet.posted.success'],
    input: PostTweetInputSchema,
};

export const handler: Handlers['PostTweetToX'] = async (input, { logger, emit }) => {
    try {
        logger.info('Posting tweet to X', { text: input.selectedTweet.text });

        const mockMode = process.env.MOCK_X === 'true';
        if (mockMode) {
            logger.info('🧪 MOCK MODE: Not posting to real X API');
        }

        // Post the tweet
        const result = await postTweet(input.selectedTweet.text);

        logger.info('Tweet posted successfully', {
            tweetId: result.tweetId,
            tweetUrl: result.tweetUrl,
            isMock: result.isMock,
        });

        // Emit success event
        await emit({
            topic: 'tweet.posted.success',
            data: {
                original: input.original,
                allVariations: input.allVariations,
                selectedTweet: input.selectedTweet,
                postResult: result,
            },
        });
    } catch (error) {
        if (error instanceof XAPIError) {
            logger.error('X API error', { error: error.message });
            throw error;
        }
        logger.error(' Unexpected error in post-tweet', { error });
        throw new XAPIError(
            `Failed to post tweet: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
};
