import { ExternalServiceError } from '../../errors/external-service.error'
import { buildAnalysisPrompt } from './prompts'
import { issueAnalysisSchema, type IssueAnalysis } from './types'

interface OpenAIResponse {
    choices?: Array<{
        message?: {
            content?: string
        }
    }>
}

export async function analyzeIssue(
    issueTitle: string,
    issueBody: string | null,
    files: Array<{ path: string; content: string }>,
    apiKey: string
): Promise<IssueAnalysis> {
    try {
        const prompt = buildAnalysisPrompt(issueTitle, issueBody, files)

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
                            'You are a code analysis expert. Analyze GitHub issues and return structured JSON responses.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.5,
                max_tokens: 2000,
                response_format: { type: 'json_object' },
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

        const content = data.choices[0].message.content
        const analysis = JSON.parse(content)

        // Validate with Zod
        return issueAnalysisSchema.parse(analysis)
    } catch (error) {
        if (error instanceof ExternalServiceError) {
            throw error
        }
        throw new ExternalServiceError('Failed to analyze issue with LLM', {
            error: error instanceof Error ? error.message : String(error),
        })
    }
}
