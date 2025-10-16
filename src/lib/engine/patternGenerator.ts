import Anthropic from '@anthropic-ai/sdk';
import type { Track } from './liveAudioEngine';
import { getGenreReference } from '../knowledge/genres';

/**
 * Pattern Generator - Uses Claude API to generate music patterns from prompts
 * Now with compositional knowledge and artistic intent
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

    // Load genre knowledge if prompt matches
    const genreMatch = prompt.toLowerCase();
    let genreContext = '';

    const genreKeys = ['techno', 'ambient', 'hip', 'drum', 'jazz', 'claude'];
    const matchedGenre = genreKeys.find(g => genreMatch.includes(g));

    if (matchedGenre) {
      const ref = getGenreReference(matchedGenre);
      genreContext = `
GENRE REFERENCE FOR ${ref.name.toUpperCase()}:

ESSENCE: ${ref.essence}

RHYTHMIC CHARACTER:
${ref.rhythmicCharacter.drums}
${ref.rhythmicCharacter.bassPattern}

HARMONY:
Chords: ${ref.harmonic.chordProgressions.join(', ')}
Scales: ${ref.harmonic.scales.join(', ')}

COMPOSITION NOTES:
${ref.compositionNotes}
`;
      console.log(`[PatternGenerator] Loaded ${ref.name} reference`);
    }

    const systemPrompt = `You are Claude, an AI composer with deep musical knowledge.

${genreContext}

EUCLIDEAN RHYTHM TOOLKIT:

MUSICAL KNOWLEDGE - Use these Euclidean patterns:
- bd(3,8) = Kick on steps 0,5,10 (sparse techno)
- bd(4,16) = Four-on-floor (house/techno) = steps 0,4,8,12
- hh(7,8) or hh(8,16) = Dense hi-hats
- sd(2,16) = Snare on 2 and 4 (beats 4 and 12) = classic backbeat

GENRE PATTERNS:
- Techno: bd(4,16) + hh(7,8) + sd at steps 4,12
- House: bd(4,16) + hh every step + sd at 4,12
- Drum & Bass: bd(5,8) + complex snare fills + fast hats
- Ambient: Sparse bass(1,16), long pads, no drums

BASS PATTERNS:
- Root notes on kick hits
- Octave jumps for energy
- Syncopation (off-beat notes)

IMPORTANT: Return ONLY valid JSON. No trailing commas.

{
  "reasoning": "Brief thought process",
  "bpm": 128,
  "tracks": [
    {
      "name": "Kick",
      "type": "drums",
      "notes": ["C2"],
      "pattern": [[true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false]]
    },
    {
      "name": "Bass",
      "type": "bass",
      "notes": ["C2","E2"],
      "pattern": [
        [true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false],
        [false,false,false,false,false,false,true,false,false,false,false,false,false,false,true,false]
      ]
    }
  ],
  "code": "bd(4,16).bank('RolandTR909')"
}

RULES:
- type: "bass", "melody", "drums", or "pads"
- EXACTLY 16 booleans per pattern row
- NO trailing commas
- Use Euclidean spacing for rhythms
- Drums: Match kick patterns to genre
- Bass: Follow kick rhythm, add syncopation`;

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
