import * as Tone from 'tone';

/**
 * Live Audio Engine - Real-time, continuously looping audio
 */

export interface Track {
  id: string;
  name: string;
  type: 'bass' | 'melody' | 'drums' | 'pads';
  synth: Tone.PolySynth | Tone.Synth | Tone.MembraneSynth;
  pattern: boolean[][]; // 16 steps x N notes
  notes: string[];
  volume: Tone.Volume;
  effects: Tone.ToneAudioNode[];
  muted: boolean;
  solo: boolean;
  color: string;
}

export class LiveAudioEngine {
  private tracks: Map<string, Track> = new Map();
  private isRunning: boolean = false;
  private currentStep: number = 0;
  private steps: number = 16;
  private bpm: number = 120;
  private mainOut: Tone.Volume;
  private analyzer: Tone.Analyser;

  constructor() {
    this.mainOut = new Tone.Volume(0).toDestination();
    this.analyzer = new Tone.Analyser('waveform', 1024);
    this.mainOut.connect(this.analyzer);

    Tone.Transport.bpm.value = this.bpm;
    Tone.Transport.loop = true;
    Tone.Transport.loopEnd = '1m';
  }

  async start() {
    await Tone.start();

    if (!this.isRunning) {
      Tone.Transport.start();
      this.schedulePatterns();
      this.isRunning = true;
    }
  }

  stop() {
    Tone.Transport.stop();
    this.isRunning = false;
  }

  private schedulePatterns() {
    Tone.Transport.scheduleRepeat((time) => {
      this.currentStep = (this.currentStep + 1) % this.steps;

      this.tracks.forEach(track => {
        if (track.muted) return;

        track.pattern.forEach((notePattern, noteIndex) => {
          if (notePattern[this.currentStep]) {
            const note = track.notes[noteIndex];
            if (track.synth instanceof Tone.MembraneSynth) {
              track.synth.triggerAttackRelease(note, '16n', time);
            } else {
              track.synth.triggerAttackRelease(note, '16n', time);
            }
          }
        });
      });
    }, '16n');
  }

  addTrack(name: string, type: Track['type']): Track {
    const id = `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    let synth: any;
    let notes: string[];
    let color: string;

    switch (type) {
      case 'bass':
        synth = new Tone.Synth({
          oscillator: { type: 'sawtooth' },
          envelope: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.5 }
        });
        notes = ['C2', 'D2', 'E2', 'F2', 'G2', 'A2'];
        color = '#ef4444';
        break;
      case 'melody':
        synth = new Tone.PolySynth(Tone.Synth);
        notes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
        color = '#3b82f6';
        break;
      case 'drums':
        synth = new Tone.MembraneSynth();
        notes = ['C2', 'E2', 'G2', 'C3'];
        color = '#f3f4f6';
        break;
      case 'pads':
        synth = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'sine' },
          envelope: { attack: 0.5, decay: 0.3, sustain: 0.7, release: 2 }
        });
        notes = ['C3', 'E3', 'G3', 'B3', 'D4'];
        color = '#a855f7';
        break;
    }

    const volume = new Tone.Volume(-6);
    const reverb = new Tone.Reverb({ decay: 2, wet: 0.3 });

    synth.chain(volume, reverb, this.mainOut);

    const track: Track = {
      id,
      name,
      type,
      synth,
      pattern: Array(notes.length).fill(null).map(() => Array(this.steps).fill(false)),
      notes,
      volume,
      effects: [reverb],
      muted: false,
      solo: false,
      color
    };

    this.tracks.set(id, track);
    return track;
  }

  removeTrack(id: string) {
    const track = this.tracks.get(id);
    if (track) {
      track.synth.dispose();
      track.volume.dispose();
      track.effects.forEach(fx => fx.dispose());
      this.tracks.delete(id);
    }
  }

  toggleNote(trackId: string, noteIndex: number, stepIndex: number) {
    const track = this.tracks.get(trackId);
    if (track) {
      track.pattern[noteIndex][stepIndex] = !track.pattern[noteIndex][stepIndex];
    }
  }

  setTrackVolume(trackId: string, volume: number) {
    const track = this.tracks.get(trackId);
    if (track) {
      track.volume.volume.value = volume;
    }
  }

  toggleMute(trackId: string) {
    const track = this.tracks.get(trackId);
    if (track) {
      track.muted = !track.muted;
    }
  }

  toggleSolo(trackId: string) {
    const track = this.tracks.get(trackId);
    if (track) {
      track.solo = !track.solo;

      // Mute all other tracks if solo is on
      this.tracks.forEach(t => {
        if (t.id !== trackId) {
          t.muted = track!.solo;
        }
      });
    }
  }

  setBPM(bpm: number) {
    this.bpm = bpm;
    Tone.Transport.bpm.value = bpm;
  }

  getCurrentStep(): number {
    return this.currentStep;
  }

  getTracks(): Track[] {
    return Array.from(this.tracks.values());
  }

  getAnalyzerData(): Uint8Array {
    return this.analyzer.getValue() as Uint8Array;
  }

  dispose() {
    this.stop();
    this.tracks.forEach(track => {
      track.synth.dispose();
      track.volume.dispose();
      track.effects.forEach(fx => fx.dispose());
    });
    this.tracks.clear();
    this.mainOut.dispose();
    this.analyzer.dispose();
  }
}
