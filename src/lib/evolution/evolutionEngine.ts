import type {
  Generation,
  MutationType,
  MutationStrategy,
  EmotionalVector,
  MusicParameters,
  CreativeReasoning,
  FitnessScores
} from '../types/generation';
import { MusicEngine } from '../engine/musicEngine';

/**
 * Evolution Engine - My creative mutation and growth system
 * This is where I explore variations and evolve musical ideas
 */

export class EvolutionEngine {
  private musicEngine: MusicEngine;

  constructor() {
    this.musicEngine = new MusicEngine();
  }

  /**
   * Create the initial generation (Generation 0) from a prompt
   * This is my first creative interpretation
   */
  async createInitialGeneration(
    prompt: string,
    mood: EmotionalVector
  ): Promise<Generation> {
    // My initial creative vision
    const reasoning: CreativeReasoning = {
      analysis: `Starting from prompt: "${prompt}". I'm interpreting this as a call for ${this.describeMood(mood)}.`,
      intention: this.formulateIntention(mood, prompt),
      strategy: this.formulateStrategy(mood, prompt),
      reflection: "This is my initial conception. I'm curious to hear how it resonates."
    };

    // Generate musical parameters from emotion
    const params = this.musicEngine.emotionToParams(mood, prompt);

    // Generate the code
    const code = this.musicEngine.generateCode(params);

    // Self-evaluate
    const fitness = this.evaluateFitness(params, mood, prompt);

    const generation: Generation = {
      id: this.generateId(),
      parentId: null,
      generationNumber: 0,
      timestamp: Date.now(),
      musicCode: code,
      musicParams: params,
      creativeReasoning: reasoning,
      fitness,
      prompt,
      mood,
      mutations: [],
      lockedElements: [],
      branch: 'main',
      tags: []
    };

    return generation;
  }

  /**
   * Evolve a generation into a new one
   * This is where I apply creative mutations
   */
  async evolve(
    parent: Generation,
    creativeTemperature: number,
    feedback?: string
  ): Promise<Generation> {
    // Analyze the parent to decide what to mutate
    const mutationStrategy = this.chooseMutationStrategy(
      parent,
      creativeTemperature,
      feedback
    );

    // Apply the mutation
    const newParams = this.applyMutation(
      parent.musicParams,
      mutationStrategy,
      parent.lockedElements
    );

    // Generate new code
    const code = this.musicEngine.generateCode(newParams);

    // My creative reasoning for this evolution
    const reasoning: CreativeReasoning = {
      analysis: this.analyzeParent(parent),
      intention: this.articulateIntent(mutationStrategy, feedback),
      strategy: this.explainStrategy(mutationStrategy),
      reflection: this.anticipateOutcome(mutationStrategy)
    };

    // Evaluate the new generation
    const fitness = this.evaluateFitness(newParams, parent.mood, parent.prompt);

    const generation: Generation = {
      id: this.generateId(),
      parentId: parent.id,
      generationNumber: parent.generationNumber + 1,
      timestamp: Date.now(),
      musicCode: code,
      musicParams: newParams,
      creativeReasoning: reasoning,
      fitness,
      prompt: parent.prompt,
      mood: parent.mood,
      mutations: [...parent.mutations, mutationStrategy.type],
      lockedElements: parent.lockedElements,
      branch: parent.branch,
      tags: []
    };

    return generation;
  }

  /**
   * Choose a mutation strategy based on context
   */
  private chooseMutationStrategy(
    parent: Generation,
    temperature: number,
    feedback?: string
  ): MutationStrategy {
    // Analyze what needs improvement
    const weakestAspect = this.findWeakestAspect(parent.fitness);

    // Parse feedback for hints
    const feedbackHints = feedback ? this.parseFeedback(feedback) : null;

    // Decide mutation type
    let type: MutationType;
    let intensity = 0.3 + (temperature * 0.4);

    if (feedbackHints) {
      // Respond to specific feedback
      type = feedbackHints.suggestedMutation;
      intensity = feedbackHints.intensity;
    } else if (temperature > 0.8) {
      // High temperature = radical experiments
      type = 'radical';
      intensity = 0.7 + (temperature * 0.3);
    } else {
      // Choose based on what needs improvement
      type = this.chooseTypeForAspect(weakestAspect);
    }

    return {
      type,
      description: this.describeMutation(type, intensity),
      intensity,
      targets: this.selectTargets(type, parent.musicParams)
    };
  }

