# Ultrashift

Indie game freely inspired by the Top Gear series from SNES.

Jogo de corrida 2D retrô, pseudo-3D, para celular (retrato, uma mão). Aceleração automática, arraste para esterçar, arraste para baixo para frear de leve, toque duplo para nitro.

*EN: a simple one-thumb retro racer for mobile (portrait). Auto-accelerate, drag to steer, light drag-down to brake, double-tap for nitro. Multiplayer rooms planned.*

## Rodar

```bash
npm install
npm run dev        # abre em rede local: acesse pelo IP do PC no celular
npm test           # vitest
npm run lint       # biome
npm run build
```

## Estado

M0 (fundação): carro placeholder controlado por gestos de toque, simulação pura e testada, CI. Veja o [`PLAN.md`](PLAN.md) e os [ADRs](docs/adr/).

Prompts para gerar arte: [`docs/ASSET_PROMPTS.md`](docs/ASSET_PROMPTS.md).

## Licença

MIT, incluindo código, arte e áudio (ver `ASSETS.md`).
