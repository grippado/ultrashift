# Ultrashift: Plano do MVP

> Indie game freely inspired by the Top Gear series from SNES.

## 1. Visão e pilares

**Visão.** Um jogo de corrida 2D com pseudo-3D de pista, com a jogabilidade do Top Gear de SNES, que qualquer pessoa joga no celular com um dedo só. O MVP mira celular. Desktop vem depois, mas a camada de input já nasce abstrata.

**Pilares**
1. **Um polegar, zero menus no meio da corrida.** Aceleração automática. Tudo é gesto.
2. **Sensação de velocidade acima de realismo.** Curvas que empurram, faixas piscando, nitro com peso.
3. **Feel primeiro, conteúdo depois.** Nenhuma arte ou pista extra antes de o controle ser divertido no aparelho real.
4. **Original no que protege.** Mecânica inspirada, nome, arte, som e pistas 100% próprios.
5. **Escopo pequeno, entregas jogáveis.** Todo marco termina com um link que abre no celular.

**Definição de "divertido" (porta do M1).** 3 pessoas fora do projeto jogam 5 minutos seguidos e pedem para jogar de novo.

## 2. Escopo do MVP (v0.1)

**Dentro**
- 1 pista, 3 voltas, largada com contagem 3-2-1.
- 1 jogador + 3 IAs.
- Aceleração automática, steer por arrasto, freio por arrasto para baixo, nitro por duplo toque (3 cargas por corrida).
- Offroad desacelera; batida em rival tira velocidade.
- HUD: velocidade, posição, volta, cargas de nitro.
- Tela de resultado com tempo, reiniciar, melhor tempo em `localStorage` (com fallback se indisponível).
- Tutorial de 3 passos na primeira corrida (gestos são invisíveis).
- Pausa automática ao perder foco, com retomada por contagem.
- Áudio básico: motor, nitro, batida, 1 loop de música.
- PWA instalável.
- Botões virtuais opcionais (nitro, freio) nas configurações.
- Redução de tremor de câmera nas configurações.

**Fora (backlog pós-v0.1)**
- Campeonato, copas, pontos, níveis Fácil/Lenda, 8 carros, IAs com "personalidades".
- Combustível, dano, pit stop, spin-out, ré, pickups de nitro.
- Várias pistas e temas, seleção de carro, garagem, upgrades.
- Editor de pistas, gerador procedural, schema ajv, pipeline automático Aseprite para atlas.
- Teclado, gamepad e mouse completos (só a interface existe; teclado simples opcional em M6 para debug).
- Capacitor, lojas, Tauri, Steam, itch.io.
- Multiplayer em salas (preparado, ver ADR-004; entra no M7), ranking online, monetização, telemetria remota.
- Steer assist, curva ^1.4, âncora flutuante, modo de um toque, HUD espelhado.

## 3. Stack e arquitetura

**Stack.** TypeScript (strict) + Vite + **Canvas 2D puro** atrás de uma interface `Renderer` fina. Sem Pixi, Phaser ou Godot no MVP. Pixi só entra se o profiling em Android de entrada reprovar o Canvas. Testes com Vitest. pnpm como gerenciador (a confirmar, seção 11). Distribuição: PWA no Vercel, com preview por PR para testar no celular via QR code.

**Princípio central.** A simulação é pura: `step(state, input, dt) -> state`. Não conhece DOM, canvas, áudio nem relógio. RNG com semente. Isso permite testes rápidos, replays e regressão.

**Loop.** Simulação fixa a 60 Hz (`dt = 1/60`). Render livre no `requestAnimationFrame`, interpolado por `alpha = acc/dt`. Acumulador com `frameTime` limitado a 0,25 s e máximo de 5 passos por quadro. Gestos usam `event.timeStamp`, não contagem de quadros. Pausa em `visibilitychange`.

**Módulos e dependências (por convenção de pastas, sem lint de fronteiras no MVP)**
- `sim` e `track` não importam `render`, `audio`, `input`, `platform`.
- `render`, `audio`, `input` podem importar tipos de `sim`.
- `game` conecta tudo.

