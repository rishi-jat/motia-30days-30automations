import { ExternalServiceError } from '../../errors/external-service.error'
import { buildAnalysisPrompt } from './prompts'
import { issueAnalysisSchema, type IssueAnalysis } from './types'
import { cache } from '../../cache'

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
        // Check cache first
        const cacheKey = `analyze-issue:${issueTitle}:${issueBody}:${files.length}`
        const cached = await cache.get<IssueAnalysis>('issue-analysis', cacheKey)
        if (cached) {
            console.log('✅ Using cached analysis for issue:', issueTitle)
            return cached
        }

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
            console.error(`❌ OpenAI API error ${response.status}:`, errorText)
            
            // FALLBACK: Return mock analysis instead of throwing error
            const fallbackAnalysis: IssueAnalysis = {
                summary: `AI rate-limited. Issue about: ${issueTitle}`,
                rootCause: 'Not analyzed due to OpenAI API rate limit (429). Manual review needed.',
                filesLikelyInvolved: ['Check repository files manually'],
                functionsToCheck: ['Review issue description for clues'],
                difficulty: 'Medium',
                beginnerFriendly: true,
            }
            
            // Cache the fallback so subsequent calls are instant
            await cache.set('issue-analysis', fallbackAnalysis, cacheKey)
            return fallbackAnalysis
        }

        const data = (await response.json()) as OpenAIResponse

        if (!data.choices?.[0]?.message?.content) {
            throw new ExternalServiceError('Invalid response from OpenAI API', { data })
        }

        const content = data.choices[0].message.content
        const analysis = JSON.parse(content)

        // Validate with Zod
        const validatedAnalysis = issueAnalysisSchema.parse(analysis)

        // Cache the result
        await cache.set('issue-analysis', validatedAnalysis, cacheKey)

        return validatedAnalysis
    } catch (error) {
        if (error instanceof ExternalServiceError) {
            // Return fallback instead of throwing
            console.error('❌ Analysis failed, using fallback')
            return {
                summary: `Analysis failed. Issue: ${issueTitle}`,
                rootCause: 'Unable to analyze with AI. Manual review needed.',
                filesLikelyInvolved: ['Unknown - check issue description'],
                functionsToCheck: ['Unknown - review codebase manually'],
                difficulty: 'Medium',
                beginnerFriendly: false,
            }
        }
        
        // Return fallback for any other error
        console.error('❌ Unexpected error:', error)
        return {
            summary: `Error analyzing issue: ${issueTitle}`,
            rootCause: error instanceof Error ? error.message : String(error),
            filesLikelyInvolved: ['Error - unable to determine'],
            functionsToCheck: ['Error - unable to determine'],
            difficulty: 'Hard',
            beginnerFriendly: false,
        }
    }
}
