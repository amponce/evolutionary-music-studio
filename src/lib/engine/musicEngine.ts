import * as Tone from 'tone';
import type { EmotionalVector, MusicParameters, EffectSettings, SynthSettings, PatternDefinition } from '../types/generation';

/**
 * The Music Engine - My creative voice through Tone.js
 * This translates emotional intentions into actual sound
 */

export class MusicEngine {
  private synths: Tone.Synth[] = [];
  private effects: Map<string, Tone.ToneAudioNode> = new Map();
  private isPlaying: boolean = false;
  private currentPart?: Tone.Part;

  constructor() {
    // Initialize Tone.js context
    if (typeof window !== 'undefined') {
      Tone.getContext();
    }
  }

  /**
   * Translate an emotional vector into musical parameters
   * This is where I interpret feelings as sound design choices
   */
  emotionToParams(emotion: EmotionalVector, prompt: string): MusicParameters {
    // Tempo from energy level
    const tempo = 60 + (emotion.energy * 120); // 60-180 BPM

    // Key selection based on emotional qualities
    const key = this.selectKey(emotion);
    const scale = this.selectScale(emotion);

    // Time signature based on chaos/order
    const timeSignature: [number, number] = emotion.chaos > 0.6
      ? this.getComplexTimeSignature()
      : [4, 4];

    // Effects processing
    const effects = this.emotionToEffects(emotion);

    // Synth configuration
    const synths = this.emotionToSynths(emotion);

    // Pattern generation
    const patterns = this.generatePatterns(emotion, scale);

    return {
      tempo,
      key,
      scale,
      timeSignature,
      effects,
      synths,
      patterns
    };
  }

  private selectKey(emotion: EmotionalVector): string {
    // Darkness influences major/minor and root note
    const keys = emotion.darkness > 0.5
      ? ['Am', 'Dm', 'Em', 'Bm', 'F#m', 'Cm'] // Minor keys
      : ['C', 'G', 'D', 'F', 'A', 'E'];        // Major keys

    // Tension influences chromatic choices
    if (emotion.tension > 0.7) {
      return emotion.darkness > 0.5 ? 'C#m' : 'Db';
    }

    const index = Math.floor(emotion.hope * (keys.length - 1));
    return keys[index];
  }

  private selectScale(emotion: EmotionalVector): string[] {
    // Complexity influences scale choice
    if (emotion.complexity > 0.8) {
      return ['C', 'Db', 'E', 'F', 'G', 'Ab', 'Bb']; // Altered scale
    }

    if (emotion.darkness > 0.6) {
      if (emotion.tension > 0.6) {
        return ['C', 'D', 'Eb', 'F#', 'G', 'Ab', 'B']; // Harmonic minor
      }
      return ['C', 'D', 'Eb', 'F', 'G', 'Ab', 'Bb']; // Natural minor
    }

    if (emotion.warmth > 0.6) {
      return ['C', 'D', 'E', 'F', 'G', 'A', 'Bb']; // Mixolydian (warm)
    }

    return ['C', 'D', 'E', 'F', 'G', 'A', 'B']; // Major scale
  }

  private getComplexTimeSignature(): [number, number] {
    const signatures: [number, number][] = [[5, 4], [7, 8], [6, 8], [9, 8]];
    return signatures[Math.floor(Math.random() * signatures.length)];
  }

  private emotionToEffects(emotion: EmotionalVector): EffectSettings {
    return {
      reverb: {
        roomSize: 0.3 + (emotion.space * 0.7),        // Sparse = more reverb
        dampening: 1000 + (emotion.warmth * 4000),    // Warmth = darker reverb
        wet: 0.2 + (emotion.space * 0.5)
      },
      delay: {
        delayTime: emotion.tension > 0.6 ? '16n' : '8n',
        feedback: 0.1 + (emotion.complexity * 0.4),
        wet: 0.1 + (emotion.space * 0.3)
      },
      filter: {
        frequency: 200 + (emotion.energy * 8000),     // Energy = brighter
        type: emotion.warmth > 0.5 ? 'lowpass' : 'bandpass',
        rolloff: emotion.darkness > 0.5 ? -24 : -12
      }
    };
  }