```
ultrashift/
  src/
    shared/    # math, rng, tuning.ts, tipos, event bus
    input/     # types.ts (InputSource, Intent), touch.ts, gestures.ts
    sim/       # state.ts, step.ts, car.ts, nitro.ts, collision.ts, ai.ts
    track/     # tipos, compile.ts, query.ts, tracks/track01.ts
    render/    # renderer.ts, road.ts, sprites.ts, hud.ts, parallax.ts
    audio/     # engine.ts, sfx.ts, unlock.ts
    game/      # loop.ts, states/, save.ts, tutorial.ts
    platform/  # web.ts (safe area, visibilidade, wake lock)
    dev/       # rota /dev/track (preview e mini-mapa), HUD de debug
    main.ts
  public/      # manifest.webmanifest, ícones, áudio, sprites
  tests/       # unit, e2e (smoke)
  docs/        # adr/, GDD de 1 página
  ASSETS.md    # origem e licença de CADA asset
  README.md    # pt-BR + resumo em inglês
  .github/workflows/ci.yml
```

**Contrato de input.** `Intent { steer: -1..1, brake: 0..1, nitro: boolean (edge) }`, amostrado uma vez por tick. A simulação nunca conhece toque, tecla ou gamepad. `InputSource.sample(dt): Intent`. Auto-aceleração mora na simulação.

**CI mínimo.** typecheck, lint, vitest, build. Deploy no Vercel por push, preview por PR. Smoke Playwright (Chromium) só depois do M3. Sem budget de bundle até M5.

## 4. Controles touch

Orientação: **retrato**, decisão do MVP (ADR-001, ver seção 11). Pista na metade superior e central, área do polegar na metade inferior.

**Unidades.** Limiares em milímetros físicos, convertidos via `devicePixelRatio`, com fração da menor dimensão como fallback. Tudo em `tuning.ts`. Valores iniciais, a calibrar em playtest.

**Configuração de página.** `touch-action: none`, `overscroll-behavior: none`, bloqueio de zoom, de seleção e de menu de contexto, `setPointerCapture`, `pointercancel` tratado como soltar. Margem de segurança de borda de 4 mm. Manifest em modo standalone/fullscreen.

**Máquina de estados (ponteiro dono)**

```
IDLE --down--> PRESSED --(move > deadZone ou 120 ms)--> STEERING
STEERING <--histerese (só após steer ativo)--> BRAKING
STEERING/BRAKING --up--> IDLE
```

1. **PRESSED.** O ponto onde o dedo pousa vira a âncora (steer = 0). Passando de `deadZone` (~3 mm) ou 120 ms, vai para STEERING (freio só é avaliado dali em diante).
2. **STEERING.** `steer = clamp((x - anchorX) / steerRange, -1, 1)`, com `steerRange` ~12 mm, zona morta interna pequena, ganho único configurável e suavização leve (one-pole, tau ~40 ms). Ao soltar, o steer decai a 0 em ~80 ms.
3. **BRAKING (leve, só depois do steer ativo).** "Para trás" significa arrasto para **baixo** (em direção ao usuário). O freio só pode entrar depois que o steer já estiver ativo (estado STEERING confirmado, dedo já passou da zona morta lateral), nunca direto de PRESSED. Isso evita freadas acidentais ao pousar o dedo. Entra se `dy > 1,5 * |dx|` e `dy > brakeStart` (~6 mm), com intensidade proporcional e **leve** (desaceleração suave, não trava): `brake = clamp((dy - brakeStart) / brakeRange, 0, 1) * brakeMax`, com `brakeMax` ~0,6 inicialmente. Sai se `dy < ~3 mm` (histerese). Diagonais ambíguas mantêm o estado atual. Durante o freio, o steer continua ativo com peso reduzido (x0,6). Arrasto para cima é ignorado.
4. **Nitro (duplo toque).** Um "tap" é down+up com duração < 220 ms e deslocamento < ~2 mm. Dois taps com intervalo < 280 ms e distância < 40 px (tolerância configurável). Dispara no **segundo pointerdown** (latência mínima). O segundo toque pode seguir como arrasto, então o jogador começa a esterçar sem soltar. Só conta como tap se o dedo ficou dentro da zona morta, então arrastos reais nunca contam.
5. **Steer sem dono durante os dois taps.** Aceito conscientemente: durante um duplo toque o steer fica em 0 por ~0,5 s. O segundo pointerdown vira a nova âncora, sem salto (interpolação de 0 em ~100 ms).
6. **Multi-touch.** Um único ponteiro dono de steer/freio. Dedo secundário: tap = nitro imediato (atalho de duas mãos). Se o dono sobe e outro dedo está presente, re-ancora após 100 ms.
7. **Botões virtuais opcionais** (nitro, freio), ligáveis nas configurações desde o MVP. Zonas de no mínimo 9 mm.
8. **Teste obrigatório no M1.** Arrastar para baixo em iPhone real (Safari e PWA instalada) e em Android real, verificando pull-to-refresh e gestos de borda. Se falhar, o freio migra para gesto lateral secundário ou botão.
9. **Casos de borda.** Início de corrida com dedo já pousado exige novo pointerdown. Perda de foco, ligação, rotação ou notificação pausam e zeram a intenção. Nitro durante invulnerabilidade é permitido.