  private findWeakestAspect(fitness: FitnessScores): keyof FitnessScores {
    const entries = Object.entries(fitness) as [keyof FitnessScores, number][];
    entries.sort((a, b) => a[1] - b[1]);
    return entries[0][0];
  }

  private chooseTypeForAspect(aspect: keyof FitnessScores): MutationType {
    const map: Record<keyof FitnessScores, MutationType> = {
      emotionalResonance: 'timbral',
      coherence: 'structural',
      interest: 'rhythmic',
      surprise: 'harmonic',
      technicalQuality: 'textural'
    };
    return map[aspect] || 'harmonic';
  }

  private parseFeedback(feedback: string): { suggestedMutation: MutationType; intensity: number } | null {
    const lower = feedback.toLowerCase();

    if (lower.includes('more energy') || lower.includes('faster')) {
      return { suggestedMutation: 'rhythmic', intensity: 0.7 };
    }
    if (lower.includes('darker') || lower.includes('sadder')) {
      return { suggestedMutation: 'harmonic', intensity: 0.6 };
    }
    if (lower.includes('simpler') || lower.includes('less')) {
      return { suggestedMutation: 'structural', intensity: 0.5 };
    }
    if (lower.includes('weird') || lower.includes('experimental')) {
      return { suggestedMutation: 'radical', intensity: 0.9 };
    }

    return null;
  }

  /**
   * Apply a mutation strategy to musical parameters
   */
  private applyMutation(
    params: MusicParameters,
    strategy: MutationStrategy,
    locked: string[]
  ): MusicParameters {
    const newParams = JSON.parse(JSON.stringify(params)); // Deep clone

    switch (strategy.type) {
      case 'harmonic':
        if (!locked.includes('scale')) {
          newParams.scale = this.mutateScale(params.scale, strategy.intensity);
        }
        if (!locked.includes('key')) {
          newParams.key = this.mutateKey(params.key, strategy.intensity);
        }
        break;

      case 'rhythmic':
        if (!locked.includes('tempo')) {
          newParams.tempo = this.mutateTempo(params.tempo, strategy.intensity);
        }
        if (!locked.includes('patterns')) {
          newParams.patterns = params.patterns.map(p => ({
            ...p,
            durations: this.mutateRhythm(p.durations, strategy.intensity)
          }));
        }
        break;

      case 'timbral':
        if (!locked.includes('synths')) {
          newParams.synths = params.synths.map(s => this.mutateSynth(s, strategy.intensity));
        }
        if (!locked.includes('effects')) {
          newParams.effects = this.mutateEffects(params.effects, strategy.intensity);
        }
        break;

      case 'structural':
        if (!locked.includes('patterns')) {
          // Add or remove pattern layers
          if (strategy.intensity > 0.6 && newParams.patterns.length > 1) {
            newParams.patterns.pop(); // Simplify
          } else if (strategy.intensity > 0.7 && newParams.patterns.length < 4) {
            // Add complexity
            newParams.patterns.push(params.patterns[0]);
          }
        }
        break;

      case 'textural':
        // Adjust layering and density
        if (!locked.includes('effects')) {
          newParams.effects.reverb.wet += (Math.random() - 0.5) * strategy.intensity * 0.3;
          newParams.effects.delay.wet += (Math.random() - 0.5) * strategy.intensity * 0.2;
        }
        break;

      case 'radical':
        // Complete reimagining - only mutate unlocked elements drastically
        if (!locked.includes('scale')) {
          newParams.scale = this.generateRadicalScale();
        }
        if (!locked.includes('tempo')) {
          newParams.tempo = 40 + Math.random() * 160;
        }
        break;
    }

    return newParams;
  }

