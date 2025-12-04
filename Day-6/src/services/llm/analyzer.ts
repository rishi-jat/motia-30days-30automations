/**
 * LLM Analyzer Service
 * Analyzes parsed logs using OpenAI GPT-4
 */

import OpenAI from 'openai';
import { z } from 'zod';
import { LLMAnalysisError } from '../../errors/log-analyzer.errors';
import { SYSTEM_PROMPT, buildAnalysisPrompt } from './prompts';
import type { ParsedLogs } from '../logs/parser';

// Incident report schema
export const IncidentReportSchema = z.object({
    title: z.string().min(1),
    summary: z.string().min(1),
    severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    rootCause: z.string().min(1),
    stackFrameResponsible: z.string(),
    impact: z.string().min(1),
    fixPlan: z.string().min(1),
    preventionPlan: z.string().min(1),
    affectedComponents: z.array(z.string()),
    timestamp: z.string(),
    generatedBy: z.literal('llm').default('llm'),
});

export type IncidentReport = z.infer<typeof IncidentReportSchema>;

/**
 * Check if mock mode is enabled
 */
export function isMockMode(): boolean {
    return process.env.MOCK_LLM === 'true';
}

/**
 * Analyze parsed logs with OpenAI
 */
export async function analyzeWithLLM(parsed: ParsedLogs): Promise<IncidentReport> {
    try {
        // Check for API key
        if (!process.env.OPENAI_API_KEY) {
            throw new LLMAnalysisError('OPENAI_API_KEY not configured');
        }

        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        const userPrompt = buildAnalysisPrompt(parsed);

        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: userPrompt },
            ],
            temperature: 0.3,
            max_tokens: 1500,
            response_format: { type: 'json_object' },
        });

        const response = completion.choices[0]?.message?.content;
        if (!response) {
            throw new LLMAnalysisError('Empty response from OpenAI');
        }

        // Parse and validate response
        let reportData: any;
        try {
            reportData = JSON.parse(response);
        } catch (parseError) {
            throw new LLMAnalysisError(`Failed to parse LLM response as JSON: ${response.substring(0, 200)}`);
        }

        // Ensure required fields
        reportData.generatedBy = 'llm';
        if (!reportData.timestamp) {
            reportData.timestamp = new Date().toISOString();
        }

        // Validate with Zod
        const validated = IncidentReportSchema.parse(reportData);

        return validated;
    } catch (error) {
        // Handle specific OpenAI errors
        if (error instanceof Error) {
            const message = error.message.toLowerCase();

            if (message.includes('429') || message.includes('rate limit')) {
                throw new LLMAnalysisError('OpenAI rate limit exceeded', 429);
            }

            if (message.includes('quota') || message.includes('billing')) {
                throw new LLMAnalysisError('OpenAI quota exceeded', 402);
            }

            if (message.includes('api key') || message.includes('authentication')) {
                throw new LLMAnalysisError('Invalid OpenAI API key', 401);
            }
        }

        if (error instanceof LLMAnalysisError) {
            throw error;
        }

        throw new LLMAnalysisError(
            `LLM analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
}
