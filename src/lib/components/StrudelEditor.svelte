<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { repl } from '@strudel/core';
  import { webaudioOutput } from '@strudel/webaudio';
  import { Play, Pause, Code } from 'lucide-svelte';

  let codeValue = `// Live code with Strudel!
// Edit and press Ctrl+Enter to play

sound("bd sd, hh*4")
  .slow(2)

// Try these:
// note("c a f e")
//   .sound("piano")
//   .slow(4)

// sound("hh*8")
//   .gain("[.25 1]*4")`;

  let isPlaying = false;
  let strudelRepl: any = null;
  let textarea: HTMLTextAreaElement;

  onMount(async () => {
    // Initialize Strudel REPL
    strudelRepl = await repl({
      transpiler: (code: string) => code,
      getTime: () => performance.now() / 1000,
      setInterval,
      clearInterval,
      onUpdateError: (e: any) => {
        console.error('[Strudel] Error:', e);
      }
    });

    console.log('[Strudel] REPL initialized');
  });

  onDestroy(() => {
    if (strudelRepl) {
      strudelRepl.stop();
    }
  });

  async function togglePlayback() {
    if (!strudelRepl) return;

    if (isPlaying) {
      await strudelRepl.stop();
      isPlaying = false;
      console.log('[Strudel] Stopped');
    } else {
      try {
        await strudelRepl.evaluate(codeValue);
        isPlaying = true;
        console.log('[Strudel] Playing:', codeValue);
      } catch (error) {
        console.error('[Strudel] Playback error:', error);
        alert(`Strudel error: ${error}`);
      }
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      togglePlayback();
    }

    // Tab support
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      codeValue = codeValue.substring(0, start) + '  ' + codeValue.substring(end);
      textarea.selectionStart = textarea.selectionEnd = start + 2;
    }
  }
</script>

<div class="h-full flex flex-col bg-neural-900">
  <!-- Header -->
  <div class="p-4 bg-neural-800 border-b border-neural-600 flex items-center justify-between">
    <div class="flex items-center gap-3">
      <Code size={20} class="text-pulse-cyan" />
      <h3 class="font-bold text-pulse-cyan">Live Code Editor</h3>
      <span class="text-xs text-gray-500">Ctrl+Enter to play</span>
    </div>

    <button
      onclick={togglePlayback}
      class="neural-button-primary flex items-center gap-2 px-6 py-2"
    >
      {#if isPlaying}
        <Pause size={18} />
        Stop
      {:else}
        <Play size={18} />
        Play
      {/if}
    </button>
  </div>

  <!-- Code Editor -->
  <textarea
    bind:this={textarea}
    bind:value={codeValue}
    onkeydown={handleKeyDown}
    class="flex-1 bg-neural-900 text-gray-100 p-6 font-mono text-sm resize-none focus:outline-none"
    placeholder="Enter Strudel code..."
    spellcheck="false"
  ></textarea>
</div>

<style>
  textarea::selection {
    background: rgba(74, 158, 255, 0.3);
  }
</style>
