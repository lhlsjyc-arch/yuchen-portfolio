#!/usr/bin/env python3
"""Restore complete hair silhouettes around the generated portrait frames.

The high-detail 9x9 generation cropped several hair silhouettes at the source
cell boundaries.  A matching transparent 9x9 atlas still contains the intact
outer hair for every pose.  This script aligns that intact silhouette to each
high-detail frame, colour-matches only the hair pixels, and uses them to fill
the missing fringe.  The face, glasses, expression, clothing, and pose remain
from the high-detail frame.
"""

from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
from PIL import Image


def bounds(mask: np.ndarray) -> tuple[int, int, int, int]:
    ys, xs = np.nonzero(mask)
    if not len(xs):
        raise ValueError("Expected a non-empty subject mask")
    return int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1


def hair_mask(rgb: np.ndarray, alpha: np.ndarray | None = None) -> np.ndarray:
    """Select brown/black hair while rejecting the green sweater."""
    pixels = rgb.astype(np.float32)
    red, green, blue = (pixels[:, :, channel] for channel in range(3))
    result = (
        (red < 158)
        & (green < 128)
        & (blue < 122)
        & (red >= green * 0.84)
        & (red >= blue * 0.96)
    )
    if alpha is not None:
        result &= alpha > 24
    return result


def dilate(mask: np.ndarray) -> np.ndarray:
    padded = np.pad(mask, 1, mode="constant")
    height, width = mask.shape
    expanded = np.zeros_like(mask)
    for offset_y in range(3):
        for offset_x in range(3):
            expanded |= padded[offset_y : offset_y + height, offset_x : offset_x + width]
    return expanded


def glasses_bounds(rgb: np.ndarray, alpha: np.ndarray | None = None) -> tuple[int, int, int, int]:
    pixels = rgb.astype(np.float32)
    red, green, blue = (pixels[:, :, channel] for channel in range(3))
    yy = np.indices(red.shape)[0]
    mask = (
        (green > 72)
        & (green > red * 1.06)
        & (green > blue * 1.08)
        & (yy < red.shape[0] * 0.57)
    )
    if alpha is not None:
        mask &= alpha > 24
    return bounds(mask)


def align_reference(
    cell: Image.Image,
    high_rgb: np.ndarray,
) -> tuple[np.ndarray, np.ndarray]:
    rgba = np.asarray(cell.convert("RGBA"))
    alpha = rgba[:, :, 3]
    low_glasses = glasses_bounds(rgba[:, :, :3], alpha)
    high_glasses = glasses_bounds(high_rgb)
    low_width = low_glasses[2] - low_glasses[0]
    high_width = high_glasses[2] - high_glasses[0]
    scale = high_width / low_width

    target_width = round(cell.width * scale)
    target_height = round(cell.height * scale)
    subject = cell.convert("RGBA").resize((target_width, target_height), Image.Resampling.LANCZOS)

    low_center_x = (low_glasses[0] + low_glasses[2]) / 2 * scale
    low_center_y = (low_glasses[1] + low_glasses[3]) / 2 * scale
    high_center_x = (high_glasses[0] + high_glasses[2]) / 2
    high_center_y = (high_glasses[1] + high_glasses[3]) / 2
    paste_x = round(high_center_x - low_center_x)
    paste_y = round(high_center_y - low_center_y)
    frame_size = high_rgb.shape[0]
    canvas = Image.new("RGBA", (frame_size, frame_size), (0, 0, 0, 0))
    canvas.alpha_composite(subject, (paste_x, paste_y))
    aligned = np.asarray(canvas)
    return aligned[:, :, :3], aligned[:, :, 3]


def match_hair_colour(
    low_rgb: np.ndarray,
    low_hair: np.ndarray,
    high_rgb: np.ndarray,
    high_hair: np.ndarray,
) -> np.ndarray:
    overlap = low_hair & high_hair
    if overlap.sum() < 200:
        return low_rgb.astype(np.float32)

    source = low_rgb[overlap].astype(np.float32)
    target = high_rgb[overlap].astype(np.float32)
    source_mean = source.mean(axis=0)
    target_mean = target.mean(axis=0)
    source_std = np.maximum(source.std(axis=0), 8)
    target_std = np.maximum(target.std(axis=0), 8)
    adjusted = (low_rgb.astype(np.float32) - source_mean) * (target_std / source_std) + target_mean
    return np.clip(adjusted, 0, 255)