**Log de gestos.** Em modo debug, grava localmente os eventos e a classificação (steer/freio/nitro, falsos positivos) para calibrar limiares. Sem telemetria remota.

## 5. Física e regras de corrida

**Modelo.** 1D mais lateral: `s` (distância na pista), `x` (lateral, -1..1 na pista), `v` (velocidade). Sem inércia lateral, resposta direta e arcade, com inclinação visual do sprite proporcional ao steer.

| Item | Regra inicial (tudo em `tuning.ts`) |
|---|---|
| Aceleração | `a = accel * (1 - v/vmax)`. Alcança ~80% de vmax em ~6 s |
| Piso de velocidade | `v >= 0,15 * vmax` durante a corrida (decisão consciente: evita parar no celular) |
| Freio | `v -= brakeDecel * dt`, `brakeDecel` ~2x `accel`. Sem ré |
| Steer lateral | `x += steer * steerMax * (0,35 + 0,65 * v/vmax) * dt` |
| Centrífuga | `x -= curvature * (v/vmax)^2 * k * dt`. Freio reduz o empurrão (decisão de risco/recompensa, a alma do Top Gear) |
| Offroad | `|x| > 1`: vmax efetivo cai para 45%, drag extra, tremor leve. Barreira em `|x| > 1,25` com perda de velocidade e reposicionamento suave |
| Nitro | 3 cargas por corrida. Dura 2,0 s, vmax x1,3, accel x1,8. Não empilha. Com 0 cargas: feedback sem penalidade. Pós-nitro: 0,4 s de accel x0,8 |
| Colisão com rival | Quem está atrás perde ~25% de v, empurrão lateral de 0,15, cooldown de 400 ms |
| Sem spin-out | Decisão consciente do MVP |

**Regras de corrida.** 1 jogador + 3 IAs, 3 voltas, pista de 60 a 90 s por volta. Posição = ordenação por `lap * trackLength + s`. Largada parada com contagem 3-2-1; toque de aceleração não existe (automática), então não há "queima". Ao cruzar a linha final, as IAs restantes são projetadas para o resultado imediato.

**IA.** Linha ideal derivada da curvatura (offset lateral alvo = f(curva)) mais ruído lento, velocidade alvo por curva, desvio simples de carros à frente. Rubber-band limitado a +-4% (IA >150 unidades à frente: x0,97; atrás: x1,03), sem teletransporte e sem efeito perto da linha final.

**Juice mínimo (orçamento de "sensação de velocidade").** Faixas de pista alternando cor, zebras, +5% a +10% de FOV no nitro, linhas de velocidade na borda durante o nitro, tremor leve offroad e em batidas (desligável), velocímetro exibido em km/h fictício (~290 no máximo). Nada além disso no MVP.

**Disciplina de calibração.** Primeiro prototipar o modelo acima com UMA pista e sentir. Dificuldades Fácil a Lenda e seus knobs ficam para depois do v0.1.

