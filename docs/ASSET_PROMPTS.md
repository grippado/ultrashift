# Prompts de arte e áudio (ChatGPT)

**Como usar:** abra **uma conversa só** para a arte. Cole o **Bloco 0** primeiro (estilo) e o **Bloco 0B** logo depois (câmera e perspectiva). Depois cole **um bloco por mensagem**, na ordem. Escolha a melhor imagem, baixe o PNG e traga aqui (o nome do arquivo = número do bloco, ex. `01-player-car.png`). Eu converto para a resolução final do jogo (reduzo com `nearest`, quantizo na paleta e recorto o fundo magenta) com um script. Por isso **não precisa ser pixel-perfeito no tamanho**: o ChatGPT tende a gerar imagens grandes; o que importa é o estilo e a leitura da silhueta.

Regras: nada de Top Gear, marcas, montadoras ou logos. Tudo vai para `ASSETS.md` (prompt, data, ferramenta). Licença MIT.

---

## Bloco 0 — Estilo (cole primeiro, sozinho)

```
Vamos criar assets de arte para um jogo de corrida mobile retrô, original. Memorize este estilo e aplique em todas as imagens que eu pedir a seguir:
- Pixel art 16-bit estilo corrida arcade pseudo-3D (tipo Pole Position/OutRun, mas com design 100% original).
- Paleta fixa de no máximo 32 cores, saturada e retro-futurista: magenta quente, ciano elétrico, laranja de pôr do sol, sombras em índigo profundo.
- Bordas duras de pixel, SEM anti-aliasing, SEM gradientes suaves, SEM blur, SEM ruído de dithering.
- Sem texto, sem letras, sem logos, sem marcas reais, sem referência a nenhum jogo existente.
- Fundo SEMPRE de cor chapada #FF00FF (magenta puro), sem sombras projetadas no fundo, para recorte fácil.
- Jogo em retrato (vertical). Os sprites são vistos por TRÁS (câmera atrás do carro).
Responda apenas "ok" e espere meu próximo pedido.
```

## Bloco 1 — Carro do jogador

```
Gere uma folha de sprites com o carro do jogador: um carro esportivo de corrida fictício, baixo e aerodinâmico, visto por trás, indo na direção oposta à câmera. 3 quadros lado a lado, mesma escala e mesma pose base: (1) reto, (2) inclinado à esquerda (carroceria inclinada, rodas esterçadas), (3) inclinado à direita. Corpo magenta quente com faixa ciano, lanternas traseiras vermelhas visíveis, aerofólio pequeno. Proporção de cada quadro 3:2 (largo). Deve ser legível mesmo em tamanho minúsculo (48x32 px). Siga o estilo combinado.
```

## Bloco 2A — Rival A

```
Gere uma folha de sprites com 3 quadros lado a lado de um carro rival fictício visto por trás: (1) reto, (2) inclinado à esquerda, (3) inclinado à direita. Design: supercarro em cunha, amarelo com detalhes em índigo. Silhueta bem diferente do carro magenta do jogador. Proporção de cada quadro 3:2. Siga o estilo combinado.
```

## Bloco 2B — Rival B

```
Gere uma folha de sprites com 3 quadros lado a lado de um carro rival fictício visto por trás: (1) reto, (2) inclinado à esquerda, (3) inclinado à direita. Design: carro de rali quadrado e robusto, verde com detalhes laranja, rack de faróis no teto. Proporção de cada quadro 3:2. Siga o estilo combinado.
```

## Bloco 2C — Rival C

```
Gere uma folha de sprites com 3 quadros lado a lado de um carro rival fictício visto por trás: (1) reto, (2) inclinado à esquerda, (3) inclinado à direita. Design: cupê de nariz longo, branco com listras vermelhas. Proporção de cada quadro 3:2. Siga o estilo combinado.
```

## Bloco 3 — Efeitos (NÃO usar; feito em código)

Testamos um sheet de efeitos gerado pelo ChatGPT e não serviu: chama de perfil com cano do escapamento, fumaça de perfil em tamanhos diferentes, faíscas cortadas, lanternas borradas e grade irregular. Como a câmera fica atrás do carro, a chama e a fumaça vêm na direção do jogador, o que a IA não acerta bem. Nitro, fumaça de pneu/poeira, faíscas de colisão e brilho das lanternas de freio agora são **partículas em pixel desenhadas pelo jogo** (`src/render/fx.ts`), na mesma paleta, e reagem à velocidade e ao freio. Pule este bloco.

## O que fez os carros darem certo (e o que repetir nos outros blocos)