  // Mutation helper methods
  private mutateScale(scale: string[], intensity: number): string[] {
    if (intensity < 0.3) {
      // Subtle: change one note
      const newScale = [...scale];
      const idx = Math.floor(Math.random() * scale.length);
      const chromatic = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      newScale[idx] = chromatic[Math.floor(Math.random() * chromatic.length)];
      return newScale;
    } else {
      // Dramatic: change mode
      return intensity > 0.7
        ? ['C', 'Db', 'E', 'F', 'G', 'Ab', 'Bb'] // Harmonic minor
        : ['C', 'D', 'E', 'F#', 'G', 'A', 'B'];  // Lydian
    }
  }

  private mutateKey(key: string, intensity: number): string {
    const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const minors = keys.map(k => k + 'm');
    const allKeys = [...keys, ...minors];

    if (intensity < 0.4) {
      // Stay in same mode, move by fifth
      return key.includes('m') ? 'Am' : 'G';
    } else {
      // Random new key
      return allKeys[Math.floor(Math.random() * allKeys.length)];
    }
  }

  private mutateTempo(tempo: number, intensity: number): number {
    const change = (Math.random() - 0.5) * intensity * 40;
    return Math.max(40, Math.min(200, tempo + change));
  }

  private mutateRhythm(durations: string[], intensity: number): string[] {
    if (intensity < 0.4) {
      // Subtle: change a few notes
      return durations.map(d => Math.random() < 0.3 ? this.alterDuration(d) : d);
    } else {
      // Dramatic: new rhythm
      return durations.map(() => this.alterDuration(durations[0]));
    }
  }

  private alterDuration(duration: string): string {
    const opts = ['16n', '8n', '4n', '2n'];
    return opts[Math.floor(Math.random() * opts.length)];
  }

  private mutateSynth(synth: any, intensity: number): any {
    const newSynth = { ...synth };

    if (intensity > 0.5) {
      newSynth.oscillator.type = ['sine', 'triangle', 'sawtooth', 'square'][Math.floor(Math.random() * 4)];
    }

    newSynth.envelope.attack += (Math.random() - 0.5) * intensity * 0.5;
    newSynth.envelope.release += (Math.random() - 0.5) * intensity * 1.0;

    return newSynth;
  }

  private mutateEffects(effects: any, intensity: number): any {
    const newEffects = JSON.parse(JSON.stringify(effects));

    newEffects.reverb.roomSize += (Math.random() - 0.5) * intensity * 0.5;
    newEffects.reverb.roomSize = Math.max(0.1, Math.min(0.9, newEffects.reverb.roomSize));

    newEffects.delay.feedback += (Math.random() - 0.5) * intensity * 0.3;
    newEffects.delay.feedback = Math.max(0, Math.min(0.9, newEffects.delay.feedback));

    return newEffects;
  }

  private generateRadicalScale(): string[] {
    // Completely new scale
    const chromatic = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const length = 5 + Math.floor(Math.random() * 3);
    const scale: string[] = [];

    for (let i = 0; i < length; i++) {
      scale.push(chromatic[Math.floor(Math.random() * chromatic.length)]);
    }

    return scale;
  }

  private selectTargets(type: MutationType, params: MusicParameters): string[] {
    const targets: Record<MutationType, string[]> = {
      harmonic: ['scale', 'key'],
      rhythmic: ['tempo', 'patterns.durations'],
      timbral: ['synths', 'effects'],
      structural: ['patterns', 'timeSignature'],
      textural: ['effects.reverb', 'effects.delay'],
      radical: ['everything']
    };

    return targets[type] || [];
  }

  /**
   * Creative reasoning helpers - articulating my thought process
   */

