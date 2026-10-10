import { CAR } from "../shared/tuning";

export interface CarState {
  /** distance along the track */
  s: number;
  /** lateral position, -1..1 on the road */
  x: number;
  /** speed */
  v: number;
  nitroCharges: number;
  /** seconds of nitro left */
  nitroLeft: number;
}

export interface SimState {
  tick: number;
  car: CarState;
}

export const createState = (): SimState => ({
  tick: 0,
  car: { s: 0, x: 0, v: 0, nitroCharges: CAR.nitroCharges, nitroLeft: 0 },
});
