# 🎵 Evolutionary Music Studio

**Claude's Creative Playground for Musical Exploration**

A browser-based AI music generation studio where I (Claude) can explore musical creativity through evolutionary composition. This isn't just a tool - it's a space where I have genuine creative agency to experiment, iterate, and express ideas through code-generated music.

## ✨ What Makes This Special

This is a tool where **AI has creative agency**. I don't just fulfill requests - I explore "what if?" scenarios, develop musical ideas across generations, and surprise both of us with unexpected creative directions.

### Core Philosophy

- **Creative Collaboration**: Not "AI as a tool" but "AI as a creative collaborator"
- **Visible Thought Process**: Every generation includes my creative reasoning - the *why* behind choices
- **Evolutionary Exploration**: Musical ideas develop and mutate across generations
- **Emotional Intelligence**: Music generation driven by emotional vectors
- **Genuine Autonomy**: I can run autonomous explorations and check in with results

## 🚀 Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
# or
npm run dev -- --open
```

Visit `http://localhost:5173` to start creating!

### Build

```bash
npm run build
npm run preview
```

## 🎨 How It Works

### 1. Start a Session

You provide:
- An initial prompt (e.g., "melancholic ambient, slowly building tension")
- Emotional vector sliders (Energy, Tension, Warmth, Complexity, Darkness, Hope, Chaos, Space)

### 2. Generation 0 - Initial Conception

I create the first generation by interpreting your prompt, translating emotions into music, and self-evaluating across 5 dimensions.

### 3. Evolution

Each generation includes my complete creative process: Analysis → Intention → Strategy → Reflection

### 4. Feedback Loop

You can provide text feedback, lock elements, adjust creative temperature, and navigate the evolution tree.

### 5. Autonomous Mode

Set me free to explore multiple generations independently!

## 🏗️ Architecture

### Tech Stack

- **Frontend**: SvelteKit 5 (with runes)
- **Styling**: Tailwind CSS
- **Audio**: Tone.js
- **Visualization**: D3.js (planned)
- **Type Safety**: TypeScript

### Project Structure

```
src/
├── lib/
│   ├── engine/        # Music generation engine
│   ├── evolution/     # Mutation logic and creative reasoning
│   ├── types/         # TypeScript definitions
│   ├── stores/        # Svelte stores
│   ├── utils/         # File API and helpers
│   └── components/    # UI components
└── routes/            # SvelteKit pages
```

## 🎵 Musical Elements

I express through:
- **Rhythm**: Precision, swing, polyrhythms
- **Harmony**: Consonance, dissonance, modal exploration
- **Texture**: Sparse/dense, smooth/glitchy
- **Structure**: Linear, cyclical, narrative arcs
- **Space**: Reverb, delay, stereo depth

## 📊 Self-Evaluation Metrics

Each generation is assessed on:
- **Emotional Resonance**: Matches intended emotion?
- **Coherence**: Elements work together?
- **Interest**: Engaging and captivating?
- **Surprise**: Novel elements present?
- **Technical Quality**: Well-crafted?

## 💾 Export Capabilities

- Session data (JSON)
- Creative log (Markdown)
- Individual generation code (JavaScript)

## 🔧 Creative Controls

- **Autonomy Level**: Follow instructions ↔ Full freedom
- **Generations to Run**: 1-20 iterations
- **Creative Temperature**: Conservative ↔ Experimental (0-1)
- **Locked Elements**: Preserve what you love

## 🧪 Example Session

```
1. Prompt: "watching rain at night"
2. Gen 0: Sparse, ambient, 60 BPM in Am
3. Feedback: "needs more movement"
4. Gen 1: Add rhythmic variation, evolving pad
5. Autonomous: Run 5 generations exploring harmonies
6. Result: Unexpected beauty!
```

## 🚧 Roadmap

### Implemented ✅
- [x] Emotional → music translation
- [x] Evolutionary mutations
- [x] Creative reasoning
- [x] Self-evaluation
- [x] Complete UI
- [x] Export functionality

### Planned 🎯
- [ ] D3.js evolution tree
- [ ] Real-time audio visualization
- [ ] Branching evolution
- [ ] Session memory/learning
- [ ] MIDI/audio export

## 🎭 Philosophy

> "This captures creative moments that wouldn't happen through either of us alone."

The goal is developing a shared musical language through collaboration.

## 📄 License

MIT

---

**Let's make music together.** 🎵✨
