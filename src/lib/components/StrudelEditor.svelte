<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Play, Pause, Code } from 'lucide-svelte';

  let codeValue = `// Strudel Live Coding
// Note: Full Strudel needs browser context
// This is a placeholder for now

sound("bd sd, hh*4")

// Try:
// note("c a f e").sound("piano")
// sound("hh*8").gain("[.25 1]*4")
// $: sound("bd*4,[~ sd:1]*2")`;

  let isPlaying = false;
  let textarea: HTMLTextAreaElement;
  let errorMessage = '';

  onMount(async () => {
    console.log('[Strudel] Editor mounted - full integration coming soon');
  });

  onDestroy(() => {
    if (isPlaying) {
      isPlaying = false;
    }
  });

  async function togglePlayback() {
    if (isPlaying) {
      isPlaying = false;
      errorMessage = '';
      console.log('[Strudel] Stopped');
    } else {
      try {
        isPlaying = true;
        errorMessage = 'Strudel integration in progress - use the sequencer grid for now!';
        console.log('[Strudel] Would play:', codeValue);

        // TODO: Implement full Strudel integration
        // Need to set up proper audio context and sample loading

        setTimeout(() => {
          isPlaying = false;
        }, 2000);
      } catch (error) {
        console.error('[Strudel] Error:', error);
        errorMessage = `Error: ${error}`;
        isPlaying = false;
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

  <!-- Error/Status Message -->
  {#if errorMessage}
    <div class="bg-neural-800 border-t border-neural-600 p-4 text-sm text-pulse-cyan">
      {errorMessage}
    </div>
  {/if}
</div>

<style>
  textarea::selection {
    background: rgba(74, 158, 255, 0.3);
  }
</style>
