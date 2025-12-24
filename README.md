# The Origin Kernel (Project M.O.M.)

> **"This is no longer a webpage. It is an interactive art installation in a browser."**

A high-end, immersive WebGL interactive birthday experience. The visual language blends organic biology (cells, DNA, heartbeat) with raw computing data.

## 🚀 Live Demo

Experience the project live at: [https://ennceladus.github.io/birthday/](https://ennceladus.github.io/birthday/)

## ✨ Features

- **The Bios-Sequence**: A cinematic loading state with "Genetic Code" cascading and morphing into a 3D Wireframe DNA Helix.
- **The Neural Sanctum**: A procedural particle heart that beats in real-time and reacts to user interaction.
- **Holographic Greetings**: Scroll-synced navigation through digital data nodes containing personalized messages.
- **Compile Joy**: A physics-based finale with a particle explosion transitioning into glowing neon text.

## 🛠 Tech Stack

- **Next.js**: Framework for the core experience.
- **React Three Fiber / Three.js**: For rendering the 3D heart, DNA helix, and particle systems.
- **GLSL Shaders**: Custom shaders for bioluminescent glows and digital rain effects.
- **GSAP**: Cinematic camera transitions.
- **Zustand**: Global state management for scene orchestration.

## 🛠 Development

### Getting Started

Install dependencies:
```bash
npm install
```

Run the development server:
```bash
npm run dev
```

> [!NOTE]
> Since the project is configured with a `basePath` for GitHub Pages, you must access the local site at:
> [http://localhost:3000/birthday](http://localhost:3000/birthday)

### Deployment

This project is configured for static export and is automatically deployed to **GitHub Pages** via GitHub Actions on every push to the `main` branch.

- Configuration: `next.config.mjs` (output: 'export', basePath: '/birthday')
- Workflow: `.github/workflows/deploy.yml`

