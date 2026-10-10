import type { GestureRecognizer } from "./gestures";

/** Wires DOM pointer events into a GestureRecognizer. */
export const attachTouch = (el: HTMLElement, rec: GestureRecognizer): (() => void) => {
  const s = (e: PointerEvent) => ({ id: e.pointerId, x: e.clientX, y: e.clientY, t: e.timeStamp });
  const onDown = (e: PointerEvent) => {
    e.preventDefault();
    el.setPointerCapture(e.pointerId);
    rec.down(s(e));
  };
  const onMove = (e: PointerEvent) => rec.move(s(e));
  const onUp = (e: PointerEvent) => rec.up(s(e));
  const onCancel = () => rec.cancel();
  const noMenu = (e: Event) => e.preventDefault();

  el.addEventListener("pointerdown", onDown);
  el.addEventListener("pointermove", onMove);
  el.addEventListener("pointerup", onUp);
  el.addEventListener("pointercancel", onCancel);
  el.addEventListener("contextmenu", noMenu);
  document.addEventListener("visibilitychange", onCancel);
  return () => {
    el.removeEventListener("pointerdown", onDown);
    el.removeEventListener("pointermove", onMove);
    el.removeEventListener("pointerup", onUp);
    el.removeEventListener("pointercancel", onCancel);
    el.removeEventListener("contextmenu", noMenu);
    document.removeEventListener("visibilitychange", onCancel);
  };
};
