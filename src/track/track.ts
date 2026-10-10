/** Track layout as data. Pure: shared by the renderer, the AI and (later) the server. */

export interface TrackSegment {
  /** length in world units */
  length: number;
  /** curvature, -1 (left) .. 1 (right); 0 = straight */
  curve: number;
  /** net elevation change over the segment (world units), eased; all rises must sum to 0 */
  rise: number;
}

/** Placeholder layout for the M1 spike; real tracks come later. */
export const TRACK: readonly TrackSegment[] = [
  { length: 900, curve: 0, rise: 0 },
  { length: 800, curve: 0.7, rise: 420 },
  { length: 700, curve: 0, rise: -420 },
  { length: 900, curve: -0.9, rise: 0 },
  { length: 600, curve: 0, rise: 500 },
  { length: 700, curve: 0.5, rise: -500 },
  { length: 600, curve: -0.6, rise: -260 },
  { length: 700, curve: 0, rise: 260 },
];

export const TRACK_LENGTH = TRACK.reduce((n, seg) => n + seg.length, 0);

/** Fraction of each segment used to blend into its neighbours, so curves ease in and out. */
const EASE = 0.3;

const smoothstep = (t: number): number => t * t * (3 - 2 * t);

/** Curvature at distance `s` (wraps around the lap), eased at segment borders. */
export const curvatureAt = (s: number): number => {
  const d = ((s % TRACK_LENGTH) + TRACK_LENGTH) % TRACK_LENGTH;
  let start = 0;
  for (let i = 0; i < TRACK.length; i++) {
    const seg = TRACK[i];
    if (!seg) break;
    if (d < start + seg.length) {
      const prev = TRACK[(i + TRACK.length - 1) % TRACK.length]?.curve ?? 0;
      const next = TRACK[(i + 1) % TRACK.length]?.curve ?? 0;
      const t = (d - start) / seg.length;
      const ramp = EASE;
      if (t < ramp) return prev + (seg.curve - prev) * smoothstep(0.5 + (t / ramp) * 0.5);
      if (t > 1 - ramp)
        return seg.curve + (next - seg.curve) * smoothstep(((t - (1 - ramp)) / ramp) * 0.5);
      return seg.curve;
    }
    start += seg.length;
  }
  return 0;
};

/** Road elevation at distance `s` (wraps around the lap). Cumulative eased rises. */
export const elevationAt = (s: number): number => {
  const d = ((s % TRACK_LENGTH) + TRACK_LENGTH) % TRACK_LENGTH;
  let start = 0;
  let base = 0;
  for (const seg of TRACK) {
    if (d < start + seg.length) return base + seg.rise * smoothstep((d - start) / seg.length);
    start += seg.length;
    base += seg.rise;
  }
  return base;
};
