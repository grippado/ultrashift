# ADR-004: Preparado para multiplayer em salas (WebSocket)

**Status:** aceito (só a preparação; sem rede no MVP).

**Contexto.** Queremos salas multiplayer em breve. Fazer isso depois é barato se a base já for determinística e separada.

**Decisões já aplicadas no código**
- `src/sim` é pura: `step(state, intent, dt)`, sem DOM, relógio ou `Math.random` (RNG com semente). Um teste (`tests/purity.test.ts`) impede regressão em `sim`, `shared` e `net`.
- O input já é um `Intent` por tick, que é exatamente a mensagem de rede (`src/net/protocol.ts`).
- Passo fixo de 60 Hz, igual no cliente e no servidor.

**Arquitetura alvo (depois do M3)**
- Servidor Node + `ws` em `server/`, importando o mesmo `src/sim`. Uma sala = uma instância autoritativa da simulação.
- Cliente envia `input` por tick; servidor devolve `snapshot` a ~20 Hz. O cliente prevê o próprio carro e interpola os rivais (corrida de poucos jogadores, sem colisão carro-carro no começo, o que simplifica a reconciliação).
- Salas por código curto (`join`, `ready`, `start`), 2 a 6 jogadores, mesma seed e pista para todos.
- Hospedagem: o Vercel não mantém WebSocket longo. Opções: Fly.io ou Railway (Node `ws`), ou Cloudflare Durable Objects/PartyKit. Decidir quando chegar a hora.
- Anti-cheat básico: o servidor valida velocidade e posição pela própria simulação.

**Consequências.** As IAs do M3 devem usar a mesma `step`; replays por seed + inputs viram o teste de regressão e também o formato de rede.
