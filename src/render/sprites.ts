import meta from "../../public/sprites/cars.json";

export type CarSkin = "player" | "rivalA" | "rivalB" | "rivalC";
export type CarFrame = "center" | "left" | "right";

export interface CarSprites {
  draw(
    ctx: CanvasRenderingContext2D,
    skin: CarSkin,
    frame: CarFrame,
    cx: number,
    bottom: number,
    width: number,
  ): void;
}

const frameFor = (steer: number): CarFrame =>
  steer < -0.25 ? "left" : steer > 0.25 ? "right" : "center";

export { frameFor };

export const loadCarSprites = (): Promise<CarSprites> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () =>
      resolve({
        draw(ctx, skin, frame, cx, bottom, width) {
          const f = meta.frames[`${skin}_${frame}` as keyof typeof meta.frames];
          const h = (width * f.h) / f.w;
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(
            img,
            f.x,
            f.y,
            f.w,
            f.h,
            Math.round(cx - width / 2),
            Math.round(bottom - h),
            width,
            h,
          );
        },
      });
    img.onerror = () => reject(new Error("failed to load /sprites/cars.png"));
    img.src = "/sprites/cars.png";
  });