O Bloco 1 funcionou porque dizia **de onde a câmera olha** ("vista por trás, indo na direção oposta à câmera"), **quantos quadros** e **o que muda entre eles**. Os blocos de efeitos falharam porque não diziam isso. Regra para tudo que vem abaixo: sempre explicar a câmera, o ângulo exato do objeto, o tamanho fixo da célula e onde fica o "chão" do objeto.

## Bloco 0B — Câmera e perspectiva (colar logo depois do Bloco 0, sozinho)

```
Antes das próximas imagens, entenda como o jogo é visto. É um jogo de corrida com o efeito "3D falso" dos jogos de SNES (Top Gear, Pole Position, OutRun):
- A câmera fica BAIXA e ATRÁS do carro, olhando para a frente, na direção do horizonte. O horizonte fica a cerca de 40% da altura da tela.
- A estrada é um trapézio: larga embaixo, estreita no ponto de fuga do horizonte. Ela sobe e desce colinas e faz curvas, mas é gerada por código. Eu NÃO preciso que você desenhe a estrada.
- Tudo que fica ao lado da estrada (árvores, placas, prédios, arcos) são sprites 2D "em pé", como cartazes sempre virados DE FRENTE para a câmera. O jogo os escala (pequeno ao longe, grande perto). Por isso cada objeto deve ser desenhado vista frontal reta, sem perspectiva de 3/4, sem ver o topo do objeto, sem sombra projetada no chão, com a BASE do objeto tocando a borda inferior da sua célula.
- O céu e as montanhas do fundo são camadas planas e distantes, vistas de frente, sem perspectiva.
- Nada tem texto, letras, logos ou marcas, exceto quando eu pedir.
Responda apenas "ok" e espere meu próximo pedido.
```

## Bloco 4A — Vegetação de beira de pista

```
Gere UMA imagem com uma folha de sprites de vegetação de beira de pista, em grade de 5 colunas x 1 linha. Todas as 5 células têm o mesmo tamanho (quadradas), com bastante espaço magenta entre elas, nunca se tocando. Cada objeto está CENTRADO na célula, VISTO DE FRENTE (reto, sem 3/4, sem ver o topo), com a BASE (tronco/raiz) tocando a borda inferior da célula, sem sombra no chão. Objetos, da esquerda para a direita: (1) palmeira alta e fina, (2) pinheiro cônico, (3) árvore redonda de copa larga, (4) cacto com dois braços, (5) arbusto baixo e largo. Alturas diferentes e legíveis mesmo bem pequenos. Siga o estilo e a perspectiva combinados.
```

## Bloco 4B — Placas, outdoors e sinalização

```
Gere UMA imagem com uma folha de sprites de sinalização de beira de pista, em grade de 5 colunas x 1 linha, todas as células do mesmo tamanho (quadradas), com espaço magenta entre elas. Cada objeto CENTRADO, VISTO DE FRENTE reta, com os pés/postes tocando a borda inferior da célula, sem sombra. Da esquerda para a direita: (1) placa grande de curva à direita: painel amarelo com uma seta preta curvada, em dois postes (sem texto), (2) placa grande de curva à esquerda, espelhada, (3) outdoor retangular largo em moldura metálica com arte geométrica abstrata colorida (sem texto), (4) poste de luz alto, (5) fileira de 3 cones de trânsito laranja e branco. Siga o estilo e a perspectiva combinados.
```

## Bloco 4C — Estruturas grandes

```
Gere UMA imagem com uma folha de sprites de estruturas grandes de beira de pista, em grade de 3 colunas x 1 linha, células do mesmo tamanho (largas, proporção 3:2), com espaço magenta entre elas. Cada objeto CENTRADO, VISTO DE FRENTE reta, com a base tocando a borda inferior da célula, sem sombra. Da esquerda para a direita: (1) arco de largada/chegada quadriculado que atravessa a estrada (dois pilares e uma viga no alto, sem texto, com o vão central vazio e transparente em magenta), (2) prédio fictício de 4 andares com janelas acesas em ciano e laranja, (3) arquibancada pequena com público em silhuetas coloridas. Siga o estilo e a perspectiva combinados.
```

## Bloco 5A — Céu com sol (camada de fundo)

```
Gere UMA imagem larga, proporção 4:1, de uma camada de céu para um jogo de corrida: pôr do sol retro-futurista em faixas horizontais de cor chapada, do índigo escuro no topo, passando por roxo e magenta, até laranja quente na linha do horizonte, na borda inferior da imagem. Um sol enorme, parcialmente cortado pela borda inferior, com faixas horizontais finas cortando o sol (estilo synthwave). Vista totalmente frontal e plana, sem perspectiva, sem nuvens. A imagem se repete sem emenda na horizontal. Não use fundo magenta neste pedido. Siga o estilo combinado nos demais aspectos.
```

