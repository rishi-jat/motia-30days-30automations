import { ExternalServiceError } from '../../errors/external-service.error'
import { buildDocumentationPrompt } from './prompts'
import { llmResponseSchema, type RepoModel } from './types'

export async function generateDocumentation(
    repoModel: RepoModel,
    apiKey: string
): Promise<string> {
    try {
        const prompt = buildDocumentationPrompt(repoModel)

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
                            'You are a technical documentation expert. Generate comprehensive, beginner-friendly documentation.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.7,
                max_tokens: 16000,
            }),
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new ExternalServiceError(`OpenAI API returned ${response.status}`, {
                status: response.status,
                error: errorText,
            })
        }

        const data = await response.json()

        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new ExternalServiceError('Invalid response from OpenAI API', {
                data,
            })
        }

        return data.choices[0].message.content
    } catch (error) {
        if (error instanceof ExternalServiceError) {
            throw error
        }
        throw new ExternalServiceError('Failed to generate documentation with LLM', {
            error: error instanceof Error ? error.message : String(error),
        })
    }
}
