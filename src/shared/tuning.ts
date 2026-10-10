/** All gameplay constants live here. Initial values, to be calibrated in playtest. */

/** Gesture thresholds, in physical millimetres (CSS px ~ 96 dpi => 3.78 px/mm). */
export const GESTURE = {
  pxPerMm: 96 / 25.4,
  deadZoneMm: 3,
  steerRangeMm: 12,
  steerInnerDeadMm: 0.8,
  steerTauMs: 40,
  steerReleaseTauMs: 25,
  commitMs: 120,
  brakeStartMm: 6,
  brakeRangeMm: 14,
  brakeExitMm: 3,
  brakeMax: 0.6,
  brakeAxisRatio: 1.5,
  brakeSteerWeight: 0.6,
  tapMaxMs: 220,
  tapSlopMm: 2,
  doubleTapMs: 280,
  doubleTapDistPx: 40,
} as const;

export const CAR = {
  maxSpeed: 300,
  nitroSpeed: 380,
  accel: 90,
  brakeDecel: 220,
  offroadDecel: 160,
  offroadMaxSpeed: 110,
  lateralSpeed: 1.6,
  nitroDuration: 2.5,
  nitroCharges: 3,
  nitroAccel: 220,
  nitroFadeDecel: 120,
  roadHalfWidth: 1,
  maxLateral: 1.4,
} as const;

export const SIM_HZ = 60;
export const SIM_DT = 1 / SIM_HZ;