## 6. Renderização e formato de pista

**Técnica.** Pseudo-3D por projeção de segmentos (estilo OutRun/Top Gear), em Canvas 2D. Descartados: top-down (não tem o feel) e Mode-7 real (difícil de autorar, sem colinas).

- Segmentos de 200 unidades, câmera ~1000 de altura, FOV ~100 graus, 100 a 200 segmentos de draw distance, largura de pista 2000.
- Curvas por curvatura incremental por segmento. Colinas por easing de altura, com clipping `maxY`.
- Parallax em 2 a 3 camadas (céu, montanhas), deslocadas pela curvatura acumulada e pela elevação.
- Sprites escalados por profundidade, ordenados por segmento e recortados pelo clip de colina. Rivais com 3 frames de inclinação (esq/centro/dir).
- Sem alocação por quadro (pools, arrays reutilizados).

**Resolução (junto com orientação).** Base 9:16 (por exemplo 270x480 ou 360x640 internos), escala por altura. O excesso lateral ou superior é preenchido com céu/grama (sem letterbox). Escala fracionária com `nearest` é aceita, com shimmer tolerado. Testar 3 proporções de tela no M1 (16:9, 19,5:9, 20:9 e um tablet).

**Formato de pista (MVP enxuto).** Um arquivo TS tipado com lista de seções, compilada em segmentos no load:

```ts
{ id, name, laps: 3, segmentLength: 200, roadWidth: 2000,
  sections: [ {type:'straight', length}, {type:'curve', enter, hold, exit, curve},
              {type:'hill', enter, hold, exit, height} ],
  props: [ {at, kind, side} ], traffic: [...], }
```

Regra: a pista fecha altura e curvatura em 0 para loop perfeito (checado por um teste Vitest, não por validador de build). A rota `/dev/track` mostra preview com mini-mapa e perfil de elevação, com hot reload. Schema ajv, validador de build, gerador procedural e editor ficam fora até existir a 2ª pista.

## 7. Arte, áudio e estratégia de IP original

**Arte.** Pixel art (paleta fixa de ~32 cores, ramps por tema) em estilo próprio: mais saturado, retro-futurista, carros fictícios. Até o M4 a arte é placeholder geométrico. Escopo de arte v1: 1 carro de jogador, 2 a 3 variações de rival, ~10 props, 1 tema, HUD em fonte pixel livre (OFL). Pipeline manual (Aseprite/Libresprite para PNG), sem automação até a 2ª pista.

**Áudio.** Web Audio. Motor com pitch ligado à velocidade, SFX curtos (OGG/MP3), 1 loop de música (chiptune/synthwave). Desbloqueio no primeiro toque, tela "toque para começar" (política do iOS). Volumes separados de música e SFX.

**Estratégia de IP**
- Nome: "Ultrashift". Nunca usar "Top Gear" em nome, UI, metadata, descrição de loja ou ASO.
- Slogan só no README, com inglês corrigido: *"Indie game freely inspired by the Top Gear series from SNES"*. Na loja (futuro): "arcade racer retrô de 16-bit".
- Gênero e mecânicas (pseudo-3D, nitro, ranking) são livres. O protegido é a expressão: não copiar sprites, sons, músicas, fontes, nomes de pista/carro/cidade, layouts, nem decalcar traçado a partir de ROM ou captura.
- Cidades, carros, marcas e patrocinadores fictícios. Nada de logos de montadoras reais.
- Todo asset registrado em `ASSETS.md` (origem, autor, licença). Só original, CC0 ou CC-BY.
- Se usar ferramentas de IA para arte/música: registrar fonte, conferir termos comerciais, ajustar manualmente.
- Pré-lançamento: revisão de `ASSETS.md`, busca reversa de imagens, checagem do nome "Ultrashift" em INPI/EUIPO/USPTO e domínios.
- Licença: MIT para tudo (código, arte e áudio), por decisão do Gabriel. Conferir os termos da ferramenta de geração e registrar em `ASSETS.md`.

## 8. Marcos

Sem estimativas em dias. Cada marco tem critério de saída. Se o Gabriel informar horas semanais (seção 11), convertemos em faixas.

