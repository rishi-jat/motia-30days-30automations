import { ExternalServiceError } from '../../errors/external-service.error'
import { buildFixGuidePrompt } from './prompts'
import type { FixGuideInput } from './types'

interface OpenAIResponse {
    choices?: Array<{
        message?: {
            content?: string
        }
    }>
}

export async function generateFixGuide(input: FixGuideInput, apiKey: string): Promise<string> {
    try {
        const prompt = buildFixGuidePrompt(input)

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content:
                            'You are a senior developer writing comprehensive, beginner-friendly fix guides for GitHub issues.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.7,
                max_tokens: 4000,
            }),
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new ExternalServiceError(`OpenAI API returned ${response.status}`, {
                status: response.status,
                error: errorText,
            })
        }

        const data = (await response.json()) as OpenAIResponse

        if (!data.choices?.[0]?.message?.content) {
            throw new ExternalServiceError('Invalid response from OpenAI API', { data })
        }

        return data.choices[0].message.content
    } catch (error) {
        if (error instanceof ExternalServiceError) {
            throw error
        }
        throw new ExternalServiceError('Failed to generate fix guide with LLM', {
            error: error instanceof Error ? error.message : String(error),
        })
    }
}
