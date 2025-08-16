# Consciousness Stream

A never-ending stream of consciousness generator that creates continuous, schizophrenic-style monologues using AI. The app generates text that sounds coherent but jumps erratically between topics, creating an unsettling yet mesmerizing experience.

## Features

- **Terminal-style UI**: Classic green-on-black terminal aesthetic
- **Continuous generation**: Feeds output back into itself for endless text
- **Local processing**: Runs entirely in your browser using WebGPU
- **Powered by Gemma 3 270M**: Lightweight language model via Transformers.js

## Tech Stack

- React + TypeScript
- Vite
- Transformers.js with WebGPU
- Tailwind CSS

## Requirements

- Modern browser with WebGPU support (Chrome 113+, Edge 113+, or Chrome Canary)
- GPU with WebGPU capabilities

## Installation

```bash
npm install
npm run dev
```

## How It Works

1. The app loads the Gemma 3 270M model into browser memory
2. Once loaded, it begins generating text with a special prompt designed to induce stream-of-consciousness style output
3. Each generation uses the last 200 characters as context for the next generation
4. The process continues indefinitely, creating an endless monologue

## Warning

The generated content is intentionally incoherent and may contain disturbing or nonsensical text patterns. This is an experimental art project exploring the boundaries of AI-generated text.