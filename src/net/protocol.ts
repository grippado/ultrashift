/**
 * Future multiplayer wire protocol (rooms over WebSocket). Types only, no transport yet.
 * See docs/adr/004-multiplayer-ready.md. The simulation stays pure and shared by client and server.
 */
import type { Intent } from "../input/types";

export const PROTOCOL_VERSION = 1;

export type ClientMessage =
  | { t: "join"; room: string; name: string; v: number }
  | { t: "ready"; ready: boolean }
  /** one input frame per simulation tick, tagged with the client's tick number */
  | { t: "input"; tick: number; intent: Intent };

export interface CarSnapshot {
  id: string;
  s: number;
  x: number;
  v: number;
  nitroLeft: number;
}

export type ServerMessage =
  | { t: "welcome"; id: string; room: string; seed: number; trackId: string }
  | { t: "roster"; players: { id: string; name: string; ready: boolean }[] }
  | { t: "start"; tick0: number }
  | { t: "snapshot"; tick: number; ackTick: number; cars: CarSnapshot[] }
  | { t: "finish"; results: { id: string; timeMs: number }[] }
  | { t: "error"; code: string };
