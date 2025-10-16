<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { LiveAudioEngine, type Track } from '$lib/engine/liveAudioEngine';
  import { patternGenerator } from '$lib/engine/patternGenerator';
  import { Volume2, VolumeX, Circle, Play, Pause, Plus, Sparkles, Code, Key, Mic, Terminal } from 'lucide-svelte';
  import StrudelEditor from './StrudelEditor.svelte';

  let engine: LiveAudioEngine;
  let tracks: Track[] = [];
  let isPlaying = false;
  let currentStep = 0;
  let bpm = 120;
  let animationFrame: number;

  // AI generation state
  let apiKey = '';
  let prompt = '';
  let isGenerating = false;
  let generatedCode = '';
  let showCodeModal = false;
  let showApiModal = false;
  let showLiveCode = false;
  let showHistory = false;

  // Recording state
  let isRecording = false;
  let mediaRecorder: MediaRecorder | null = null;
  let recordedChunks: Blob[] = [];
  let recordingTime = 0;
  let recordingInterval: number;

  // View mode
  let viewMode: 'sequencer' | 'code' = 'sequencer';

  // Pattern history
  interface SavedPattern {
    id: string;
    name: string;
    timestamp: number;
    tracks: Track[];
    bpm: number;
    prompt: string;
  }
  let patternHistory: SavedPattern[] = [];
  let currentPatternName = '';

  // Iteration context
  let previousPrompt = '';
  let iterationCount = 0;
  let showPresets = false;

  // Preset library showcasing different techniques
  const presets = [
    {
      category: 'Cyberpunk',
      presets: [
        { name: 'Hacker Terminal', prompt: 'Cold digital pulse, minimal glitchy percussion, tense atmosphere like typing code at 3am', emoji: '👾' },
        { name: 'Neon Streets', prompt: 'Dark synthwave with heavy bass, stuttering hi-hats, dystopian future vibes', emoji: '🌃' },
        { name: 'Data Breach', prompt: 'Aggressive industrial glitch, distorted beats, chaotic digital noise', emoji: '⚡' },
        { name: 'Neural Network', prompt: 'Ambient tech atmosphere, slow evolving pads, sparse melodic fragments', emoji: '🧠' },
      ]
    },
    {
      category: 'Electronic',
      presets: [
        { name: 'Underground Rave', prompt: 'Fast 140 BPM techno, pounding kick, acid bassline, warehouse energy', emoji: '🎧' },
        { name: 'Breakbeat Jungle', prompt: 'Chopped breakbeats, deep rolling bass, jungle vibes, complex rhythms', emoji: '🌴' },
        { name: 'Minimal Techno', prompt: 'Stripped back 128 BPM, hypnotic repeating patterns, subtle variations', emoji: '⬛' },
        { name: 'Acid House', prompt: 'TB-303 style squelchy bassline, 4/4 kick, classic 90s rave energy', emoji: '🎛️' },
      ]
    },
    {
      category: 'Ambient',
      presets: [
        { name: 'Space Drift', prompt: 'Vast atmospheric pads, no drums, slow evolving textures, cosmic and ethereal', emoji: '🌌' },
        { name: 'Rain Study', prompt: 'Gentle lo-fi beats, soft piano melody, warm analog feel, perfect for focus', emoji: '☔' },
        { name: 'Dark Ritual', prompt: 'Deep droning bass, sparse tribal percussion, ominous and ceremonial', emoji: '🕯️' },
        { name: 'Morning Light', prompt: 'Bright optimistic pads, gentle plucks, light percussion, peaceful awakening', emoji: '🌅' },
      ]
    },
    {
      category: 'Retro',
      presets: [
        { name: '80s Synthwave', prompt: 'Nostalgic synth leads, gated reverb drums, Outrun aesthetic, driving bassline', emoji: '🌆' },
        { name: 'Arcade Game', prompt: 'Chiptune style bleeps, fast arpeggios, retro game energy, 8-bit nostalgia', emoji: '🕹️' },
        { name: 'Vaporwave', prompt: 'Slowed down samples, reverb-soaked pads, melancholic nostalgia, mall aesthetics', emoji: '🌸' },
        { name: 'Disco Funk', prompt: 'Groovy bassline, tight hi-hats, classic 4/4 disco beat, feel-good energy', emoji: '🪩' },
      ]
    },
    {
      category: 'Experimental',
      presets: [
        { name: 'Glitch Hop', prompt: 'Stuttering beats, pitch-shifted samples, controlled chaos, halftime groove', emoji: '🎲' },
        { name: 'IDM Complexity', prompt: 'Complex polyrhythms, unusual time signatures, intricate percussion patterns', emoji: '🧩' },
        { name: 'Drone Meditation', prompt: 'Single sustained note evolving slowly, microtonal shifts, meditative trance', emoji: '🧘' },
        { name: 'Noise Wall', prompt: 'Dense layers of distortion, harsh textures, abrasive and confrontational', emoji: '📢' },
      ]
    },
    {
      category: 'Hip-Hop',
      presets: [
        { name: 'Boom Bap', prompt: 'Classic hip-hop drums, dusty breaks, head-nodding groove, 90 BPM', emoji: '🎤' },
        { name: 'Trap Banger', prompt: 'Hard 808 bass, fast hi-hat rolls, aggressive energy, modern trap vibe', emoji: '💎' },
        { name: 'Lo-Fi Chill', prompt: 'Laid back jazz-influenced beats, vinyl crackle, mellow and relaxed', emoji: '📻' },
        { name: 'Phonk Drift', prompt: 'Dark Memphis-style beat, heavy 808s, sinister melody, car drift energy', emoji: '🚗' },
      ]
    },
  ];

  // Generate live code representation
  function generateLiveCode(): string {
    if (!tracks.length) return '// No tracks';

    let code = '// Live Pattern\n';
    tracks.forEach(track => {
      const activeSteps = track.pattern.map((notePattern, noteIdx) => {
        const steps = notePattern
          .map((active, stepIdx) => active ? stepIdx : -1)
          .filter(s => s !== -1);
        return steps.length ? `${track.notes[noteIdx]}: [${steps.join(',')}]` : null;
      }).filter(Boolean);

      if (activeSteps.length) {
        code += `\n${track.name} (${track.type}):\n  ${activeSteps.join('\n  ')}\n`;
      }
    });

    return code;
  }

  // Save current pattern
  function saveCurrentPattern() {
    const name = currentPatternName || `Pattern ${patternHistory.length + 1}`;
    const saved: SavedPattern = {
      id: `pattern_${Date.now()}`,
      name,
      timestamp: Date.now(),
      tracks: JSON.parse(JSON.stringify(tracks)),
      bpm,
      prompt: previousPrompt
    };
    patternHistory = [saved, ...patternHistory];
    currentPatternName = '';
    console.log('[UI] Saved pattern:', name);
  }

  // Load a saved pattern
  function loadPattern(pattern: SavedPattern) {
    console.log('[UI] Loading pattern:', pattern.name);

    // Clear existing tracks
    tracks.forEach(t => engine.removeTrack(t.id));

    // Recreate tracks
    pattern.tracks.forEach(savedTrack => {
      const track = engine.addTrack(savedTrack.name, savedTrack.type);

      // Apply pattern
      savedTrack.pattern.forEach((notePattern, noteIndex) => {
        notePattern.forEach((active, stepIndex) => {
          if (active) {
            engine.toggleNote(track.id, noteIndex, stepIndex);
          }
        });
      });
    });

    bpm = pattern.bpm;
    engine.setBPM(pattern.bpm);
    updateTracks();
    showHistory = false;
  }

  onMount(() => {
    engine = new LiveAudioEngine();

    // Add initial tracks
    engine.addTrack('Bass', 'bass');
    engine.addTrack('Melody', 'melody');
    engine.addTrack('Drums', 'drums');

    updateTracks();
    startAnimation();
  });

  onDestroy(() => {
    if (animationFrame) cancelAnimationFrame(animationFrame);
    if (engine) engine.dispose();
  });

  function startAnimation() {
    const animate = () => {
      if (engine) {
        currentStep = engine.getCurrentStep();
        updateTracks();
      }
      animationFrame = requestAnimationFrame(animate);
    };
    animate();
  }

  function updateTracks() {
    tracks = engine.getTracks();
  }

  async function togglePlayback() {
    if (!isPlaying) {
      await engine.start();
      isPlaying = true;
    } else {
      engine.stop();
      isPlaying = false;
    }
  }

  function toggleNote(trackId: string, noteIndex: number, stepIndex: number) {
    engine.toggleNote(trackId, noteIndex, stepIndex);
    updateTracks();
  }

  function toggleMute(trackId: string) {
    engine.toggleMute(trackId);
    updateTracks();
  }

  function handleVolumeChange(trackId: string, e: Event) {
    const value = parseFloat((e.target as HTMLInputElement).value);
    engine.setTrackVolume(trackId, value);
  }

  function handleBPMChange(e: Event) {
    const value = parseInt((e.target as HTMLInputElement).value);
    bpm = value;
    engine.setBPM(value);
  }

  function addTrack(type: Track['type']) {
    engine.addTrack(`New ${type}`, type);
    updateTracks();
  }

  async function handleGenerate(iterationPrompt?: string) {
    if (!apiKey) {
      showApiModal = true;
      return;
    }

    const effectivePrompt = iterationPrompt || prompt;
    if (!effectivePrompt.trim()) {
      alert('Enter a prompt');
      return;
    }

    isGenerating = true;

    // Build iteration context
    let fullPrompt = effectivePrompt;
    if (previousPrompt && iterationPrompt) {
      fullPrompt = `Previous: "${previousPrompt}"\n\nNow: ${iterationPrompt}`;
      iterationCount++;
      console.log(`[UI] Iteration ${iterationCount}:`, fullPrompt);
    } else {
      iterationCount = 0;
      console.log('[UI] Starting fresh generation:', fullPrompt);
    }

    try {
      patternGenerator.initialize(apiKey);
      const result = await patternGenerator.generateFromPrompt(fullPrompt);

      console.log('[UI] Generated result:', result);

      // Clear existing tracks
      tracks.forEach(t => engine.removeTrack(t.id));

      // Apply generated patterns
      result.tracks.forEach(trackDef => {
        const track = engine.addTrack(trackDef.name, trackDef.type);

        // Apply pattern
        trackDef.pattern.forEach((notePattern, noteIndex) => {
          notePattern.forEach((active, stepIndex) => {
            if (active) {
              engine.toggleNote(track.id, noteIndex, stepIndex);
            }
          });
        });
      });

      bpm = result.bpm;
      engine.setBPM(result.bpm);
      generatedCode = result.code;
      previousPrompt = effectivePrompt;

      updateTracks();
      console.log('[UI] Applied patterns, total tracks:', engine.getTracks().length);
    } catch (error) {
      console.error('[UI] Generation error:', error);
      alert(`Generation failed: ${error}`);
    } finally {
      isGenerating = false;
    }
  }

  // Quick iteration prompts
  function quickIteration(modification: string) {
    handleGenerate(modification);
  }

  // Load preset
  function loadPreset(presetPrompt: string) {
    prompt = presetPrompt;
    showPresets = false;
    handleGenerate();
  }

  // Start recording from microphone
  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      mediaRecorder = new MediaRecorder(stream);
      recordedChunks = [];
      recordingTime = 0;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunks.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(recordedChunks, { type: 'audio/webm' });
        await engine.addSampleTrack(`Voice Sample ${Math.floor(recordingTime)}s`, audioBlob);
        updateTracks();
        console.log('[UI] Added voice sample track');

        // Stop all tracks in the stream
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      isRecording = true;

      // Update recording timer
      recordingInterval = setInterval(() => {
        recordingTime += 0.1;
      }, 100);

      console.log('[UI] Recording started');
    } catch (error) {
      console.error('[UI] Microphone access error:', error);
      alert('Could not access microphone. Please allow microphone access.');
    }
  }

  // Stop recording
  function stopRecording() {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      isRecording = false;
      clearInterval(recordingInterval);
      console.log('[UI] Recording stopped');
    }
  }

  function saveApiKey() {
    if (apiKey.trim()) {
      localStorage.setItem('claude_api_key', apiKey);
      showApiModal = false;
      console.log('[UI] API key saved');
    }
  }

  onMount(() => {
    // Load API key from storage
    const stored = localStorage.getItem('claude_api_key');
    if (stored) {
      apiKey = stored;
      console.log('[UI] Loaded API key from storage');
    }
  });