  private emotionToSynths(emotion: EmotionalVector): SynthSettings[] {
    const synths: SynthSettings[] = [];

    // Bass synth - foundation
    synths.push({
      type: 'synth',
      oscillator: { type: emotion.warmth > 0.5 ? 'sine' : 'triangle' },
      envelope: {
        attack: 0.01 + (emotion.space * 0.1),
        decay: 0.2,
        sustain: 0.6 + (emotion.energy * 0.3),
        release: 0.5 + (emotion.space * 1.5)
      },
      volume: -10
    });

    // Lead/pad synth - emotional core
    if (emotion.complexity > 0.3) {
      synths.push({
        type: emotion.tension > 0.6 ? 'fm' : 'synth',
        oscillator: {
          type: emotion.chaos > 0.5 ? 'sawtooth' : 'square'
        },
        envelope: {
          attack: 0.05 + (emotion.space * 0.3),
          decay: 0.3,
          sustain: 0.5 + (emotion.warmth * 0.4),
          release: 1.0 + (emotion.space * 2.0)
        },
        volume: -15 + (emotion.energy * 5)
      });
    }

    // Texture layer - for complexity
    if (emotion.complexity > 0.6) {
      synths.push({
        type: emotion.chaos > 0.7 ? 'noise' : 'membrane',
        oscillator: { type: 'sine' },
        envelope: {
          attack: 0.001,
          decay: 0.1,
          sustain: 0,
          release: 0.1
        },
        volume: -20
      });
    }

    return synths;
  }

  private generatePatterns(emotion: EmotionalVector, scale: string[]): PatternDefinition[] {
    const patterns: PatternDefinition[] = [];

    // Bass pattern - rhythmic foundation
    const bassNotes = this.generateBassLine(scale, emotion);
    const bassDurations = this.generateRhythm(emotion, 'bass');
    const bassVelocities = this.generateVelocities(emotion, bassNotes.length);

    patterns.push({
      notes: bassNotes,
      durations: bassDurations,
      velocities: bassVelocities,
      timing: this.generateTiming(emotion, bassNotes.length)
    });

    // Melodic pattern - emotional expression
    if (emotion.complexity > 0.3) {
      const melodyNotes = this.generateMelody(scale, emotion);
      const melodyDurations = this.generateRhythm(emotion, 'melody');
      const melodyVelocities = this.generateVelocities(emotion, melodyNotes.length);

      patterns.push({
        notes: melodyNotes,
        durations: melodyDurations,
        velocities: melodyVelocities,
        timing: this.generateTiming(emotion, melodyNotes.length)
      });
    }

    return patterns;
  }

  private generateBassLine(scale: string[], emotion: EmotionalVector): string[] {
    const root = scale[0];
    const notes: string[] = [];

    // Length based on complexity
    const length = emotion.complexity > 0.5 ? 8 : 4;

    for (let i = 0; i < length; i++) {
      if (emotion.chaos > 0.6 && Math.random() > 0.7) {
        // Chaotic jump
        const index = Math.floor(Math.random() * scale.length);
        notes.push(`${scale[index]}2`);
      } else {
        // Stable progression (root, fifth, fourth)
        const progression = [0, 4, 3, 0]; // Scale degrees
        const degree = progression[i % progression.length];
        notes.push(`${scale[degree]}2`);
      }
    }

    return notes;
  }

  private generateMelody(scale: string[], emotion: EmotionalVector): string[] {
    const notes: string[] = [];
    const length = Math.ceil(4 + emotion.complexity * 12);

    let currentIndex = Math.floor(scale.length / 2);

    for (let i = 0; i < length; i++) {
      // Movement based on emotion
      if (emotion.chaos > 0.5) {
        // Chaotic jumps
        currentIndex = Math.floor(Math.random() * scale.length);
      } else if (emotion.tension > 0.5) {
        // Ascending tension
        currentIndex = Math.min(currentIndex + (Math.random() > 0.5 ? 1 : 0), scale.length - 1);
      } else {
        // Smooth stepwise motion
        const direction = Math.random() > 0.5 ? 1 : -1;
        currentIndex = Math.max(0, Math.min(currentIndex + direction, scale.length - 1));
      }

      const octave = emotion.energy > 0.6 ? 4 : 3;
      notes.push(`${scale[currentIndex]}${octave}`);
    }

    return notes;
  }

  private generateRhythm(emotion: EmotionalVector, type: 'bass' | 'melody'): string[] {
    const durations: string[] = [];
    const length = type === 'bass' ? 8 : 16;

    for (let i = 0; i < length; i++) {
      if (emotion.energy > 0.7 && Math.random() > 0.5) {
        durations.push('8n'); // Faster notes
      } else if (emotion.space > 0.6 && Math.random() > 0.7) {
        durations.push('2n'); // Longer notes
      } else {
        durations.push(type === 'bass' ? '4n' : '8n'); // Standard rhythm
      }
    }

    return durations;
  }

  private generateVelocities(emotion: EmotionalVector, length: number): number[] {
    const velocities: number[] = [];
    const baseVelocity = 0.5 + (emotion.energy * 0.3);

    for (let i = 0; i < length; i++) {
      // Add variation based on chaos
      const variation = (Math.random() - 0.5) * emotion.chaos * 0.3;
      velocities.push(Math.max(0.1, Math.min(1, baseVelocity + variation)));
    }

    return velocities;
  }