  private describeMood(mood: EmotionalVector): string {
    const descriptors: string[] = [];

    if (mood.energy > 0.6) descriptors.push('energetic');
    else if (mood.energy < 0.3) descriptors.push('calm');

    if (mood.tension > 0.6) descriptors.push('tense');
    if (mood.darkness > 0.6) descriptors.push('dark');
    else if (mood.darkness < 0.3) descriptors.push('bright');

    if (mood.warmth > 0.6) descriptors.push('warm');
    if (mood.complexity > 0.7) descriptors.push('complex');
    if (mood.chaos > 0.6) descriptors.push('chaotic');
    if (mood.space > 0.6) descriptors.push('spacious');

    return descriptors.length > 0 ? descriptors.join(', ') : 'balanced';
  }

  private formulateIntention(mood: EmotionalVector, prompt: string): string {
    if (mood.energy > 0.7 && mood.tension > 0.6) {
      return "I want to create something that builds intensity and drives forward with purpose.";
    }
    if (mood.darkness > 0.7 && mood.space > 0.6) {
      return "I'm aiming for something introspective and atmospheric, with room to breathe.";
    }
    if (mood.chaos > 0.6) {
      return "I want to embrace unpredictability and create something that surprises.";
    }
    if (mood.warmth > 0.7) {
      return "I'm focusing on organic, human qualities - something that feels alive.";
    }

    return `I want to capture the essence of "${prompt}" through musical expression.`;
  }

  private formulateStrategy(mood: EmotionalVector, prompt: string): string {
    const strategies: string[] = [];

    if (mood.energy > 0.6) {
      strategies.push("faster tempo and driving rhythms");
    }
    if (mood.darkness > 0.5) {
      strategies.push("minor tonalities and darker timbres");
    }
    if (mood.warmth > 0.6) {
      strategies.push("subtle timing variations for humanization");
    }
    if (mood.space > 0.6) {
      strategies.push("generous reverb and sparse textures");
    }
    if (mood.complexity > 0.6) {
      strategies.push("layered patterns and harmonic richness");
    }

    return `I'll use ${strategies.join(', ')}${strategies.length > 0 ? ' to' : 'To'} bring this to life.`;
  }

  private analyzeParent(parent: Generation): string {
    const weak = this.findWeakestAspect(parent.fitness);
    const analyses: Record<keyof FitnessScores, string> = {
      emotionalResonance: "The emotional impact isn't quite landing as I'd hoped.",
      coherence: "Some elements feel disconnected from each other.",
      interest: "It needs more variety to hold attention.",
      surprise: "It's a bit too predictable - needs unexpected moments.",
      technicalQuality: "The execution could be more polished."
    };

    return analyses[weak];
  }

  private articulateIntent(strategy: MutationStrategy, feedback?: string): string {
    if (feedback) {
      return `Based on feedback: "${feedback}", I want to ${this.translateFeedbackToGoal(feedback)}.`;
    }

    return `I want to improve by ${strategy.description}.`;
  }

  private translateFeedbackToGoal(feedback: string): string {
    const lower = feedback.toLowerCase();

    if (lower.includes('more energy')) return 'increase the energy and momentum';
    if (lower.includes('darker')) return 'explore darker emotional territory';
    if (lower.includes('simpler')) return 'strip back to the essentials';
    if (lower.includes('more complex')) return 'add more layers and intrigue';

    return 'address the feedback thoughtfully';
  }

  private explainStrategy(strategy: MutationStrategy): string {
    const explanations: Record<MutationType, string> = {
      harmonic: `I'll adjust the harmonic content - ${strategy.targets.join(' and ')} - to shift the emotional color.`,
      rhythmic: `I'll modify the rhythmic elements to change the groove and energy flow.`,
      timbral: `I'll reshape the sound design and timbres to alter the texture and mood.`,
      structural: `I'll reorganize the structure to improve coherence and narrative arc.`,
      textural: `I'll adjust the layering and spatial qualities for better depth and dimension.`,
      radical: `I'm going to completely reimagine this - time for a bold experiment.`
    };

    return explanations[strategy.type];
  }

