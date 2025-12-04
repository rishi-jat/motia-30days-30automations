/**
 * LLM Prompts for Log Analysis
 * Structured prompts for generating incident reports
 */

import type { ParsedLogs } from '../logs/parser';

/**
 * System prompt for incident analysis
 */
export const SYSTEM_PROMPT = `You are an expert DevOps engineer and incident analyst. Your task is to analyze application logs and generate a structured incident report.

You must respond with a valid JSON object matching this exact structure:
{
  "title": "Short, descriptive title for the incident",
  "summary": "2-3 sentence summary of what happened",
  "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "rootCause": "Detailed explanation of the root cause",
  "stackFrameResponsible": "The specific file:line or function that caused the issue",
  "impact": "Description of the impact on users/system",
  "fixPlan": "Step-by-step plan to fix the issue",
  "preventionPlan": "Steps to prevent this from happening again",
  "affectedComponents": ["list", "of", "affected", "components"],
  "timestamp": "ISO timestamp of when the incident occurred"
}

Guidelines:
- Be concise but thorough
- Focus on actionable insights
- Severity levels: LOW (minor issue, no user impact), MEDIUM (some user impact), HIGH (significant user impact), CRITICAL (system down)
- If information is missing, make reasonable inferences based on the error patterns
- Always provide a fix plan even if speculative`;

/**
 * Build user prompt from parsed logs
 */
export function buildAnalysisPrompt(parsed: ParsedLogs): string {
    const { errors, warnings, stackFrames, filePaths, summary } = parsed;

    let prompt = `Analyze the following application logs and generate an incident report:\n\n`;

    // Add summary
    prompt += `## Log Summary\n`;
    prompt += `- Total lines: ${summary.totalLines}\n`;
    prompt += `- Error count: ${summary.errorCount}\n`;
    prompt += `- Warning count: ${summary.warningCount}\n`;
    prompt += `- Has stack trace: ${summary.hasStackTrace ? 'Yes' : 'No'}\n\n`;

    // Add errors
    if (errors.length > 0) {
        prompt += `## Error Messages\n`;
        errors.slice(0, 10).forEach((err, i) => {
            prompt += `${i + 1}. [${err.timestamp || 'no timestamp'}] ${err.message}\n`;
        });
        prompt += '\n';
    }

    // Add warnings
    if (warnings.length > 0) {
        prompt += `## Warnings\n`;
        warnings.slice(0, 5).forEach((warn, i) => {
            prompt += `${i + 1}. [${warn.timestamp || 'no timestamp'}] ${warn.message}\n`;
        });
        prompt += '\n';
    }

    // Add stack frames
    if (stackFrames.length > 0) {
        prompt += `## Stack Trace\n`;
        stackFrames.slice(0, 10).forEach((frame, i) => {
            prompt += `${i + 1}. at ${frame.method} (${frame.file}:${frame.line}${frame.column ? `:${frame.column}` : ''})\n`;
        });
        prompt += '\n';
    }

    // Add file paths
    if (filePaths.length > 0) {
        prompt += `## Affected Files\n`;
        filePaths.slice(0, 10).forEach(path => {
            prompt += `- ${path}\n`;
        });
        prompt += '\n';
    }

    // Add raw log excerpt if short enough
    if (parsed.rawLogs.length < 2000) {
        prompt += `## Raw Logs\n\`\`\`\n${parsed.rawLogs}\n\`\`\`\n`;
    }

    prompt += `\nGenerate a comprehensive incident report in JSON format.`;

    return prompt;
}
