// Core type definitions for the evolutionary music system

export interface EmotionalVector {
  energy: number;      // 0-1: Low energy vs high energy
  tension: number;     // 0-1: Relaxed vs tense
  warmth: number;      // 0-1: Cold/mechanical vs warm/organic
  complexity: number;  // 0-1: Simple vs complex
  darkness: number;    // 0-1: Bright vs dark
  hope: number;        // 0-1: Melancholic vs hopeful
  chaos: number;       // 0-1: Ordered vs chaotic
  space: number;       // 0-1: Dense vs sparse
}

export interface CreativeReasoning {
  analysis: string;      // What I observe in the current state
  intention: string;     // What I want to achieve
  strategy: string;      // How I plan to achieve it
  reflection: string;    // What happened after trying
}

export interface FitnessScores {
  emotionalResonance: number;  // 0-1: Matches the intended emotion?
  coherence: number;           // 0-1: Elements work together?
  interest: number;            // 0-1: Engaging and holds attention?
  surprise: number;            // 0-1: Novel or unexpected elements?
  technicalQuality: number;    // 0-1: Well-crafted and polished?
}

export interface MusicParameters {
  tempo: number;
  key: string;
  scale: string[];
  timeSignature: [number, number];
  effects: EffectSettings;
  synths: SynthSettings[];
  patterns: PatternDefinition[];
}

export interface EffectSettings {
  reverb: { roomSize: number; dampening: number; wet: number };
  delay: { delayTime: string; feedback: number; wet: number };
  filter: { frequency: number; type: string; rolloff: number };
}

export interface SynthSettings {
  type: 'synth' | 'membrane' | 'metal' | 'noise' | 'fm' | 'am';
  oscillator: { type: string };
  envelope: { attack: number; decay: number; sustain: number; release: number };
  volume: number;
}

export interface PatternDefinition {
  notes: string[];
  durations: string[];
  velocities: number[];
  timing: number[];
}

export interface Generation {
  id: string;
  parentId: string | null;
  generationNumber: number;
  timestamp: number;

  // Musical content
  musicCode: string;            // Executable Tone.js code
  musicParams: MusicParameters; // Structured parameters
  audioBuffer?: ArrayBuffer;    // Rendered audio (if available)

  // Creative process (the heart of this system)
  creativeReasoning: CreativeReasoning;

  // Evaluation metrics
  fitness: FitnessScores;

  // Context
  prompt: string;
  mood: EmotionalVector;
  mutations: string[];          // List of mutations applied
  lockedElements: string[];     // Elements that shouldn't be mutated

  // Metadata
  branch: string;               // Branch identifier for parallel evolution
  tags: string[];               // User-added tags
}

export interface Session {
  id: string;
  startTime: number;
  lastUpdateTime: number;

  initialPrompt: string;
  currentGeneration: string;    // Current generation ID
  generations: Generation[];    // All generations in this session

  settings: SessionSettings;
  memory: SessionMemory;
}

export interface SessionSettings {
  autonomyLevel: number;         // 0-1: Follow instructions vs creative freedom
  generationsToRun: number;      // How many generations before checking in
  creativeTemperature: number;   // 0-1: Conservative vs experimental mutations
  allowBranching: boolean;       // Can I split into parallel evolution paths?
}

export interface SessionMemory {
  preferredMoods: EmotionalVector[];    // Moods that got positive feedback
  successfulMutations: string[];        // Types of mutations that worked well
  avoidedPatterns: string[];            // Things to avoid based on feedback
  stylePreferences: Record<string, number>;  // Learned style preferences
}

export type MutationType =
  | 'harmonic'      // Scale changes, chord progressions, modal shifts
  | 'rhythmic'      // Timing, swing, polyrhythms, density
  | 'timbral'       // Synth parameters, effects, filtering
  | 'structural'    // Add/remove sections, reorder, extend
  | 'textural'      // Layering, space, density evolution
  | 'radical';      // Complete reimagining

export interface MutationStrategy {
  type: MutationType;
  description: string;
  intensity: number;  // 0-1: How drastic the change
  targets: string[];  // Which parameters to mutate
}

export interface UserFeedback {
  generationId: string;
  timestamp: number;
  rating?: number;              // 1-5 stars
  emotionalResponse?: string;   // Free text feedback
  lockedElements?: string[];    // Elements to preserve
  suggestions?: string[];       // Directions to explore
  redirect?: {                  // Take a specific generation in a new direction
    sourceGenerationId: string;
    newDirection: string;
  };
}

export type SessionMode =
  | 'guided-exploration'    // User gives direction, I explore within bounds
  | 'creative-dialogue'     // Back and forth collaboration
  | 'free-improvisation'    // I explore autonomously for many generations
  | 'challenge'             // User gives constraints, I solve creatively
  | 'remix';                // Reimagine an existing generation

export interface EvolutionBranch {
  id: string;
  parentGenerationId: string;
  description: string;          // Why I'm exploring this branch
  generations: string[];        // Generation IDs in this branch
  active: boolean;              // Still being explored?
}
