# Prompts de arte e áudio (para o ChatGPT)

Uso: cole o **bloco de estilo global** no início de cada conversa/imagem e depois o prompt do asset. Gere, escolha, ajuste à mão (limpar pixels, recortar fundo, reduzir à paleta) e registre cada item em `ASSETS.md` (prompt, data, ferramenta). Tudo será MIT; confira os termos de uso comercial da ferramenta.

Regras para todos os prompts: **não** citar Top Gear, marcas, montadoras, logos ou jogos existentes. Peça sempre fundo transparente ou cor chapada (#FF00FF) para recorte fácil. Pixel art de verdade: peça "no anti-aliasing, no gradients, no blur, hard pixel edges" e depois redimensione com `nearest`.

## Bloco de estilo global (colar sempre)

> Pixel art, retro 16-bit arcade racing game style, original design. Fixed palette of at most 32 colors, saturated retro-futuristic look (hot magenta, electric cyan, sunset orange, deep indigo shadows). Hard pixel edges, no anti-aliasing, no gradients, no blur, no dithering noise, no text or logos, no real-world brands. Flat solid #FF00FF background for easy cutout. Game is a portrait-orientation pseudo-3D pole-position-style racer.

## Carros (vista traseira, pseudo-3D)

**Carro do jogador (3 frames: centro, esquerda, direita)**
> [estilo global] Rear view of a low sleek fictional sports racing car, driving away from camera, as a sprite sheet of 3 frames side by side: straight, leaning left, leaning right (slight body tilt and wheel turn). Each frame 48x32 pixels, car body hot magenta with cyan stripe, visible tail lights and a small rear wing. Same pose and size across frames.

**Rivais (3 variações, 3 frames cada)**
> [estilo global] Three different fictional rival racing cars in rear view, each with 3 frames (straight, lean left, lean right), 48x32 pixels per frame. Rival A: yellow wedge supercar. Rival B: green boxy rally-style car. Rival C: white and red long-nose coupe. Distinct silhouettes and colors, all readable at tiny size.

**Efeitos**
> [estilo global] Sprite sheet of racing effects, 32x32 pixels per frame: nitro flame from exhaust (4 frames, cyan-white to orange), tire smoke puff (4 frames), collision spark burst (4 frames), brake lights glow (2 frames).

## Props de beira de pista (~10)

> [estilo global] Sprite sheet of roadside props for a retro racing game, each on its own cell, side-facing but front-oriented for scaling: palm tree (64x96), pine tree (64x96), street lamp (32x96), big arrow curve sign (64x64, no text, only an arrow shape), billboard frame with abstract geometric art instead of text (96x64), rock cluster (48x32), cactus (48x64), small fictional building (96x96), checkered start/finish banner arch (192x96, no text), bush (48x32).

## Cenário (parallax)

> [estilo global] Seamlessly horizontally tiling parallax background layer, 512x128 pixels: distant mountains and a huge retro-futuristic sunset sun behind a skyline. Provide three separate layers: sky with sun, far mountains, near hills. Transparent between layers.

> [estilo global] Seamless 16x16 pixel tile pair for road: asphalt with alternating light/dark stripe variants, rumble strip red/white variant, grass light/dark variant, sand variant.

## HUD e UI

> [estilo global] Sprite sheet for racing HUD: speedometer digits 0-9 in chunky pixel font (8x12 each), position badge icons 1st to 4th (24x24, using numbers 1-4 only), lap counter icon, three nitro charge icons (full and empty, 16x16), countdown numbers 3, 2, 1 and GO (48x48), pause icon, settings gear icon.

> Ícone do app/PWA: [estilo global] Square app icon 512x512, bold stylized letter U with speed lines and a racing car silhouette, hot magenta and cyan on deep indigo, no other text.

(Fonte de texto: usar uma fonte pixel livre com licença OFL, ex. "Press Start 2P" ou "Silkscreen", e registrar em `ASSETS.md`.)

## Áudio

O ChatGPT não gera áudio final de forma confiável. Use-o para escrever os prompts/partituras e gere o som em outra ferramenta (ou sintetize no próprio jogo com Web Audio). Opções, da mais segura à mais trabalhosa:

1. **Sintetizado no jogo (recomendado para o MVP):** peça ao ChatGPT o código Web Audio.
   > Write a small TypeScript module using the Web Audio API that synthesizes: (a) an engine loop whose pitch and gain follow a speed value 0..1 (sawtooth + low-pass, slight vibrato); (b) nitro whoosh (filtered noise sweep up, 1s); (c) crash thud (short noise burst + low sine drop); (d) countdown beeps (3 low, 1 high); (e) brake squeal (band-passed noise, gain follows brake 0..1). No external files, no copyrighted material, pure oscillators and noise.
2. **Música:** peça composição em texto e gere em ferramenta de música com termos comerciais claros.
   > Compose a looping 90-second synthwave/chiptune racing track, 140 BPM, A minor, driving bassline with arpeggiated lead and punchy drums, original melody, no resemblance to any existing game music, seamless loop. Provide it as MIDI-style note data (JSON: tracks, notes, times) or as a prompt for a music generation tool.

Registrar tudo em `ASSETS.md` e rodar a revisão de IP descrita na seção 7 do `PLAN.md` antes de qualquer lançamento.
