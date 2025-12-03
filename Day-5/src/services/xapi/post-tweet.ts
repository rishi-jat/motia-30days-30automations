/**
 * X (Twitter) API Service
 * Posts tweets using X API v2 with OAuth 1.0a authentication
 */

import { z } from 'zod';
import OAuth from 'oauth-1.0a';
import crypto from 'crypto';
import { XAPIError } from '../../errors/tweet-errors';
import type { XAPITweetRequest, XAPITweetResponse, TweetResult } from './types';

// Validation schema
const TweetTextSchema = z.string().min(1).max(280);

/**
 * Post a tweet to X (Twitter) using API v2 with OAuth 1.0a
 * Supports mock mode for testing without posting
 */
export async function postTweet(text: string): Promise<TweetResult> {
    try {
        // Validate tweet text
        const validatedText = TweetTextSchema.parse(text);

        // Check if mock mode is enabled
        const mockMode = process.env.MOCK_X === 'true';

        if (mockMode) {
            // Return mock response
            return {
                tweetId: `mock-${Date.now()}`,
                tweetUrl: `https://x.com/mock-user/status/mock-${Date.now()}`,
                text: validatedText,
                timestamp: new Date().toISOString(),
                isMock: true,
            };
        }

        // Real X API posting with OAuth 1.0a
        const apiKey = process.env.X_API_KEY;
        const apiSecret = process.env.X_API_SECRET;
        const accessToken = process.env.X_ACCESS_TOKEN;
        const accessTokenSecret = process.env.X_ACCESS_TOKEN_SECRET;

        if (!apiKey || !apiSecret || !accessToken || !accessTokenSecret) {
            throw new XAPIError('X OAuth credentials not configured. Need X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET');
        }

        // Initialize OAuth 1.0a
        const oauth = new OAuth({
            consumer: { key: apiKey, secret: apiSecret },
            signature_method: 'HMAC-SHA1',
            hash_function(base_string, key) {
                return crypto
                    .createHmac('sha1', key)
                    .update(base_string)
                    .digest('base64');
            },
        });

        const requestData = {
            url: 'https://api.twitter.com/2/tweets',
            method: 'POST',
        };

        const requestBody: XAPITweetRequest = {
            text: validatedText,
        };

        const authHeader = oauth.toHeader(
            oauth.authorize(requestData, {
                key: accessToken,
                secret: accessTokenSecret,
            })
        );

        const response = await fetch('https://api.twitter.com/2/tweets', {
            method: 'POST',
            headers: {
                ...authHeader,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new XAPIError(
                `X API request failed: ${response.statusText} - ${errorText}`,
                response.status
            );
        }

        const data = (await response.json()) as XAPITweetResponse;

        if (!data.data?.id) {
            throw new XAPIError('Invalid response from X API: missing tweet ID');
        }

        const tweetUrl = `https://x.com/i/status/${data.data.id}`;

        return {
            tweetId: data.data.id,
            tweetUrl,
            text: data.data.text,
            timestamp: new Date().toISOString(),
            isMock: false,
        };
    } catch (error) {
        if (error instanceof XAPIError) {
            throw error;
        }
        throw new XAPIError(
            `Failed to post tweet: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
}