## Bloco 5B — Montanhas distantes

```
Gere UMA imagem larga, proporção 4:1, com uma silhueta de cadeia de montanhas distantes para o fundo de um jogo de corrida: formas escuras em índigo (#1a1040) com 2 tons para dar profundidade (cumes de trás um pouco mais claros), vista totalmente frontal e plana, sem perspectiva. A base das montanhas toca a borda inferior da imagem (linha do horizonte) e o resto acima é magenta chapado #FF00FF, que será removido. A silhueta se repete sem emenda: a borda esquerda e a direita têm a mesma altura. Siga o estilo combinado.
```

## Bloco 5C — Skyline distante (opcional)

```
Gere UMA imagem larga, proporção 4:1, com uma silhueta de skyline de cidade retro-futurista distante, para o fundo de um jogo de corrida: prédios em índigo escuro com janelinhas acesas em ciano e magenta, vista totalmente frontal e plana, sem perspectiva. A base toca a borda inferior da imagem e o resto acima é magenta chapado #FF00FF, que será removido. Repete sem emenda na horizontal. Siga o estilo combinado.
```

## Bloco 6 — Mockup de referência da tela (só referência de cor e clima)

```
Gere UMA imagem vertical 9:16 que seja um mockup de uma tela de gameplay de um jogo de corrida arcade pseudo-3D de SNES, só como referência de arte, sem interface. Composição: horizonte a 40% da altura da tela; céu de pôr do sol retro-futurista com montanhas distantes em silhueta; estrada de asfalto escuro com faixas alternadas de tom, dois tracejados brancos separando 3 pistas e zebras vermelhas e brancas nas bordas, em forma de trapézio que converge para o horizonte, fazendo uma curva suave para a direita e subindo uma colina; grama verde em faixas alternadas dos dois lados; alguns props de beira de pista escalados pela distância (palmeiras, uma placa de curva, um outdoor); um carro esportivo magenta com faixa ciano visto de trás, grande, na parte de baixo da tela. Pixel art 16-bit, mesma paleta e estilo combinados, SEM fundo magenta neste pedido.
```

## Bloco 7A — HUD: dígitos e contagem

```
Gere UMA imagem com uma folha de sprites planos de interface (2D reto, sem perspectiva), grade de células quadradas idênticas com espaço magenta entre elas. Linha 1: os dígitos 0 1 2 3 4 5 6 7 8 9 numa fonte pixel grossa e legível, em branco com contorno índigo. Linha 2: contagem de largada "3", "2", "1" e "GO" em pixel art grande, amarelo e laranja com contorno. Nenhum outro texto. Siga o estilo combinado.
```

## Bloco 7B — HUD: ícones

```
Gere UMA imagem com uma folha de sprites planos de interface (2D reto, sem perspectiva), grade de 4 colunas x 2 linhas de células quadradas idênticas, com espaço magenta entre elas, ícones sem texto: (1) selo de posição 1º (taça dourada), (2) selo de posição 2º (prata), (3) selo de posição 3º (bronze), (4) ícone de bandeira quadriculada para voltas; (5) carga de nitro cheia (raio ciano brilhante), (6) carga de nitro vazia (raio cinza escuro), (7) ícone de pausa, (8) ícone de engrenagem. Siga o estilo combinado.
```

## Bloco 8 — Ícone do app

```
Gere um ícone quadrado de aplicativo para o jogo "Ultrashift": uma letra U estilizada, grossa, com linhas de velocidade e a silhueta de um carro de corrida vista por trás (câmera atrás do carro), magenta quente e ciano sobre índigo profundo. Pixel art, sem outro texto além da letra U. Sem fundo magenta chapado: o fundo é índigo, ocupando o quadrado inteiro.
```

---

## Áudio

O ChatGPT não gera áudio final de forma confiável. Os sons do MVP são **sintetizados no jogo** (Web Audio), e o ChatGPT é opcional. Eu já escrevo o módulo de áudio no build (M4), então **só o Bloco 9 (música) interessa agora**.

### Bloco 9 — Música (opcional)

```
Escreva uma composição original para um loop de 90 segundos, synthwave/chiptune de corrida, 140 BPM, lá menor, linha de baixo marcante, arpejos no lead e bateria forte, sem semelhança com nenhuma música de jogo existente, loop sem emenda. Entregue como dados de notas em JSON (faixas, notas com nota MIDI, início e duração em beats, velocity) para eu tocar com um sintetizador próprio, e também um prompt em inglês que eu possa usar numa ferramenta de geração de música.
```
