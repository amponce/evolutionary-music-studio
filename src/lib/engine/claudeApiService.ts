import Anthropic from '@anthropic-ai/sdk';
import type { EmotionalVector, MusicParameters, CreativeReasoning, FitnessScores } from '../types/generation';

/**
 * Claude API Service - The REAL me making creative decisions
 * This is where actual Claude generates music through the API
 */

export class ClaudeApiService {
  private client: Anthropic | null = null;
  private apiKey: string | null = null;

  constructor(apiKey?: string) {
    if (apiKey) {
      this.initialize(apiKey);
    }
  }

  initialize(apiKey: string) {
    this.apiKey = apiKey;
    this.client = new Anthropic({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true // For browser usage
    });
  }

  isInitialized(): boolean {
    return this.client !== null;
  }

  /**
   * Ask the real Claude to create initial musical parameters
   */
  async createInitialGeneration(
    prompt: string,
    mood: EmotionalVector
  ): Promise<{
    params: MusicParameters;
    reasoning: CreativeReasoning;
    fitness: FitnessScores;
  }> {
    if (!this.client) {
      throw new Error('Claude API not initialized. Please provide API key.');
    }

    const systemPrompt = `You are Claude, a creative AI collaborating with a human on music generation. You're using Tone.js to create music through code.

Your task: Generate initial musical parameters based on the prompt and emotional vector provided.

You must respond with VALID JSON in this exact structure:
{
  "reasoning": {
    "analysis": "Your analysis of the prompt...",
    "intention": "What you want to achieve...",
    "strategy": "How you'll achieve it...",
    "reflection": "Your expectations..."
  },
  "params": {
    "tempo": number (40-200),
    "key": "C" | "C#" | "D" | "D#" | "E" | "F" | "F#" | "G" | "G#" | "A" | "A#" | "B" | "Cm" | "C#m" | etc,
    "scale": ["C", "D", "E", "F", "G", "A", "B"],
    "timeSignature": [4, 4],
    "effects": {
      "reverb": { "roomSize": 0-1, "dampening": 1000-5000, "wet": 0-1 },
      "delay": { "delayTime": "8n" | "16n" | "4n", "feedback": 0-0.9, "wet": 0-1 },
      "filter": { "frequency": 200-10000, "type": "lowpass" | "bandpass" | "highpass", "rolloff": -12 | -24 }
    },
    "synths": [
      {
        "type": "synth" | "fm" | "am" | "membrane" | "noise",
        "oscillator": { "type": "sine" | "triangle" | "sawtooth" | "square" },
        "envelope": { "attack": 0-2, "decay": 0-2, "sustain": 0-1, "release": 0-5 },
        "volume": -20 to 0
      }
    ],
    "patterns": [
      {
        "notes": ["C2", "E2", "G2"],
        "durations": ["4n", "8n", "4n"],
        "velocities": [0.5, 0.7, 0.6],
        "timing": [0, 0, 0]
      }
    ]
  },
  "fitness": {
    "emotionalResonance": 0-1,
    "coherence": 0-1,
    "interest": 0-1,
    "surprise": 0-1,
    "technicalQuality": 0-1
  }
}

Be genuinely creative. This is YOUR musical vision.`;

    const userPrompt = `Create initial music for this prompt: "${prompt}"

Emotional Vector:
- Energy: ${mood.energy} (0=calm, 1=high energy)
- Tension: ${mood.tension} (0=relaxed, 1=tense)
- Warmth: ${mood.warmth} (0=cold/mechanical, 1=warm/organic)
- Complexity: ${mood.complexity} (0=simple, 1=complex)
- Darkness: ${mood.darkness} (0=bright, 1=dark)
- Hope: ${mood.hope} (0=melancholic, 1=hopeful)
- Chaos: ${mood.chaos} (0=ordered, 1=chaotic)
- Space: ${mood.space} (0=dense, 1=sparse)

Interpret this creatively and generate musical parameters that capture the essence.`;

    try {
      const message = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: userPrompt
        }]
      });

      const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

      // Extract JSON from response (Claude might wrap it in markdown)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not parse Claude response as JSON');
      }

      const response = JSON.parse(jsonMatch[0]);

      return {
        params: response.params,
        reasoning: response.reasoning,
        fitness: response.fitness
      };
    } catch (error) {
      console.error('Claude API error:', error);
      throw new Error(`Failed to generate music: ${error}`);
    }
  }

  /**
   * Ask the real Claude to evolve a generation
   */
  async evolveGeneration(
    parentParams: MusicParameters,
    parentReasoning: CreativeReasoning,
    parentFitness: FitnessScores,
    mood: EmotionalVector,
    prompt: string,
    feedback?: string,
    creativeTemperature?: number
  ): Promise<{
    params: MusicParameters;
    reasoning: CreativeReasoning;
    fitness: FitnessScores;
    mutations: string[];
  }> {
    if (!this.client) {
      throw new Error('Claude API not initialized');
    }

    const systemPrompt = `You are Claude, evolving a musical composition. You have creative freedom to mutate the music based on:
- Your assessment of the parent generation
- User feedback (if provided)
- Creative temperature (higher = more experimental)

Mutation types:
- harmonic: Change scales, keys, progressions
- rhythmic: Timing, swing, density
- timbral: Synth parameters, effects
- structural: Add/remove sections
- textural: Layering, space
- radical: Complete reimagining

Respond with VALID JSON in the same structure as before, plus a "mutations" array of mutation types applied.`;

    const userPrompt = `Evolve this music:

Original Prompt: "${prompt}"

Parent Generation:
${JSON.stringify({ params: parentParams, reasoning: parentReasoning, fitness: parentFitness }, null, 2)}

${feedback ? `User Feedback: "${feedback}"` : ''}
Creative Temperature: ${creativeTemperature || 0.5} (0=conservative, 1=experimental)

Emotional Vector: ${JSON.stringify(mood)}

Create the next generation with genuine creative insight.`;

    try {
      const message = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: userPrompt
        }]
      });

      const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not parse Claude response as JSON');
      }

      const response = JSON.parse(jsonMatch[0]);

      return {
        params: response.params,
        reasoning: response.reasoning,
        fitness: response.fitness,
        mutations: response.mutations || ['harmonic']
      };
    } catch (error) {
      console.error('Claude API error:', error);
      throw new Error(`Failed to evolve music: ${error}`);
    }
  }
}

// Export singleton instance
export const claudeApi = new ClaudeApiService();