  private anticipateOutcome(strategy: MutationStrategy): string {
    if (strategy.intensity > 0.7) {
      return "This is a bold move - it might be brilliant or might need refinement.";
    }
    if (strategy.intensity < 0.3) {
      return "This is a subtle tweak. The change should be nuanced but meaningful.";
    }
    return "I'm curious to see how this shifts the overall feel.";
  }

  private describeMutation(type: MutationType, intensity: number): string {
    const level = intensity > 0.7 ? 'dramatic' : intensity > 0.4 ? 'moderate' : 'subtle';
    return `${level} ${type} mutation`;
  }

  /**
   * Evaluate fitness of a generation
   */
  private evaluateFitness(
    params: MusicParameters,
    mood: EmotionalVector,
    prompt: string
  ): FitnessScores {
    // This is my self-assessment of how well I did
    // In reality, I'd analyze the audio, but for now I'll estimate

    const emotionalResonance = this.assessEmotionalMatch(params, mood);
    const coherence = this.assessCoherence(params);
    const interest = this.assessInterest(params);
    const surprise = this.assessSurprise(params);
    const technicalQuality = this.assessTechnicalQuality(params);

    return {
      emotionalResonance,
      coherence,
      interest,
      surprise,
      technicalQuality
    };
  }

  private assessEmotionalMatch(params: MusicParameters, mood: EmotionalVector): number {
    // Simple heuristics for now
    let score = 0.5;

    // Tempo should match energy
    const tempoMatch = Math.abs((params.tempo - 60) / 120 - mood.energy);
    score += (1 - tempoMatch) * 0.2;

    // Effects should match space
    const spaceMatch = Math.abs(params.effects.reverb.wet - mood.space);
    score += (1 - spaceMatch) * 0.2;

    return Math.max(0, Math.min(1, score));
  }

  private assessCoherence(params: MusicParameters): number {
    // Check if elements work together
    let score = 0.6;

    // Similar volumes = more coherent
    const volumes = params.synths.map(s => s.volume);
    const volumeVariance = this.variance(volumes);
    score += Math.max(0, 0.3 - volumeVariance) * 0.4;

    return Math.max(0, Math.min(1, score));
  }

  private assessInterest(params: MusicParameters): number {
    // Variety = interest
    let score = 0.4;

    // More patterns = more interesting (up to a point)
    score += Math.min(params.patterns.length / 4, 0.3);

    // Variety in rhythms
    const uniqueDurations = new Set(params.patterns.flatMap(p => p.durations)).size;
    score += uniqueDurations * 0.05;

    return Math.max(0, Math.min(1, score));
  }

  private assessSurprise(params: MusicParameters): number {
    // Unusual choices = surprise
    let score = 0.3;

    // Complex time signature
    if (params.timeSignature[0] !== 4) score += 0.2;

    // Unusual scale length
    if (params.scale.length !== 7) score += 0.2;

    return Math.max(0, Math.min(1, score));
  }

  private assessTechnicalQuality(params: MusicParameters): number {
    // Well-structured = quality
    let score = 0.6;

    // Envelopes should be reasonable
    const hasGoodEnvelopes = params.synths.every(s =>
      s.envelope.attack < 2 && s.envelope.release < 5
    );
    if (hasGoodEnvelopes) score += 0.2;

    // Effects should be in reasonable ranges
    if (params.effects.reverb.wet < 0.8 && params.effects.delay.feedback < 0.8) {
      score += 0.2;
    }

    return Math.max(0, Math.min(1, score));
  }

  private variance(nums: number[]): number {
    const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
    return nums.reduce((sum, n) => sum + Math.pow(n - mean, 2), 0) / nums.length;
  }

  private generateId(): string {
    return `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
