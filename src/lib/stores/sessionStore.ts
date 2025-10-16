import { writable, derived, get } from 'svelte/store';
import type {
  Session,
  Generation,
  SessionSettings,
  SessionMode,
  EmotionalVector,
  UserFeedback
} from '../types/generation';
import { EvolutionEngine } from '../evolution/evolutionEngine';
import { MusicEngine } from '../engine/musicEngine';
import { claudeApi } from '../engine/claudeApiService';

/**
 * Session Store - Manages the entire creative session state
 * Supports both API mode (real Claude) and Simulation mode (algorithmic)
 */

// Create singleton instances
const evolutionEngine = new EvolutionEngine();
const musicEngine = new MusicEngine();

// API mode stores
export const useApiMode = writable<boolean>(false); // Toggle between API and simulation
export const apiKey = writable<string>(''); // Claude API key
export const apiInitialized = writable<boolean>(false); // Is API ready?

// Initial session state
function createInitialSession(): Session {
  return {
    id: `session_${Date.now()}`,
    startTime: Date.now(),
    lastUpdateTime: Date.now(),
    initialPrompt: '',
    currentGeneration: '',
    generations: [],
    settings: {
      autonomyLevel: 0.5,
      generationsToRun: 5,
      creativeTemperature: 0.5,
      allowBranching: true
    },
    memory: {
      preferredMoods: [],
      successfulMutations: [],
      avoidedPatterns: [],
      stylePreferences: {}
    }
  };
}

// Core stores
export const session = writable<Session>(createInitialSession());
export const sessionMode = writable<SessionMode>('guided-exploration');
export const isGenerating = writable<boolean>(false);
export const isPlaying = writable<boolean>(false);

// Derived stores
export const currentGeneration = derived(
  session,
  $session => $session.generations.find(g => g.id === $session.currentGeneration)
);

export const generationTree = derived(
  session,
  $session => buildGenerationTree($session.generations)
);

// Helper function to build tree structure
function buildGenerationTree(generations: Generation[]) {
  const tree: { [key: string]: Generation[] } = {};

  generations.forEach(gen => {
    const parentId = gen.parentId || 'root';
    if (!tree[parentId]) {
      tree[parentId] = [];
    }
    tree[parentId].push(gen);
  });

  return tree;
}

/**
 * Initialize Claude API with key
 */
export function initializeApi(key: string) {
  claudeApi.initialize(key);
  apiKey.set(key);
  apiInitialized.set(true);

  // Save to localStorage for persistence
  if (typeof window !== 'undefined') {
    localStorage.setItem('claude_api_key', key);
  }
}

/**
 * Load API key from localStorage if available
 */
export function loadApiKeyFromStorage() {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('claude_api_key');
    if (stored) {
      initializeApi(stored);
    }
  }
}

/**
 * Start a new session with an initial prompt
 * Uses API mode if enabled, otherwise uses simulation
 */
export async function startNewSession(
  prompt: string,
  mood: EmotionalVector
): Promise<Generation> {
  isGenerating.set(true);

  try {
    const $useApiMode = get(useApiMode);
    const $apiInitialized = get(apiInitialized);

    let gen0: Generation;

    if ($useApiMode && $apiInitialized) {
      // Use real Claude API
      const { params, reasoning, fitness } = await claudeApi.createInitialGeneration(prompt, mood);

      gen0 = {
        id: `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        parentId: null,
        generationNumber: 0,
        timestamp: Date.now(),
        musicCode: musicEngine.generateCode(params),
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
    } else {
      // Use simulation mode
      gen0 = await evolutionEngine.createInitialGeneration(prompt, mood);
    }

    // Update session
    session.update(s => ({
      ...s,
      id: `session_${Date.now()}`,
      startTime: Date.now(),
      lastUpdateTime: Date.now(),
      initialPrompt: prompt,
      currentGeneration: gen0.id,
      generations: [gen0]
    }));

    return gen0;
  } finally {
    isGenerating.set(false);
  }
}

/**
 * Evolve the current generation
 */
export async function evolveCurrentGeneration(
  feedback?: string
): Promise<Generation> {
  const $session = get(session);
  const current = $session.generations.find(g => g.id === $session.currentGeneration);

  if (!current) {
    throw new Error('No current generation to evolve');
  }

  isGenerating.set(true);

  try {
    const newGen = await evolutionEngine.evolve(
      current,
      $session.settings.creativeTemperature,
      feedback
    );

    // Add to session
    session.update(s => ({
      ...s,
      currentGeneration: newGen.id,
      generations: [...s.generations, newGen],
      lastUpdateTime: Date.now()
    }));

    return newGen;
  } finally {
    isGenerating.set(false);
  }
}

/**
 * Run multiple autonomous generations
 */
export async function runAutonomousEvolution(
  numGenerations: number,
  onProgress?: (gen: Generation, index: number) => void
): Promise<Generation[]> {
  const $session = get(session);
  let current = $session.generations.find(g => g.id === $session.currentGeneration);

  if (!current) {
    throw new Error('No current generation');
  }

  isGenerating.set(true);

  try {
    const newGenerations: Generation[] = [];

    for (let i = 0; i < numGenerations; i++) {
      const newGen = await evolutionEngine.evolve(
        current,
        $session.settings.creativeTemperature
      );

      newGenerations.push(newGen);
      current = newGen;

      // Update session
      session.update(s => ({
        ...s,
        currentGeneration: newGen.id,
        generations: [...s.generations, newGen],
        lastUpdateTime: Date.now()
      }));

      if (onProgress) {
        onProgress(newGen, i);
      }
    }

    return newGenerations;
  } finally {
    isGenerating.set(false);
  }
}

/**
 * Play a specific generation
 */
export async function playGeneration(generationId: string) {
  const $session = get(session);
  const gen = $session.generations.find(g => g.id === generationId);

  if (!gen) {
    throw new Error('Generation not found');
  }

  await musicEngine.play(gen.musicParams);
  isPlaying.set(true);
}

/**
 * Stop playback
 */
export function stopPlayback() {
  musicEngine.stop();
  isPlaying.set(false);
}

/**
 * Set current generation (for navigation)
 */
export function setCurrentGeneration(generationId: string) {
  session.update(s => ({
    ...s,
    currentGeneration: generationId
  }));
}

/**
 * Add user feedback to a generation
 */
export function addFeedback(feedback: UserFeedback) {
  session.update(s => {
    const gen = s.generations.find(g => g.id === feedback.generationId);

    if (gen) {
      // Update memory based on feedback
      if (feedback.rating && feedback.rating >= 4) {
        s.memory.preferredMoods.push(gen.mood);
        s.memory.successfulMutations.push(...gen.mutations);
      }

      if (feedback.lockedElements) {
        gen.lockedElements = feedback.lockedElements;
      }
    }

    return { ...s, lastUpdateTime: Date.now() };
  });
}

/**
 * Update session settings
 */
export function updateSettings(newSettings: Partial<SessionSettings>) {
  session.update(s => ({
    ...s,
    settings: { ...s.settings, ...newSettings },
    lastUpdateTime: Date.now()
  }));
}

/**
 * Export session data
 */
export function exportSession(): string {
  const $session = get(session);
  return JSON.stringify($session, null, 2);
}

/**
 * Load session from exported data
 */
export function loadSession(data: string) {
  const loadedSession = JSON.parse(data) as Session;
  session.set(loadedSession);
}

/**
 * Reset to a new session
 */
export function resetSession() {
  stopPlayback();
  session.set(createInitialSession());
}
