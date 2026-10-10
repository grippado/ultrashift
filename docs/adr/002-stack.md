# ADR-002: TypeScript + Vite + Canvas 2D

**Status:** aceito. **Decisão:** TypeScript strict, Vite, Canvas 2D atrás de uma interface de renderer fina, Vitest, Biome, npm (pnpm não está instalado no ambiente; trocável). PWA no Vercel. Pixi só entra se o profiling em Android reprovar o Canvas. Simulação pura e de passo fixo (60 Hz) separada de render, áudio e input.
