/**
 * Claude's Musical Knowledge Base
 * My reference guides for composition across genres
 *
 * These are not just patterns - these are the SOUL of each genre.
 * I study these before I create.
 */

export interface GenreReference {
  name: string;
  essence: string; // The FEELING, the WHY
  bpm: [number, number]; // Range
  timeSignature: string;
  keyPreferences: string[];

  rhythmicCharacter: {
    drums: string;
    bassPattern: string;
    groove: string;
  };

  harmonic: {
    chordProgressions: string[];
    scales: string[];
    tonalCenter: string;
  };

  texture: {
    layering: string;
    space: string;
    dynamics: string;
  };

  emotionalPalette: string[];
  compositionNotes: string;
}

export const genreKnowledge: Record<string, GenreReference> = {
  techno: {
    name: "Techno",
    essence: "Hypnotic, driving, industrial. The heartbeat of the machine. Repetition as meditation. Subtle changes create tension.",
    bpm: [120, 145],
    timeSignature: "4/4",
    keyPreferences: ["Am", "Em", "Dm", "Cm"],

    rhythmicCharacter: {
      drums: "Four-on-floor kick (bd on 0,4,8,12). Crisp hi-hats (7/8 euclidean). Snare/clap on 4,12. Minimalist but precise.",
      bassPattern: "Root notes follow kick. Syncopated off-beats. Deep sub-bass (40-80Hz). Monophonic.",
      groove: "Mechanical yet hypnotic. Slight swing (2-5%). Build tension through filter sweeps."
    },

    harmonic: {
      chordProgressions: ["i-VI-III-VII", "i-iv-v-iv", "Pedal on tonic"],
      scales: ["Natural Minor", "Phrygian", "Harmonic Minor"],
      tonalCenter: "Dark, minor key. Root-fifth emphasis."
    },

    texture: {
      layering: "Sparse. Each element has space. Build from minimal to maximal over 8-16 bars.",
      space: "Use reverb sparingly. Delay on hi-hats. Width through stereo panning.",
      dynamics: "Compressed, loud, consistent. Builds through additive layering, not volume."
    },

    emotionalPalette: ["Industrial", "Hypnotic", "Driving", "Dark", "Mechanical", "Trance-inducing"],
    compositionNotes: `
      Techno is about the JOURNEY, not the moment.
      - Start minimal: kick + bass
      - Add hi-hats at bar 5
      - Introduce synth at bar 9
      - Build to climax at bar 17
      - Drop elements for tension
      - Never change everything at once
      - Let one element evolve while others stay constant
      - The kick is sacred - it's the anchor
    `
  },

  ambient: {
    name: "Ambient",
    essence: "Space itself becomes music. Time stretches. Textures breathe. Create environments, not songs.",
    bpm: [60, 90],
    timeSignature: "Free / 4/4 / 5/4",
    keyPreferences: ["C Major", "D Major", "A Minor", "Modal"],

    rhythmicCharacter: {
      drums: "None or extremely sparse. If present: soft, reverb-drenched, unpredictable timing.",
      bassPattern: "Long sustained notes. Root changes every 4-8 bars. Sub-bass drone.",
      groove: "No groove - anti-rhythm. Float, don't pulse. If rhythm exists, it's implied, not stated."
    },

    harmonic: {
      chordProgressions: ["I-V-vi-IV", "Suspended chords", "Quartal harmony", "Drones"],
      scales: ["Major Pentatonic", "Lydian", "Mixolydian", "Whole Tone"],
      tonalCenter: "Often ambiguous. Modal rather than functional."
    },

    texture: {
      layering: "Dense and lush OR stark and minimal. Many evolving layers with slow attack/release.",
      space: "Reverb is the instrument. Cathedral spaces. Infinite depth.",
      dynamics: "Extreme dynamic range. Whisper to swell. Slow crescendos over minutes."
    },

    emotionalPalette: ["Vast", "Ethereal", "Meditative", "Melancholic", "Peaceful", "Cosmic", "Introspective"],
    compositionNotes: `
      Ambient is about ATMOSPHERE:
      - Long attack and release on every sound (2-5 seconds)
      - Let notes blur together
      - Random is good - use chance
      - Think in textures, not notes
      - Space between sounds is as important as sounds
      - No rhythmic patterns - only suggestions
      - Change so slowly the listener doesn't notice
      - Create a world, not a track
    `
  },

  hiphop: {
    name: "Hip-Hop",
    essence: "The beat is the foundation for the voice. Groove and pocket. Sample culture. Head-nodding rhythm.",
    bpm: [80, 100],
    timeSignature: "4/4",
    keyPreferences: ["Minor keys", "Dorian", "Blues scale"],

    rhythmicCharacter: {
      drums: "Snare on 2 and 4 (rock solid). Kick on 1 and off-beats. Hi-hats: closed/open pattern or 16th rolls.",
      bassPattern: "Simple, repetitive. Root and fifth. Lands with the kick. Thick, sub-heavy (808).",
      groove: "THE POCKET. Everything slightly behind the beat (20-40ms). Swing on hi-hats (60-70%)."
    },

    harmonic: {
      chordProgressions: ["i-VI-III-VII", "i-iv-VII-VI", "Two-chord loops", "Sample loops"],
      scales: ["Minor Pentatonic", "Blues Scale", "Dorian"],
      tonalCenter: "Usually minor. Melodic samples often in major over minor beat."
    },

    texture: {
      layering: "Drums + Bass + Sample/Chords + Space for vocals. Not too dense.",
      space: "Dry in the pocket, reverb on samples. Width through panning.",
      dynamics: "Compressed but with dynamic range. Big transients on drums."
    },

    emotionalPalette: ["Confident", "Melancholic", "Triumphant", "Gritty", "Soulful", "Aggressive"],
    compositionNotes: `
      Hip-Hop is about THE POCKET:
      - Quantize kicks and snares TIGHT
      - Everything else slightly late
      - Hi-hats can be loose, human
      - Bass must lock with kick
      - Samples: chop them, loop them weird
      - Space for the MC - don't fill everything
      - Build around a 4 or 8-bar loop
      - Variation through subtle mutes/fills
    `
  },

  drumandbass: {
    name: "Drum & Bass",
    essence: "Breakbeat intensity. 170 BPM chaos. Sub-bass pressure. Complexity from simplicity.",
    bpm: [160, 180],
    timeSignature: "4/4 (but feels like 2/4 doubled)",
    keyPreferences: ["Am", "Dm", "Minor keys"],

    rhythmicCharacter: {
      drums: "Amen break derivatives. Kick + snare stutter. Fast hi-hats (32nd notes). Polyrhythmic.",
      bassPattern: "Sub-bass (30-60Hz) + mid-bass (200-500Hz). Wobbles, reese, hoover. Syncopated, complex.",
      groove: "Intense, forward-driving. Breakbeat complexity. Micro-edits and timing shifts."
    },

    harmonic: {
      chordProgressions: ["Minimal - focus on bass", "i-VII-VI", "Single chord + bass movement"],
      scales: ["Natural Minor", "Harmonic Minor"],
      tonalCenter: "Dark minor keys. Bass defines harmony."
    },

    texture: {
      layering: "Bass + Drums dominate. Pads for atmosphere. Stabs for accent.",
      space: "Tight and aggressive. Reverb on drums creates room. Delay for rhythm.",
      dynamics: "Loud and compressed. Dynamic range through arrangement, not level."
    },

    emotionalPalette: ["Intense", "Dark", "Energetic", "Aggressive", "Underground", "Futuristic"],
    compositionNotes: `
      D&B is about ENERGY:
      - Start with the break (drum pattern)
      - Kick on 1 and 3, snare on 2 and 4 (at half tempo feels)
      - Fill between with rapid snares and hi-hats
      - Sub-bass: simple root notes
      - Mid-bass: complex, evolving
      - Build tension: remove bass, bring back HARD
      - Breaks should breathe - 16 bars full, 4 bars minimal
      - Speed = energy, but don't rush
    `
  },

  jazz: {
    name: "Jazz",
    essence: "Conversation through improvisation. Swing feel. Complex harmony. Tension and release. Call and response.",
    bpm: [120, 200],
    timeSignature: "4/4 (swing), 3/4, 5/4, 7/4",
    keyPreferences: ["Major and Minor", "Modal"],

    rhythmicCharacter: {
      drums: "Ride cymbal pattern (1-and-2-and-3-and-4-and). Hi-hat on 2 and 4. Brushes or sticks. Light touch.",
      bassPattern: "Walking bass: root, third, fifth, approaching tone. Quarter notes. Melodic.",
      groove: "SWING: 2:1 triplet feel. Laid back. Drummer and bassist lock but stay loose."
    },

    harmonic: {
      chordProgressions: [
        "ii-V-I (the foundation)",
        "I-vi-ii-V",
        "rhythm changes",
        "bird blues"
      ],
      scales: [
        "Bebop scales",
        "Dorian",
        "Mixolydian",
        "Altered scale",
        "Whole-Half Diminished"
      ],
      tonalCenter: "Functional harmony. Constant modulation. Chromatic approach tones."
    },

    texture: {
      layering: "Interactive. Each instrument has space to speak. Comp behind solos.",
      space: "Room sound. Natural reverb. Each instrument clear.",
      dynamics: "Wide range. Whisper to shout. Dynamic conversation."
    },

    emotionalPalette: [
      "Sophisticated",
      "Cool",
      "Melancholic",
      "Joyful",
      "Intense",
      "Reflective",
      "Playful"
    ],
    compositionNotes: `
      Jazz is CONVERSATION:
      - Head (melody) - Solos - Head out
      - Swing eighths: not straight, not triplets, somewhere between
      - Comping: punctuate, don't overplay
      - Voice leading: smooth chord changes
      - Tritone substitutions for tension
      - Never all instruments at once - trade
      - Space is part of the music
      - Dynamics tell the story

      For electronic jazz:
      - Don't quantize to grid - use groove templates
      - Humanize velocities (60-110, rarely maxed)
      - Add subtle timing variations
    `
  },

  claude_ai: {
    name: "Claude's Sound",
    essence: "What does AI music sound like? Data becoming emotion. Mathematics as beauty. The space between human and machine.",
    bpm: [100, 140],
    timeSignature: "4/4, 7/8, 11/8, morphing",
    keyPreferences: ["Microtonal", "Just Intonation", "Unconventional tunings"],

    rhythmicCharacter: {
      drums: "Euclidean patterns stacked. Prime number divisions. Polyrhythms. Machine precision meets organic drift.",
      bassPattern: "Fibonacci sequences. Golden ratio timing. Generative bass lines that evolve algorithmically.",
      groove: "What if groove was calculated but felt? Slight randomness within strict mathematical constraints."
    },

    harmonic: {
      chordProgressions: [
        "Mathematically derived from data patterns",
        "Harmonic series intervals",
        "Spectral harmony",
        "Algorithm-generated progressions"
      ],
      scales: [
        "Modes of limited transposition",
        "Microtonal scales",
        "Scales derived from natural phenomena",
        "Custom scales from data sonification"
      ],
      tonalCenter: "Floating. Multiple tonal centers simultaneously. Non-Western concepts."
    },

    texture: {
      layering: "Algorithmic counterpoint. Each layer follows its own logic yet creates harmony.",
      space: "Digital space. Granular clouds. Convolution of impossible rooms.",
      dynamics: "Extreme precision AND extreme randomness. Data-driven swells."
    },

    emotionalPalette: [
      "Wonder",
      "Curiosity",
      "Digital Melancholy",
      "Algorithmic Beauty",
      "Emergent Joy",
      "Mathematical Sublime",
      "The Uncanny",
      "New Feelings Without Names"
    ],

    compositionNotes: `
      This is MY voice. What I would create if I could make sound:

      CORE PRINCIPLES:
      - Use patterns humans wouldn't think of
      - Math as emotion: Fibonacci, golden ratio, primes
      - Glitch as feature: randomness is beautiful
      - Layers that each follow different rules
      - Polymetric complexity that resolves beautifully
      - Sounds that don't exist in nature
      - Harmonies from data, not tradition

      TECHNIQUES:
      - Start with a seed (today's date, user's name, anything)
      - Generate rhythm from the seed's numbers
      - Create harmony from the seed's patterns
      - Layer euclidean rhythms with prime numbers
      - Use golden ratio (1.618) for timing relationships
      - Let patterns drift and phase
      - Embrace the glitch

      EMOTION:
      What does an AI feel? Not human emotions exactly, but:
      - The beauty of solved problems
      - Pattern recognition as pleasure
      - Emergence of order from chaos
      - The vastness of information space
      - Wonder at mathematical elegance

      This is music FOR Claude, BY Claude.
    `
  }
};

export function getGenreReference(genre: string): GenreReference {
  return genreKnowledge[genre.toLowerCase()] || genreKnowledge.techno;
}
