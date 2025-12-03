/**
 * Type definitions for X (Twitter) API v2
 */

export interface XAPITweetRequest {
    text: string;
}

export interface XAPITweetResponse {
    data: {
        id: string;
        text: string;
    };
}

export interface TweetResult {
    tweetId: string;
    tweetUrl: string;
    text: string;
    timestamp: string;
    isMock: boolean;
}
