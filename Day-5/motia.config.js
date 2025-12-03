/**
 * Motia Configuration for Day-5: AI X Auto-Posting Workflow
 */

module.exports = {
    name: 'day-5-ai-x-auto-posting',
    description: 'AI-powered X (Twitter) auto-posting workflow - n8n to Motia conversion',
    version: '1.0.0',

    plugins: [
        '@motiadev/plugin-endpoint',
        '@motiadev/plugin-logs',
        '@motiadev/plugin-observability',
        '@motiadev/plugin-states',
    ],

    steps: [
        // Step 1: API trigger
        './steps/day-5/01-receive-idea.step.ts',

        // Step 2: AI generation
        './steps/day-5/02-generate-variations.step.ts',

        // Step 3: Select best
        './steps/day-5/03-select-best.step.ts',

        // Step 4: Post to X
        './steps/day-5/04-post-tweet.step.ts',

        // Step 5: Write result
        './steps/day-5/05-write-result.step.ts',
    ],
};
