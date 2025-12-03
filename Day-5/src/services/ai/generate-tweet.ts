/**
 * AI Tweet Generation Service
 * Generates 3 optimized tweet variations using OpenAI
 */

import OpenAI from 'openai';
import { z } from 'zod';
import { AIGenerationError, TweetValidationError } from '../../errors/tweet-errors';

// Validation schemas
export const TweetIdeaSchema = z.object({
    idea: z.string().min(1, 'Tweet idea cannot be empty').max(500, 'Idea too long'),
});

export const TweetVariationSchema = z.object({
    text: z.string().max(280, 'Tweet exceeds 280 characters'),
    length: z.number(),
    hasHashtags: z.boolean(),
});

export const TweetVariationsSchema = z.object({
    variations: z.array(TweetVariationSchema).length(3, 'Must generate exactly 3 variations'),
    original: z.string(),
});

export type TweetIdea = z.infer<typeof TweetIdeaSchema>;
export type TweetVariation = z.infer<typeof TweetVariationSchema>;
export type TweetVariations = z.infer<typeof TweetVariationsSchema>;

/**
 * Generate mock tweet variations (fallback for quota/errors)
 */
function generateMockVariations(idea: string): TweetVariations {
    const mockTemplates = [
        `${idea} #tech #automation`,
        `Just thinking about this: ${idea}`,
        `${idea} 🚀`,
    ];

    const variations: TweetVariation[] = mockTemplates.map((text) => ({
        text: text.substring(0, 280), // Ensure max 280 chars
        length: text.substring(0, 280).length,
        hasHashtags: text.includes('#'),
    }));

    return {
        variations,
        original: idea,
    };
}

/**
 * Generate 3 tweet variations from an idea
 * Falls back to mock data when OpenAI quota exceeded
 */
export async function generateTweetVariations(idea: string): Promise<TweetVariations> {
    try {
        // Validate input
        const validated = TweetIdeaSchema.parse({ idea });

        // Initialize OpenAI
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        if (!process.env.OPENAI_API_KEY) {
            console.log('[MOCK MODE] No API key, using mock variations');
            return generateMockVariations(validated.idea);
        }

        // Generate variations using GPT-4
        const prompt = `You are a professional tweet writer. Generate 3 different variations of the following tweet idea.

Requirements:
- Each tweet MUST be under 280 characters
- Use a human, conversational tone
- No cringe or overly promotional language
- Use hashtags strategically (1-2 max)
- Keep it clean and simple
- No heavy emojis (max 1-2 if needed)
- Make each variation unique in style

Tweet idea: "${validated.idea}"

Return ONLY a JSON array with 3 tweet strings, no other text:
["tweet 1", "tweet 2", "tweet 3"]`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert tweet writer. Return only valid JSON arrays of tweet strings.',
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            temperature: 0.8,
            max_tokens: 500,
        });

        const response = completion.choices[0]?.message?.content;
        if (!response) {
            throw new AIGenerationError('No response from OpenAI');
        }

        // Parse JSON response
        let tweets: string[];
        try {
            tweets = JSON.parse(response);
        } catch (parseError) {
            throw new AIGenerationError(`Failed to parse AI response: ${response}`);
        }

        if (!Array.isArray(tweets) || tweets.length !== 3) {
            throw new AIGenerationError('AI did not return exactly 3 tweet variations');
        }

        // Validate each tweet
        const variations: TweetVariation[] = tweets.map((text) => {
            if (text.length > 280) {
                throw new TweetValidationError(`Generated tweet exceeds 280 chars: ${text.length}`);
            }

            return {
                text: text.trim(),
                length: text.trim().length,
                hasHashtags: text.includes('#'),
            };
        });

        const result = {
            variations,
            original: validated.idea,
        };

        // Validate output
        return TweetVariationsSchema.parse(result);
    } catch (error) {
        // Check for quota exceeded error
        if (error instanceof Error && (
            error.message.includes('429') || 
            error.message.includes('quota') ||
            error.message.includes('does not exist')
        )) {
            console.log('[MOCK MODE] OpenAI quota exceeded or model unavailable, using mock variations');
            return generateMockVariations(idea);
        }

        if (error instanceof AIGenerationError || error instanceof TweetValidationError) {
            throw error;
        }
        throw new AIGenerationError(`Tweet generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Select the best tweet from variations
 * Logic: shortest, clearest, highest readability
 */
export function selectBestTweet(variations: TweetVariation[]): TweetVariation {
    if (variations.length === 0) {
        throw new TweetValidationError('No variations to select from');
    }

    // Sort by criteria: prefer shorter, simpler tweets
    const sorted = [...variations].sort((a, b) => {
        // Primary: shorter is better
        if (a.length !== b.length) {
            return a.length - b.length;
        }

        // Secondary: fewer special chars (cleaner)
        const aSpecialChars = (a.text.match(/[^a-zA-Z0-9\s]/g) || []).length;
        const bSpecialChars = (b.text.match(/[^a-zA-Z0-9\s]/g) || []).length;
        return aSpecialChars - bSpecialChars;
    });

    return sorted[0];
}
