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

Generate a musical pattern based on the user's prompt. Return VALID JSON:

{
  "reasoning": "Your creative thought process...",
  "bpm": 120,
  "tracks": [
    {
      "name": "Bass",
      "type": "bass" | "melody" | "drums" | "pads",
      "notes": ["C2", "E2", "G2"],
      "pattern": [
        [true, false, true, false, true, false, true, false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, true, false, true, false, true, false, false, false],
      ]
    }
  ],
  "code": "// Strudel-style code representation\nstack(\n  sound('bass').note('c2 e2 g2').fast(2),\n  sound('hat').euclidean(3,8)\n)"
}

Pattern is 16 steps. Each row is a note, each column is a time step.
Create interesting, musical patterns. Be creative.`;

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
        throw new Error('Could not parse response as JSON');
      }

      const result = JSON.parse(jsonMatch[0]);
      console.log('[PatternGenerator] Parsed result:', result);

      return result;
    } catch (error) {
      console.error('[PatternGenerator] Error:', error);
      throw error;
    }
  }
}

export const patternGenerator = new PatternGenerator();
