/**
 * X (Twitter) API Service
 * Posts tweets using X API v2 with mock mode support
 */

import { z } from 'zod';
import { XAPIError } from '../../errors/tweet-errors.js';
import type { XAPITweetRequest, XAPITweetResponse, TweetResult } from './types.js';

// Validation schema
const TweetTextSchema = z.string().min(1).max(280);

/**
 * Post a tweet to X (Twitter) using API v2
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

        // Real X API posting
        const bearerToken = process.env.X_BEARER_TOKEN;
        if (!bearerToken) {
            throw new XAPIError('X_BEARER_TOKEN not configured');
        }

        const requestBody: XAPITweetRequest = {
            text: validatedText,
        };

        const response = await fetch('https://api.twitter.com/2/tweets', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${bearerToken}`,
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

        // Construct tweet URL (assuming we know the username or use a placeholder)
        // In production, you might want to fetch the user's username first
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

/**
 * Get authenticated user info (optional, for getting username)
 */
export async function getAuthenticatedUser(): Promise<{ id: string; username: string } | null> {
    try {
        const bearerToken = process.env.X_BEARER_TOKEN;
        if (!bearerToken) {
            return null;
        }

        const response = await fetch('https://api.twitter.com/2/users/me', {
            headers: {
                'Authorization': `Bearer ${bearerToken}`,
            },
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        return data.data || null;
    } catch {
        return null;
    }
}