  private generateTiming(emotion: EmotionalVector, length: number): number[] {
    const timing: number[] = [];

    for (let i = 0; i < length; i++) {
      // Humanization - slight timing variations
      const humanize = emotion.warmth > 0.5
        ? (Math.random() - 0.5) * 0.02
        : 0;

      // Swing for warmth
      const swing = emotion.warmth > 0.6 && i % 2 === 1
        ? 0.05
        : 0;

      timing.push(humanize + swing);
    }

    return timing;
  }

  /**
   * Generate executable Tone.js code from parameters
   * This is what gets saved and can be mutated
   */
  generateCode(params: MusicParameters): string {
    return `// Generated music code
const synths = [];
const effects = [];

// Create effects chain
const reverb = new Tone.Reverb({
  roomSize: ${params.effects.reverb.roomSize},
  dampening: ${params.effects.reverb.dampening},
  wet: ${params.effects.reverb.wet}
}).toDestination();

const delay = new Tone.FeedbackDelay({
  delayTime: "${params.effects.delay.delayTime}",
  feedback: ${params.effects.delay.feedback},
  wet: ${params.effects.delay.wet}
}).connect(reverb);

// Set tempo
Tone.Transport.bpm.value = ${params.tempo};

// Create synths
${params.synths.map((synth, i) => `
const synth${i} = new Tone.Synth({
  oscillator: ${JSON.stringify(synth.oscillator)},
  envelope: ${JSON.stringify(synth.envelope)},
  volume: ${synth.volume}
}).connect(delay);
synths.push(synth${i});
`).join('')}

// Create patterns
${params.patterns.map((pattern, i) => `
const pattern${i} = new Tone.Part((time, value) => {
  synths[${i % params.synths.length}].triggerAttackRelease(
    value.note,
    value.duration,
    time + value.timing,
    value.velocity
  );
}, ${JSON.stringify(pattern.notes.map((note, idx) => ({
  note,
  duration: pattern.durations[idx],
  velocity: pattern.velocities[idx],
  timing: pattern.timing[idx]
})))});
pattern${i}.loop = true;
pattern${i}.loopEnd = "${params.patterns[0].durations.reduce((a, b) => a + this.durationToSeconds(b), 0)}s";
`).join('')}

// Start playback
Tone.Transport.start();
${params.patterns.map((_, i) => `pattern${i}.start(0);`).join('\n')}
`;
  }

  private durationToSeconds(duration: string): number {
    const map: Record<string, number> = {
      '1n': 4, '2n': 2, '4n': 1, '8n': 0.5, '16n': 0.25
    };
    return map[duration] || 1;
  }

  /**
   * Play the generated music
   */
  async play(params: MusicParameters): Promise<void> {
    await Tone.start();

    // Stop any existing playback
    this.stop();

    // Set tempo
    Tone.Transport.bpm.value = params.tempo;

    // Create effects
    const reverb = new Tone.Reverb(params.effects.reverb.roomSize).toDestination();
    reverb.wet.value = params.effects.reverb.wet;
    await reverb.generate();

    const delay = new Tone.FeedbackDelay({
      delayTime: params.effects.delay.delayTime,
      feedback: params.effects.delay.feedback,
      wet: params.effects.delay.wet
    }).connect(reverb);

    // Create synths
    this.synths = params.synths.map(synthConfig => {
      const synth = new Tone.Synth({
        oscillator: synthConfig.oscillator as any,
        envelope: synthConfig.envelope,
        volume: synthConfig.volume
      }).connect(delay);
      return synth;
    });

    // Create and start patterns
    const events = params.patterns.flatMap((pattern, patternIdx) =>
      pattern.notes.map((note, noteIdx) => ({
        time: noteIdx * 0.5, // Simple timing for now
        note,
        duration: pattern.durations[noteIdx],
        velocity: pattern.velocities[noteIdx],
        synthIndex: patternIdx % this.synths.length
      }))
    );

    this.currentPart = new Tone.Part((time, value) => {
      this.synths[value.synthIndex].triggerAttackRelease(
        value.note,
        value.duration,
        time,
        value.velocity
      );
    }, events);

    this.currentPart.loop = true;
    this.currentPart.loopEnd = '4m';
    this.currentPart.start(0);

    Tone.Transport.start();
    this.isPlaying = true;
  }

  /**
   * Stop playback
   */
  stop(): void {
    if (this.currentPart) {
      this.currentPart.stop();
      this.currentPart.dispose();
      this.currentPart = undefined;
    }

    this.synths.forEach(synth => synth.dispose());
    this.synths = [];

    Tone.Transport.stop();
    this.isPlaying = false;
  }

  /**
   * Check if currently playing
   */
  playing(): boolean {
    return this.isPlaying;
  }
}
