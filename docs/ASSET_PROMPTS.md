# Prompts de arte e áudio (ChatGPT)

**Como usar:** abra **uma conversa só** para a arte. Cole o **Bloco 0** primeiro (ele só fixa o estilo). Depois cole **um bloco por mensagem**, na ordem. Escolha a melhor imagem, baixe o PNG e traga aqui (o nome do arquivo = número do bloco, ex. `01-player-car.png`). Eu converto para a resolução final do jogo (reduzo com `nearest`, quantizo na paleta e recorto o fundo magenta) com um script. Por isso **não precisa ser pixel-perfeito no tamanho**: o ChatGPT tende a gerar imagens grandes; o que importa é o estilo e a leitura da silhueta.

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

## Bloco 3 — Efeitos

```
Gere uma folha de sprites de efeitos de corrida, cada quadro numa célula quadrada de grade uniforme, em 4 linhas:
- Linha 1: chama de nitro saindo do escapamento, 4 quadros (do ciano-branco ao laranja).
- Linha 2: fumaça de pneu, 4 quadros (nuvem que cresce e some).
- Linha 3: explosão de faíscas de colisão, 4 quadros.
- Linha 4: brilho das lanternas de freio, 2 quadros.
Siga o estilo combinado.
```

## Bloco 4 — Props de beira de pista

```
Gere uma folha de sprites com 10 props de beira de pista para um jogo de corrida, cada um em sua própria célula de uma grade uniforme, vistos de frente (para serem escalados em pseudo-3D): palmeira alta, pinheiro, poste de luz, placa grande de seta de curva (só a forma da seta, sem texto), outdoor com moldura e arte geométrica abstrata (sem texto), aglomerado de pedras, cacto, prédio pequeno fictício, arco de largada/chegada quadriculado (sem texto), arbusto. Siga o estilo combinado.
```

## Bloco 5 — Céu e parallax (3 camadas)

```
Gere 3 faixas horizontais largas, cada uma em sua própria imagem ou empilhadas e bem separadas, todas que se repetem sem emendas horizontalmente: (1) céu com um sol gigante retro-futurista de pôr do sol em faixas, (2) montanhas distantes em silhueta índigo, (3) colinas próximas mais escuras com alguns detalhes. O fundo transparente entre camadas deve ser #FF00FF. Siga o estilo combinado.
```

## Bloco 6 — Tiles da estrada

```
Gere uma folha de tiles quadrados pequenos que se repetem sem emenda, em grade uniforme: asfalto claro, asfalto escuro, zebra vermelha, zebra branca, grama clara, grama escura, areia clara, areia escura. Visão de cima, textura simples de pixel art. Neste pedido NÃO use fundo magenta, é só uma folha de tiles. Siga o estilo combinado nos demais aspectos.
```

## Bloco 7 — HUD

```
Gere uma folha de sprites para o HUD de um jogo de corrida: dígitos 0 a 9 numa fonte pixel grossa e legível, ícones de posição 1º, 2º, 3º e 4º (só os números dentro de um emblema), ícone de volta, 3 ícones de carga de nitro (cheio e vazio, em cima e embaixo), números de contagem regressiva 3, 2, 1 e a palavra GO em pixel art, ícone de pausa, ícone de engrenagem. Tudo em células de grade uniforme. Neste pedido o texto é permitido apenas nos dígitos e em GO. Siga o estilo combinado.
```

## Bloco 8 — Ícone do app

```
Gere um ícone quadrado de aplicativo para o jogo "Ultrashift": uma letra U estilizada e grossa com linhas de velocidade e a silhueta de um carro de corrida vista por trás, magenta quente e ciano sobre índigo profundo. Pixel art, sem outro texto além da letra U. Sem fundo magenta chapado: o fundo é índigo, ocupando o quadrado inteiro.
```

---

## Áudio

O ChatGPT não gera áudio final de forma confiável. Os sons do MVP são **sintetizados no jogo** (Web Audio), e o ChatGPT é opcional. Eu já escrevo o módulo de áudio no build (M4), então **só o Bloco 9 (música) interessa agora**.

### Bloco 9 — Música (opcional)

```
Escreva uma composição original para um loop de 90 segundos, synthwave/chiptune de corrida, 140 BPM, lá menor, linha de baixo marcante, arpejos no lead e bateria forte, sem semelhança com nenhuma música de jogo existente, loop sem emenda. Entregue como dados de notas em JSON (faixas, notas com nota MIDI, início e duração em beats, velocity) para eu tocar com um sintetizador próprio, e também um prompt em inglês que eu possa usar numa ferramenta de geração de música.
```
