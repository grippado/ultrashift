export const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v));

/** Move `current` toward `target` with a one-pole filter (tau in ms). */
export const smooth = (current: number, target: number, tauMs: number, dtMs: number): number => {
  if (tauMs <= 0) return target;
  return current + (target - current) * (1 - Math.exp(-dtMs / tauMs));
};
