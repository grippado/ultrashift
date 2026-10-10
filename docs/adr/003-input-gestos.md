# ADR-003: Input por gestos e contrato `Intent`

**Status:** aceito. **Decisão:** a simulação só vê `Intent { steer, brake, nitro }`, amostrado uma vez por tick. `GestureRecognizer` (puro, testado) converte ponteiros em `Intent`:
- um ponteiro dono; a âncora é onde o dedo pousa;
- steer proporcional ao deslocamento horizontal, suavizado;
- freio: arrasto para baixo, leve (`brakeMax` 0,6), **só depois de STEERING confirmado** (deslocamento passou da zona morta ou 120 ms);
- nitro: duplo toque (dispara no 2º `pointerdown`) ou toque de um 2º dedo.

Limiares em mm, em `src/shared/tuning.ts`, a calibrar em playtest nos aparelhos reais.
