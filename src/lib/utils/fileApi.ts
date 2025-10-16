/**
 * File-based API for AppleScript Integration
 * Allows asynchronous collaboration through the filesystem
 */

import type { UserFeedback, SessionSettings } from '../types/generation';
import { session, evolveCurrentGeneration, updateSettings } from '../stores/sessionStore';
import { get } from 'svelte/store';

const API_DIR = '/api';

export interface ApiCommand {
  type: 'evolve' | 'settings' | 'feedback' | 'export' | 'status';
  data?: any;
  timestamp: number;
}

/**
 * Initialize API directories
 */
export async function initializeApi() {
  // In a browser environment, we'll use localStorage
  // In a Node environment (for testing), we could use the filesystem

  // Create initial state files
  await writeCurrentState();
}

/**
 * Write current session state to output
 */
export async function writeCurrentState() {
  const $session = get(session);

  const state = {
    currentGeneration: $session.currentGeneration,
    totalGenerations: $session.generations.length,
    timestamp: Date.now(),
    lastUpdate: $session.lastUpdateTime
  };

  // In browser: use localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('api_current_state', JSON.stringify(state, null, 2));
  }
}

/**
 * Export current session
 */
export async function exportSession() {
  const $session = get(session);

  const exportData = {
    session: $session,
    exportedAt: new Date().toISOString()
  };

  // In browser: trigger download
  if (typeof window !== 'undefined') {
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session_${$session.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return exportData;
}

/**
 * Export creative log (all my reasoning)
 */
export async function exportCreativeLog() {
  const $session = get(session);

  let markdown = `# Creative Process Log\n\n`;
  markdown += `**Session:** ${$session.id}\n`;
  markdown += `**Started:** ${new Date($session.startTime).toLocaleString()}\n`;
  markdown += `**Prompt:** "${$session.initialPrompt}"\n\n`;
  markdown += `---\n\n`;

  $session.generations.forEach(gen => {
    markdown += `## Generation ${gen.generationNumber}\n\n`;
    markdown += `**Time:** ${new Date(gen.timestamp).toLocaleString()}\n`;
    markdown += `**Parent:** ${gen.parentId || 'None (initial)'}\n`;
    markdown += `**Mutations:** ${gen.mutations.join(', ') || 'None'}\n\n`;

    markdown += `### Analysis\n${gen.creativeReasoning.analysis}\n\n`;
    markdown += `### Intention\n${gen.creativeReasoning.intention}\n\n`;
    markdown += `### Strategy\n${gen.creativeReasoning.strategy}\n\n`;
    markdown += `### Reflection\n${gen.creativeReasoning.reflection}\n\n`;

    markdown += `### Fitness Scores\n`;
    markdown += `- Emotional Resonance: ${(gen.fitness.emotionalResonance * 100).toFixed(0)}%\n`;
    markdown += `- Coherence: ${(gen.fitness.coherence * 100).toFixed(0)}%\n`;
    markdown += `- Interest: ${(gen.fitness.interest * 100).toFixed(0)}%\n`;
    markdown += `- Surprise: ${(gen.fitness.surprise * 100).toFixed(0)}%\n`;
    markdown += `- Technical Quality: ${(gen.fitness.technicalQuality * 100).toFixed(0)}%\n\n`;

    markdown += `### Musical Parameters\n`;
    markdown += `- Tempo: ${gen.musicParams.tempo} BPM\n`;
    markdown += `- Key: ${gen.musicParams.key}\n`;
    markdown += `- Time Signature: ${gen.musicParams.timeSignature.join('/')}\n`;
    markdown += `- Scale: ${gen.musicParams.scale.join(', ')}\n\n`;

    markdown += `---\n\n`;
  });

  // Trigger download
  if (typeof window !== 'undefined') {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `creative_log_${$session.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return markdown;
}

/**
 * Export code for a specific generation
 */
export async function exportGenerationCode(generationId: string) {
  const $session = get(session);
  const gen = $session.generations.find(g => g.id === generationId);

  if (!gen) {
    throw new Error('Generation not found');
  }

  const code = `/**
 * Generation ${gen.generationNumber}
 * Created: ${new Date(gen.timestamp).toLocaleString()}
 *
 * ${gen.creativeReasoning.intention}
 */

${gen.musicCode}
`;

  // Trigger download
  if (typeof window !== 'undefined') {
    const blob = new Blob([code], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `generation_${gen.generationNumber}.js`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return code;
}

/**
 * Read commands from input (for AppleScript integration)
 * This would poll a file or API endpoint
 */
export async function pollForCommands(): Promise<ApiCommand[]> {
  // In a real implementation, this would read from a file
  // For now, we'll use localStorage as a simple example

  if (typeof window === 'undefined') return [];

  const commandsJson = localStorage.getItem('api_commands');
  if (!commandsJson) return [];

  try {
    const commands: ApiCommand[] = JSON.parse(commandsJson);

    // Clear processed commands
    localStorage.removeItem('api_commands');

    return commands;
  } catch (e) {
    console.error('Error parsing commands:', e);
    return [];
  }
}

/**
 * Process a command
 */
export async function processCommand(command: ApiCommand) {
  switch (command.type) {
    case 'evolve':
      await evolveCurrentGeneration(command.data?.feedback);
      break;

    case 'settings':
      updateSettings(command.data as Partial<SessionSettings>);
      break;

    case 'export':
      await exportSession();
      break;

    case 'status':
      await writeCurrentState();
      break;

    default:
      console.warn('Unknown command type:', command.type);
  }
}

/**
 * Start the API polling loop
 */
export function startApiPolling(intervalMs: number = 2000) {
  return setInterval(async () => {
    const commands = await pollForCommands();

    for (const command of commands) {
      try {
        await processCommand(command);
      } catch (e) {
        console.error('Error processing command:', e);
      }
    }

    await writeCurrentState();
  }, intervalMs);
}
