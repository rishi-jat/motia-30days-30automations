import { ExternalServiceError } from '../../errors/external-service.error'
import { buildFixGuidePrompt } from './prompts'
import type { FixGuideInput } from './types'
import { cache } from '../../cache'

interface OpenAIResponse {
    choices?: Array<{
        message?: {
            content?: string
        }
    }>
}

export async function generateFixGuide(input: FixGuideInput, apiKey: string): Promise<string> {
    try {
        // Check cache first
        const cacheKey = `${input.issueNumber}:${input.issueTitle}`
        const cached = await cache.get<string>('fix-guide', cacheKey)
        if (cached) {
            console.log('✅ Using cached fix guide for issue:', input.issueNumber)
            return cached
        }

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
            console.error(`❌ OpenAI API error ${response.status}:`, errorText)
            
            // FALLBACK: Generate basic fix guide from analysis
            const fallbackGuide = `# Fix Guide for Issue #${input.issueNumber}

## 📋 Issue
**Title:** ${input.issueTitle}

**Description:**
${input.issueBody || 'No description provided'}

---

## ⚠️ Note
AI-powered fix guide generation is temporarily unavailable (OpenAI API rate limit).

## 🔍 Analysis Summary
${input.analysis.summary}

## 🐛 Root Cause
${input.analysis.rootCause}

## 📂 Files to Check
${input.analysis.filesLikelyInvolved.map((f, i) => `${i + 1}. \`${f}\``).join('\n')}

## 🔧 Functions to Review
${input.analysis.functionsToCheck.map((f, i) => `${i + 1}. \`${f}\``).join('\n')}

## 📊 Difficulty
**${input.analysis.difficulty}** ${input.analysis.beginnerFriendly ? '✅ Beginner Friendly' : '⚠️ Advanced'}

## 💡 Next Steps
1. Read the issue description carefully
2. Review the files listed above
3. Check the functions mentioned
4. Implement the required changes
5. Test your solution
6. Submit a pull request

---
*Generated: ${new Date().toISOString()}*
*Note: This is a fallback guide. For detailed AI analysis, ensure OpenAI API key is valid.*
`
            
            // Cache the fallback
            await cache.set('fix-guide', fallbackGuide, cacheKey)
            return fallbackGuide
        }

        const data = (await response.json()) as OpenAIResponse

        if (!data.choices?.[0]?.message?.content) {
            throw new ExternalServiceError('Invalid response from OpenAI API', { data })
        }

        const fixGuide = data.choices[0].message.content

        // Cache the result
        await cache.set('fix-guide', fixGuide, cacheKey)

        return fixGuide
    } catch (error) {
        // Always return something useful instead of throwing
        console.error('❌ Fix guide generation failed, using fallback')
        
        const fallbackGuide = `# Fix Guide for Issue #${input.issueNumber}

## Issue: ${input.issueTitle}

**Error:** Unable to generate AI-powered fix guide.

${input.issueBody ? `**Description:**\n${input.issueBody}\n` : ''}

## Manual Steps
1. Review the issue description above
2. Check the repository code
3. Identify the files that need changes
4. Implement the fix
5. Test thoroughly
6. Submit a pull request

---
*Generated: ${new Date().toISOString()}*
`
        return fallbackGuide
    }
}