def repair_frame(high: Image.Image, reference: Image.Image) -> Image.Image:
    high_rgb = np.asarray(high.convert("RGB"))
    channel_min = high_rgb.min(axis=2)
    channel_max = high_rgb.max(axis=2)
    background = (channel_min >= 246) & ((channel_max - channel_min) <= 10)
    high_subject = ~background
    high_box = bounds(high_subject)
    left, top, right, bottom = high_box

    # A natural curl or ear touches a bounding-box edge in only a handful of
    # pixels.  A source-atlas crop leaves a long, unnaturally straight contact
    # along that edge.  Repair only those detected edges; otherwise the intact
    # high-detail silhouette is left alone.
    repair_left = int(high_subject[top:bottom, left].sum()) >= 40
    repair_right = int(high_subject[top:bottom, right - 1].sum()) >= 40
    repair_top = int(high_subject[top, left:right].sum()) >= 40

    low_rgb, low_alpha = align_reference(reference, high_rgb)
    low_hair = hair_mask(low_rgb, low_alpha)
    high_hair = hair_mask(high_rgb)
    adjusted_low = match_hair_colour(low_rgb, low_hair, high_rgb, high_hair)
    # Keep non-hair details (primarily ear tips at steep downward angles) in
    # their original colours; only the restored hair is colour-matched.
    adjusted_subject = low_rgb.astype(np.float32)
    adjusted_subject[low_hair] = adjusted_low[low_hair]

    result = high_rgb.astype(np.float32)
    yy, xx = np.indices(high_subject.shape)
    repair_region = np.zeros_like(high_subject)
    if repair_left:
        repair_region |= xx <= left + 8
    if repair_right:
        repair_region |= xx >= right - 9
    if repair_top:
        repair_region |= yy <= top + 9

    extension = (low_alpha > 24) & ~high_subject & repair_region
    extension_alpha = (low_alpha.astype(np.float32) / 255)[:, :, None]
    restored = adjusted_subject * extension_alpha + 255 * (1 - extension_alpha)
    result[extension] = restored[extension]

    # Feather the restored fringe a few pixels into the existing hair.  This
    # removes the straight atlas boundary without softening facial features.
    frontier = extension.copy()
    visited = extension.copy()
    for step in range(1, 9):
        frontier = dilate(frontier) & ~visited
        visited |= frontier
        ring = frontier & high_hair & low_hair & repair_region
        if not ring.any():
            continue
        strength = 0.58 * (1 - (step - 1) / 8)
        result[ring] = result[ring] * (1 - strength) + adjusted_low[ring] * strength

    return Image.fromarray(np.clip(result, 0, 255).astype(np.uint8), "RGB")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--frames", type=Path, required=True)
    parser.add_argument("--reference-atlas", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--grid-size", type=int, default=9)
    parser.add_argument("--quality", type=int, default=96)
    parser.add_argument("--only", type=int, nargs="*")
    args = parser.parse_args()

    atlas = Image.open(args.reference_atlas).convert("RGBA")
    if atlas.width != atlas.height or atlas.width % args.grid_size:
        raise ValueError("Expected a square reference atlas divisible by grid size")
    cell_size = atlas.width // args.grid_size
    selected = args.only if args.only is not None else range(args.grid_size**2)
    args.output.mkdir(parents=True, exist_ok=True)

    for index in selected:
        row, column = divmod(index, args.grid_size)
        frame_path = args.frames / f"frame-{index:02d}.webp"
        high = Image.open(frame_path).convert("RGB")
        reference = atlas.crop(
            (
                column * cell_size,
                row * cell_size,
                (column + 1) * cell_size,
                (row + 1) * cell_size,
            )
        )
        repaired = repair_frame(high, reference)
        repaired.save(
            args.output / f"frame-{index:02d}.webp",
            "WEBP",
            quality=args.quality,
            method=6,
        )


if __name__ == "__main__":
    main()