**M0 - Fundação enxuta**
- Entregas: Vite + TS strict + Vitest + ESLint/Prettier (ou Biome), loop de passo fixo, `InputSource`/`Intent`, CI básico (typecheck, lint, vitest, build), deploy Vercel com preview por PR, README (pt-BR + resumo en), `.gitignore`, `.editorconfig`, ADR-001 a 003 (orientação, stack, input).
- Aceite: um quadrado controlado por toque no celular, via URL pública; CI verde; ADRs commitados.
- Fora: CoC, Renovate, templates elaborados de issue, GitHub Projects.

**M1 - Spike de feel**
- Entregas: pista pseudo-3D (reta, curvas, colina) com parallax, carro placeholder, aceleração automática, gesto de steer, HUD de fps/ms.
- Aceite: uma volta completa no celular real a 60 fps (Android intermediário e iPhone); teste de arrasto para baixo contra pull-to-refresh e gestos de borda feito em iOS e Android; 3 pessoas jogam 5 min e pedem mais. Teste em 3 proporções de tela.
- Se falhar o critério de "divertido": iterar aqui, sem avançar.

**M2 - Freio, nitro e máquina de gestos**
- Entregas: freio, nitro (3 cargas), centrífuga, offroad, histerese e desambiguação, botões virtuais opcionais, log local de gestos.
- Aceite: testes unitários verdes da máquina de gestos (duplo toque vs. toque+arrasto, arrasto diagonal, cancelamento, multi-touch) e da física; checklist de gestos passa em 2+ aparelhos; falso positivo de nitro < 1 por 5 min de direção normal em playtest.

**M3 - Corrida com IA**
- Entregas: 3 IAs, colisões, largada, voltas, posição, HUD completo, resultado, reinício, melhor tempo salvo. Smoke Playwright (Chromium).
- Aceite: corrida de 3 voltas do início ao fim sem travar, IA desafiadora sem trapaça visível; teste de regressão por replay (seed + inputs gravados dão o mesmo tempo final).

**M4 - Arte e áudio**
- Entregas: paleta e sprites v1, props, tema da pista, efeitos de nitro/freio, SFX e música, tela "toque para começar".
- Aceite: todos os assets em `ASSETS.md` com licença; 60 fps mantidos.
- Bloqueado até a decisão de quem faz arte e áudio (seção 11).

**M5 - Polimento e v0.1.0**
- Entregas: menu, tutorial de 3 passos (overlay com dedo animado), pausa/retomada com contagem, PWA instalável e offline, tuning, tratamento de `localStorage` indisponível, acessibilidade mínima (botões virtuais, reduzir tremor, forma + cor em ícones).
- Aceite: checklist de playtest em 3 aparelhos; zero bugs bloqueantes; tag `v0.1.0`; bundle e tempo de carga medidos (meta < 3 s em 4G).

**M6 - Beta (opcional)**
- Entregas: 2ª pista, teclado simples no desktop, feedback de 10+ jogadores.
- Aceite: decisão go/no-go para o próximo ciclo.

## 9. Testes e performance

**Testes**
- **Vitest (maior retorno):** simulação determinística (seed + inputs, estado final), máquina de gestos (sequências sintéticas de pointer events com timestamps), consultas e fechamento de pista, física (vmax com/sem nitro, offroad, centrífuga), colisão.
- **Playwright:** apenas smoke em Chromium, após o M3. WebKit e screenshots depois do v0.1.
- **Playtest em aparelho real:** validação principal, pois emulação não reproduz latência e toque do iPhone. Checklist: polegar único em retrato; arrastar e duplo toque sem conflito; sem zoom, scroll, pull-to-refresh, seleção ou menu de contexto; áudio só após o primeiro toque; perda de foco pausa; notch e safe area; bateria e temperatura após 10 min; Android baixo/médio e iPhone antigo; telas de 5" e 6,7".

