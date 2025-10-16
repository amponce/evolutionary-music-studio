import Anthropic from '@anthropic-ai/sdk';
import type { Track } from './liveAudioEngine';

/**
 * Pattern Generator - Uses Claude API to generate music patterns from prompts
 */

export interface GeneratedPattern {
  tracks: {
    name: string;
    type: Track['type'];
    pattern: boolean[][];
    notes: string[];
  }[];
  bpm: number;
  code: string;
  reasoning: string;
}

export class PatternGenerator {
  private client: Anthropic | null = null;

  initialize(apiKey: string) {
    this.client = new Anthropic({
      apiKey,
      dangerouslyAllowBrowser: true
    });
    console.log('[PatternGenerator] Initialized with API key');
  }

  async generateFromPrompt(prompt: string): Promise<GeneratedPattern> {
    if (!this.client) {
      throw new Error('API not initialized');
    }

    console.log(`[PatternGenerator] Generating pattern for: "${prompt}"`);

    const systemPrompt = `You are an AI music composer creating patterns for a live sequencer.

IMPORTANT: Return ONLY valid JSON. No trailing commas, no comments in JSON, no extra text.

{
  "reasoning": "Your creative thought process",
  "bpm": 120,
  "tracks": [
    {
      "name": "Bass",
      "type": "bass",
      "notes": ["C2", "E2", "G2"],
      "pattern": [
        [true, false, true, false, true, false, true, false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, true, false, true, false, true, false, false, false]
      ]
    }
  ],
  "code": "sound('bass').note('c2 e2 g2')"
}

Rules:
- type must be EXACTLY one of: "bass", "melody", "drums", "pads"
- Each pattern array must have EXACTLY 16 booleans (true/false)
- NO trailing commas after last array element
- NO comments inside JSON
- Return pure JSON only

Pattern is 16 steps. Each row is a note, each column is a time step.`;

    try {
      const message = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: `Create a musical pattern for: "${prompt}"\n\nBe creative and make it musically interesting. Generate 2-4 tracks with complementary patterns.`
        }]
      });

      const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
      console.log('[PatternGenerator] Raw response:', responseText);

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('[PatternGenerator] No JSON found in response');
        throw new Error('Could not find JSON in response. Check console for details.');
      }

      let jsonText = jsonMatch[0];
      console.log('[PatternGenerator] Extracted JSON:', jsonText);

      // Try to parse
      let result;
      try {
        result = JSON.parse(jsonText);
      } catch (parseError: any) {
        console.error('[PatternGenerator] JSON parse error:', parseError.message);
        console.error('[PatternGenerator] Problematic JSON:', jsonText);
        throw new Error(`Invalid JSON from AI: ${parseError.message}. Check browser console for details.`);
      }

      console.log('[PatternGenerator] Parsed result:', result);

      // Validate structure
      if (!result.tracks || !Array.isArray(result.tracks)) {
        throw new Error('Invalid response: missing tracks array');
      }

      return result;
    } catch (error) {
      console.error('[PatternGenerator] Error:', error);
      throw error;
    }
  }
}

export const patternGenerator = new PatternGenerator();
