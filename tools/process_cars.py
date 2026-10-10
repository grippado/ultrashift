"""Turn the AI-generated car sheets (art/source) into a game-ready atlas.

Pipeline: flood-fill the magenta background from the edges -> split 3 frames ->
common cell, bottom/center aligned -> area downscale -> one shared 32-color palette.
Usage: python3 tools/process_cars.py
"""
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "art" / "source"
OUT = ROOT / "public" / "sprites"
CELL_W = 80
THRESH = 70
SHEETS = [
    ("player", "01-player-car.png"),
    ("rivalA", "02a-rival-a-yellow.png"),
    ("rivalB", "02b-rival-b-green.png"),
    ("rivalC", "02c-rival-c-white.png"),
]
FRAMES = ["center", "left", "right"]


def cutout(path: Path) -> Image.Image:
    im = Image.open(path).convert("RGB")
    w, h = im.size
    marker = (0, 255, 0)
    seeds = [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1), (w // 2, 0), (w // 2, h - 1), (0, h // 2), (w - 1, h // 2)]
    for s in seeds:
        if im.getpixel(s) != marker:
            ImageDraw.floodfill(im, s, marker, thresh=THRESH)
    a = np.array(im)
    alpha = ~((a[:, :, 0] == 0) & (a[:, :, 1] == 255) & (a[:, :, 2] == 0))
    out = np.dstack([a, (alpha * 255).astype(np.uint8)])
    return Image.fromarray(out, "RGBA")


def split_frames(im: Image.Image) -> list[Image.Image]:
    alpha = np.array(im)[:, :, 3] > 0
    cols = alpha.sum(axis=0) > 3
    runs, start = [], None
    for x, c in enumerate(cols):
        if c and start is None:
            start = x
        elif not c and start is not None:
            runs.append((start, x))
            start = None
    if start is not None:
        runs.append((start, len(cols)))
    runs = [r for r in runs if r[1] - r[0] > 40]
    # merge tiny gaps (mirrors etc.) by keeping the 3 widest runs in order
    runs = sorted(sorted(runs, key=lambda r: r[0] - r[1])[:3])
    assert len(runs) == 3, f"expected 3 frames, got {runs}"
    frames = []
    for x0, x1 in runs:
        crop = im.crop((x0, 0, x1, im.height))
        frames.append(crop.crop(crop.getbbox()))
    return frames


def main() -> None:
    sheets = {}
    for name, f in SHEETS:
        sheets[name] = split_frames(cutout(SRC / f))
    cw = max(fr.width for fs in sheets.values() for fr in fs)
    ch = max(fr.height for fs in sheets.values() for fr in fs)
    scale = CELL_W / cw
    cell_h = round(ch * scale)
    print("source cell", cw, ch, "-> cell", CELL_W, cell_h)

    cells = {}
    for name, frs in sheets.items():
        for key, fr in zip(FRAMES, frs):
            canvas = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))
            canvas.paste(fr, ((cw - fr.width) // 2, ch - fr.height))
            small = canvas.resize((CELL_W, cell_h), Image.BOX)
            arr = np.array(small)
            arr[:, :, 3] = np.where(arr[:, :, 3] >= 128, 255, 0)
            cells[(name, key)] = arr

    # shared palette from all opaque pixels
    px = np.concatenate([c[c[:, :, 3] == 255][:, :3] for c in cells.values()])
    pal_img = Image.fromarray(px.reshape(1, -1, 3).astype(np.uint8), "RGB").quantize(
        colors=32, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE
    )
    palette = pal_img.getpalette()[: 32 * 3]
    flat_pal = Image.new("P", (1, 1))
    flat_pal.putpalette(palette + [0] * (768 - len(palette)))

    atlas = Image.new("RGBA", (CELL_W * 3, cell_h * len(SHEETS)), (0, 0, 0, 0))
    meta = {"cellW": CELL_W, "cellH": cell_h, "frames": {}}
    for r, (name, _) in enumerate(SHEETS):
        for c, key in enumerate(FRAMES):
            arr = cells[(name, key)]
            rgb = Image.fromarray(arr[:, :, :3], "RGB").quantize(palette=flat_pal, dither=Image.Dither.NONE).convert("RGB")
            out = np.dstack([np.array(rgb), arr[:, :, 3]])
            atlas.paste(Image.fromarray(out, "RGBA"), (c * CELL_W, r * cell_h))
            meta["frames"][f"{name}_{key}"] = {"x": c * CELL_W, "y": r * cell_h, "w": CELL_W, "h": cell_h}
    OUT.mkdir(parents=True, exist_ok=True)
    atlas.save(OUT / "cars.png", optimize=True)
    (OUT / "cars.json").write_text(json.dumps(meta, indent=2) + "\n")
    preview = Image.new("RGBA", atlas.size, (26, 16, 64, 255))
    preview.alpha_composite(atlas)
    preview.resize((atlas.width * 4, atlas.height * 4), Image.NEAREST).save(ROOT / "art" / "cars-preview.png")
    print("saved", OUT / "cars.png", atlas.size)


if __name__ == "__main__":
    main()