**Performance**
- 60 fps em Android intermediário de 3 a 4 anos e iPhone SE/8; alvo de ~10 ms de CPU por quadro.
- Resolução interna baixa e `image-rendering: pixelated`; atlas único de sprites; zero alocação no loop.
- HUD de debug com fps, tempo de sim e de render desde o M1.
- Se o Canvas 2D não atingir 30 a 60 fps em Android de entrada: reduzir draw distance, depois migrar apenas o desenho dos quads para WebGL/Pixi sem mexer na simulação.

## 10. Riscos

| Risco | Mitigação |
|---|---|
| Ambiguidade entre steer, freio e duplo toque | Histerese, zona morta, dominância 1,5x, disparo no 2º pointerdown, log local, botões virtuais opcionais |
| Gesto de arrastar para baixo conflita com pull-to-refresh e gestos de borda do iOS/Android | Standalone/PWA instalada, `overscroll-behavior: none`, margens de borda, teste real no M1; fallback para gesto lateral secundário ou botão |
| Dedo cobre a pista, controle impreciso | Âncora relativa, zona morta, suavização, indicador discreto da âncora (opcional) |
| Gestos invisíveis, ninguém descobre | Tutorial de 3 passos, dedo animado, HUD com cargas de nitro |
| Performance do pseudo-3D em Android de entrada | Resolução interna baixa, draw distance configurável, medir desde o M1 |
| Feel só aparece em aparelho real | Preview por PR via QR code, ciclo de teste no celular desde o M0 |
| Piso de velocidade e ausência de spin-out tiram consequência | Perda de velocidade bem calibrada, rubber-band limitado; revisar após playtest |
| Escopo inflar (campeonato, pistas, dano) | Escopo congelado na seção 2; backlog explícito |
| Autoria de pista à mão tediosa | Rota `/dev/track` com mini-mapa e elevação; ferramental pesado só com 2ª pista |
| Áudio, PWA e fullscreen no iOS Safari | Tela "toque para começar", testes em iPhone real cedo |
| Arte original consome o tempo do dev solo | Placeholders até M4, paleta e escopo de arte fixos |
| IP e marca ("Top Gear" no slogan; nome "Ultrashift" não checado) | Slogan só no README, `ASSETS.md`, checagem de marca antes de lançar |
| Burnout em projeto solo | Marcos curtos, sempre com algo jogável e link no ar |

## Multiplayer (futuro próximo)

Pedido do Gabriel: já deixar a base pronta para salas multiplayer via WebSocket. Detalhes no [ADR-004](docs/adr/004-multiplayer-pronto.md). Resumo: simulação pura e compartilhada (`src/sim`), `Intent` por tick como mensagem de rede, tipos do protocolo em `src/net/protocol.ts`, servidor Node + `ws` autoritativo em `server/` depois do M3, cliente com predição do próprio carro e interpolação dos rivais. Entra como **M7 (Salas online)** depois do v0.1.0.

## 11. Decisões

**Confirmadas pelo Gabriel**
1. **Orientação:** retrato, jogo de uma mão.
2. **Freio:** arrasto para baixo, bem leve, só depois que o steer está ativo (seção 4, item 3).
3. **Aparelhos de teste:** iPhone 17, iPad mini 7, Galaxy S26 Ultra. O M1 valida gestos nos três (incluindo iPad mini em retrato e telas grandes do S26 Ultra, onde os limiares em mm importam).
4. **Arte e áudio:** gerados via ChatGPT a partir de prompts escritos aqui, em `docs/ASSET_PROMPTS.md`. Valem as regras de IA da seção 7 (registrar em `ASSETS.md`, conferir termos comerciais).
5. **Prazo/horas:** N/A, o plano segue por critérios de saída.
6. **Licença:** tudo MIT (código, arte e áudio). Atualizar `ASSETS.md` e conferir que os termos da ferramenta de geração permitem MIT.

**Ainda em aberto (padrão adotado se não houver resposta)**
- Nitro: 3 cargas fixas por corrida.
- Ferramentas: pnpm + Biome.
- Estilo visual: pixel art retrô de baixa resolução.
- Slogan: inglês corrigido, "Top Gear" só no README.
- Vercel como canal de deploy.
- Nome "Ultrashift": checar marca e domínios antes de lançar.
