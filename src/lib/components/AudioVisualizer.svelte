<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { LiveAudioEngine } from '$lib/engine/liveAudioEngine';

  let { engine }: { engine: LiveAudioEngine } = $props();

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let animationFrame: number;

  onMount(() => {
    if (canvas) {
      ctx = canvas.getContext('2d')!;
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      startVisualization();
    }
  });

  onDestroy(() => {
    if (animationFrame) cancelAnimationFrame(animationFrame);
  });

  function startVisualization() {
    const draw = () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;

      // Clear with fade effect
      ctx.fillStyle = 'rgba(10, 10, 15, 0.2)';
      ctx.fillRect(0, 0, width, height);

      // Get waveform data
      const dataArray = engine.getAnalyzerData();
      const bufferLength = dataArray.length;
      const sliceWidth = width / bufferLength;

      // Draw waveform
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#4a9eff';
      ctx.beginPath();

      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.stroke();

      // Draw frequency bars
      const barCount = 32;
      const barWidth = width / barCount;
      const barSpacing = 2;

      for (let i = 0; i < barCount; i++) {
        const index = Math.floor((i / barCount) * bufferLength);
        const value = Math.abs(dataArray[index] - 128) / 128;
        const barHeight = value * height * 0.8;

        // Gradient color based on frequency
        const hue = (i / barCount) * 180 + 180; // Blue to purple range
        ctx.fillStyle = `hsla(${hue}, 70%, 60%, 0.6)`;

        const x = i * barWidth;
        const y = height - barHeight;

        ctx.fillRect(
          x + barSpacing / 2,
          y,
          barWidth - barSpacing,
          barHeight
        );
      }

      animationFrame = requestAnimationFrame(draw);
    };

    draw();
  }
</script>

<canvas
  bind:this={canvas}
  class="w-full h-full"
  style="image-rendering: crisp-edges;"
></canvas>