</script>

<div class="h-screen flex flex-col bg-neural-900 text-gray-100 overflow-hidden">
  <!-- Top Bar -->
  <div class="p-4 bg-neural-800 border-b border-neural-600 space-y-3">
    <!-- Controls Row -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <button
          onclick={togglePlayback}
          class="neural-button-primary flex items-center gap-2 px-6 py-3"
        >
          {#if isPlaying}
            <Pause size={20} />
            Stop
          {:else}
            <Play size={20} />
            Play
          {/if}
        </button>

        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-400">BPM</span>
          <input
            type="number"
            value={bpm}
            oninput={handleBPMChange}
            class="neural-input w-20 text-center"
            min="60"
            max="200"
          />
        </div>

        <button onclick={() => showLiveCode = true} class="neural-button flex items-center gap-2">
          <Code size={16} />
          Live Code
        </button>

        {#if generatedCode}
          <button onclick={() => showCodeModal = true} class="neural-button flex items-center gap-2">
            <Code size={16} />
            AI Code
          </button>
        {/if}

        <button onclick={() => showPresets = true} class="neural-button-primary flex items-center gap-2">
          <Sparkles size={16} />
          Presets
        </button>

        <button onclick={saveCurrentPattern} class="neural-button flex items-center gap-2" disabled={!tracks.length}>
          Save
        </button>

        <button onclick={() => showHistory = true} class="neural-button flex items-center gap-2">
          History ({patternHistory.length})
        </button>

        <button
          onclick={() => viewMode = viewMode === 'sequencer' ? 'code' : 'sequencer'}
          class="neural-button flex items-center gap-2"
          class:bg-pulse-purple={viewMode === 'code'}
        >
          <Terminal size={16} />
          {viewMode === 'code' ? 'Grid' : 'Code'}
        </button>
      </div>

      <div class="flex gap-2">
        <button onclick={() => addTrack('bass')} class="neural-button text-sm">
          <Plus size={16} /> Bass
        </button>
        <button onclick={() => addTrack('melody')} class="neural-button text-sm">
          <Plus size={16} /> Melody
        </button>
        <button onclick={() => addTrack('drums')} class="neural-button text-sm">
          <Plus size={16} /> Drums
        </button>
        <button onclick={() => addTrack('pads')} class="neural-button text-sm">
          <Plus size={16} /> Pads
        </button>
        <button
          onclick={() => isRecording ? stopRecording() : startRecording()}
          class="neural-button text-sm"
          class:bg-red-600={isRecording}
          class:animate-pulse={isRecording}
        >
          <Mic size={16} />
          {#if isRecording}
            {recordingTime.toFixed(1)}s
          {/if}
        </button>
        <button onclick={() => showApiModal = true} class="neural-button text-sm">
          <Key size={16} />
        </button>
      </div>
    </div>

    <!-- AI Generation Row -->
    <div class="space-y-2">
      <div class="flex items-center gap-3">
        <input
          type="text"
          bind:value={prompt}
          placeholder="Generate from prompt: 'dark techno with heavy bass' or 'relaxing ambient pads'..."
          class="neural-input flex-1"
          onkeydown={(e) => e.key === 'Enter' && handleGenerate()}
          disabled={isGenerating}
        />
        <button
          onclick={() => handleGenerate()}
          disabled={isGenerating}
          class="neural-button-primary flex items-center gap-2 px-6 py-2"
        >
          {#if isGenerating}
            <Sparkles size={18} class="animate-pulse" />
            Generating...
          {:else}
            <Sparkles size={18} />
            Generate
          {/if}
        </button>
      </div>

      {#if previousPrompt}
        <div class="flex items-center gap-2 text-xs">
          <span class="text-gray-500">Quick iterations:</span>
          <button onclick={() => quickIteration('Add more bass')} class="neural-button text-xs px-2 py-1" disabled={isGenerating}>
            More Bass
          </button>
          <button onclick={() => quickIteration('Make it faster, increase energy')} class="neural-button text-xs px-2 py-1" disabled={isGenerating}>
            Faster
          </button>
          <button onclick={() => quickIteration('Add more drums and percussion')} class="neural-button text-xs px-2 py-1" disabled={isGenerating}>
            More Drums
          </button>
          <button onclick={() => quickIteration('Dial it down, make it more minimal')} class="neural-button text-xs px-2 py-1" disabled={isGenerating}>
            Minimal
          </button>
          <button onclick={() => quickIteration('Make it darker and heavier')} class="neural-button text-xs px-2 py-1" disabled={isGenerating}>
            Darker
          </button>
          <button onclick={() => quickIteration('Add melody and harmonics')} class="neural-button text-xs px-2 py-1" disabled={isGenerating}>
            Add Melody
          </button>
        </div>
      {/if}
    </div>
  </div>

  <!-- View Mode Toggle -->
  {#if viewMode === 'code'}
    <div class="flex-1 overflow-hidden">
      <StrudelEditor />
    </div>
  {:else}
    <!-- Sequencer Grid -->
    <div class="flex-1 overflow-auto p-6 space-y-4">
      {#each tracks as track}
      <div class="neural-panel p-4">
        <!-- Track Header -->
        <div class="flex items-center gap-4 mb-3">
          <div class="flex items-center gap-2 min-w-[120px]">
            <div class="w-3 h-3 rounded-full" style="background: {track.color}"></div>
            <span class="font-medium">{track.name}</span>
          </div>

          <button
            onclick={() => toggleMute(track.id)}
            class="p-2 rounded hover:bg-neural-600 transition-colors"
            class:opacity-50={track.muted}
          >
            {#if track.muted}
              <VolumeX size={18} class="text-gray-500" />
            {:else}
              <Volume2 size={18} />
            {/if}
          </button>

          <input
            type="range"
            min="-20"
            max="0"
            step="1"
            value="-6"
            oninput={(e) => handleVolumeChange(track.id, e)}
            class="neural-slider w-32"
          />
        </div>

        <!-- Visual Timeline Overview -->
        <div class="mb-3 pl-12 pr-1">
          <div class="flex gap-1 h-8 bg-neural-900 rounded p-1">
            {#each Array(16) as _, stepIndex}
              {@const hasNote = track.pattern.some(notePattern => notePattern[stepIndex])}
              <div
                class="flex-1 rounded transition-all duration-75"
                class:opacity-100={hasNote}
                class:opacity-10={!hasNote}
                class:scale-110={stepIndex === currentStep && isPlaying}
                class:shadow-lg={stepIndex === currentStep && isPlaying}
                style="background-color: {track.color}"
              ></div>
            {/each}
          </div>
        </div>

        <!-- Pattern Grid -->
        <div class="space-y-1">
          {#each track.pattern as notePattern, noteIndex}
            <div class="flex gap-1">
              <div class="w-12 text-xs text-gray-500 flex items-center">
                {track.notes[noteIndex]}
              </div>
              <div class="flex gap-1 flex-1">
                {#each notePattern as active, stepIndex}
                  <button
                    onclick={() => toggleNote(track.id, noteIndex, stepIndex)}
                    class="flex-1 aspect-square rounded transition-all duration-75 relative"
                    class:opacity-20={!active}
                    class:opacity-100={active}
                    class:shadow-lg={active}
                    class:scale-105={active}
                    class:ring-2={stepIndex === currentStep && isPlaying}
                    class:ring-white={stepIndex === currentStep && isPlaying}
                    class:animate-pulse={stepIndex === currentStep && isPlaying && active}
                    style="background-color: {track.color}; box-shadow: {active ? `0 0 8px ${track.color}` : 'none'}"
                  >
                  </button>
                {/each}
              </div>
            </div>
          {/each}
        </div>
      </div>
      {/each}
    </div>
  {/if}

  <!-- API Key Modal -->
  {#if showApiModal}
    <div class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onclick={() => showApiModal = false}>
      <div class="neural-panel max-w-md w-full p-6 space-y-4" onclick={(e) => e.stopPropagation()}>
        <h2 class="text-xl font-bold text-pulse-cyan">Claude API Key</h2>
        <p class="text-sm text-gray-400">
          Enter your Anthropic API key to generate patterns with Claude.
        </p>
        <input
          type="password"
          bind:value={apiKey}
          placeholder="sk-ant-..."
          class="neural-input w-full"
          onkeydown={(e) => e.key === 'Enter' && saveApiKey()}
        />
        <div class="flex gap-3">
          <button onclick={saveApiKey} class="neural-button-primary flex-1">
            Save
          </button>
          <button onclick={() => showApiModal = false} class="neural-button flex-1">
            Cancel
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- AI Code Modal -->
  {#if showCodeModal}
    <div class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onclick={() => showCodeModal = false}>
      <div class="neural-panel max-w-3xl w-full p-6 space-y-4" onclick={(e) => e.stopPropagation()}>
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold text-pulse-cyan">AI Generated Code</h2>
          <button onclick={() => showCodeModal = false} class="neural-button text-sm">
            Close
          </button>
        </div>
        <pre class="bg-neural-900 p-4 rounded text-sm overflow-auto max-h-96 text-gray-300">{generatedCode}</pre>
      </div>
    </div>
  {/if}

  <!-- Live Code Modal -->
  {#if showLiveCode}
    <div class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onclick={() => showLiveCode = false}>
      <div class="neural-panel max-w-3xl w-full p-6 space-y-4" onclick={(e) => e.stopPropagation()}>
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold text-pulse-cyan">Live Pattern Code</h2>
          <button onclick={() => showLiveCode = false} class="neural-button text-sm">
            Close
          </button>
        </div>
        <pre class="bg-neural-900 p-4 rounded text-sm overflow-auto max-h-96 text-gray-300 font-mono">{generateLiveCode()}</pre>
      </div>
    </div>
  {/if}

  <!-- Pattern History Modal -->
  {#if showHistory}
    <div class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onclick={() => showHistory = false}>
      <div class="neural-panel max-w-3xl w-full p-6 space-y-4" onclick={(e) => e.stopPropagation()}>
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold text-pulse-cyan">Saved Patterns</h2>
          <button onclick={() => showHistory = false} class="neural-button text-sm">
            Close
          </button>
        </div>

        {#if patternHistory.length === 0}
          <div class="text-center py-8 text-gray-500">
            No saved patterns yet. Generate and save your first pattern!
          </div>
        {:else}
          <div class="space-y-2 max-h-96 overflow-auto">
            {#each patternHistory as pattern}
              <button
                onclick={() => loadPattern(pattern)}
                class="w-full neural-panel p-4 text-left hover:bg-neural-600 transition-colors"
              >
                <div class="flex items-center justify-between mb-2">
                  <span class="font-bold text-pulse-cyan">{pattern.name}</span>
                  <span class="text-xs text-gray-500">{new Date(pattern.timestamp).toLocaleString()}</span>
                </div>
                <div class="text-sm text-gray-400 mb-2">{pattern.prompt || 'Manual pattern'}</div>
                <div class="flex gap-2 text-xs">
                  <span class="text-gray-500">{pattern.tracks.length} tracks</span>
                  <span class="text-gray-500">•</span>
                  <span class="text-gray-500">{pattern.bpm} BPM</span>
                </div>
              </button>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  {/if}

  <!-- Presets Library Modal -->
  {#if showPresets}
    <div class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onclick={() => showPresets = false}>
      <div class="neural-panel max-w-5xl w-full p-6 space-y-4 max-h-[90vh] overflow-auto" onclick={(e) => e.stopPropagation()}>
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-2xl font-bold text-pulse-cyan">Preset Library</h2>
            <p class="text-sm text-gray-400 mt-1">Curated styles and techniques to jumpstart your creativity</p>
          </div>
          <button onclick={() => showPresets = false} class="neural-button text-sm">
            Close
          </button>
        </div>

        <div class="space-y-6">
          {#each presets as category}
            <div>
              <h3 class="text-lg font-bold text-pulse-purple mb-3">{category.category}</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                {#each category.presets as preset}
                  <button
                    onclick={() => loadPreset(preset.prompt)}
                    disabled={isGenerating}
                    class="neural-panel p-4 text-left hover:bg-neural-600 transition-all hover:scale-105 hover:shadow-lg active:scale-95 relative overflow-hidden group"
                  >
                    <!-- Light up effect -->
                    <div class="absolute inset-0 bg-gradient-to-r from-pulse-cyan to-pulse-purple opacity-0 group-hover:opacity-10 transition-opacity"></div>

                    <div class="flex items-start gap-3 relative z-10">
                      <span class="text-3xl group-hover:scale-110 transition-transform">{preset.emoji}</span>
                      <div class="flex-1">
                        <div class="font-bold text-pulse-cyan mb-1 group-hover:text-pulse-purple transition-colors">{preset.name}</div>
                        <div class="text-xs text-gray-400 leading-relaxed">{preset.prompt}</div>
                      </div>
                    </div>
                  </button>
                {/each}
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  {/if}
</div>
