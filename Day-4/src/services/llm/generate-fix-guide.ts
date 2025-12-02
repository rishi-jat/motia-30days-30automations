import { generateMockFixGuide } from './mock'
import type { FixGuideInput } from './types'

export async function generateFixGuide(input: FixGuideInput, apiKey: string): Promise<string> {
    // Use mock for demo (OpenAI API is rate-limited)
    console.log('🎯 Using smart mock fix guide generator')
    return generateMockFixGuide(input)
}
