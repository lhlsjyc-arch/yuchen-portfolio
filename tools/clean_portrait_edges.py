#!/usr/bin/env python3
"""Clean a black-matted transparent portrait without growing its silhouette.

The source portraits contain premultiplied RGB values along partially
transparent pixels. Browsers interpret those pixels as straight alpha, which
creates a dark fringe on white. This tool reverses that black contamination,
removes only near-invisible alpha noise and tiny detached fragments, and
asserts that the output never adds pixels outside the source alpha support.
"""

from __future__ import annotations

import argparse
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image


def remove_small_islands(alpha: np.ndarray, minimum_area: int) -> np.ndarray:
    """Remove detached foreground fragments smaller than ``minimum_area``."""
    if minimum_area <= 1:
        return alpha

    foreground = alpha > 0
    visited = np.zeros(foreground.shape, dtype=bool)
    height, width = foreground.shape
    cleaned = alpha.copy()

    for start_y, start_x in zip(*np.nonzero(foreground & ~visited)):
        if visited[start_y, start_x]:
            continue

        queue = deque([(int(start_y), int(start_x))])
        visited[start_y, start_x] = True
        component: list[tuple[int, int]] = []

        while queue:
            y, x = queue.popleft()
            component.append((y, x))

            for neighbor_y in range(max(0, y - 1), min(height, y + 2)):
                for neighbor_x in range(max(0, x - 1), min(width, x + 2)):
                    if (
                        foreground[neighbor_y, neighbor_x]
                        and not visited[neighbor_y, neighbor_x]
                    ):
                        visited[neighbor_y, neighbor_x] = True
                        queue.append((neighbor_y, neighbor_x))

        if len(component) < minimum_area:
            ys, xs = zip(*component)
            cleaned[np.asarray(ys), np.asarray(xs)] = 0

    return cleaned


def clean_frame(
    frame: Image.Image,
    alpha_floor: int,
    minimum_island_area: int,
) -> Image.Image:
    rgba = np.array(frame.convert("RGBA"), dtype=np.uint8)
    source_alpha = rgba[..., 3].copy()
    alpha = source_alpha.copy()

    # A value this low is invisible at normal size but survives lossy WebP as
    # isolated dirt. Removing it can only shrink the source mask.
    alpha[alpha <= alpha_floor] = 0
    alpha = remove_small_islands(alpha, minimum_island_area)

    # The source edge RGB is black-premultiplied. Recover straight foreground
    # color while leaving alpha itself untouched. This removes a dark halo; it
    # does not create a stroke or make the silhouette larger.
    rgb = rgba[..., :3].astype(np.float32)
    scale = np.zeros(alpha.shape, dtype=np.float32)
    visible = alpha > 0
    scale[visible] = 255.0 / source_alpha[visible].astype(np.float32)
    corrected_rgb = np.clip(rgb * scale[..., None], 0, 255).astype(np.uint8)
    corrected_rgb[~visible] = 0

    if np.any((alpha > 0) & (source_alpha == 0)):
        raise AssertionError("Cleaning expanded alpha outside the source silhouette")

    return Image.fromarray(np.dstack((corrected_rgb, alpha)), "RGBA")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--grid", type=int, default=5)
    parser.add_argument("--center-output", type=Path)
    parser.add_argument("--alpha-floor", type=int, default=12)
    parser.add_argument("--minimum-island-area", type=int, default=32)
    args = parser.parse_args()

    atlas = Image.open(args.input).convert("RGBA")
    if atlas.width != atlas.height or atlas.width % args.grid:
        raise ValueError("Expected a square atlas divisible by the grid size")

    cell_size = atlas.width // args.grid
    cleaned = Image.new("RGBA", atlas.size, (0, 0, 0, 0))

    for row in range(args.grid):
        for column in range(args.grid):
            box = (
                column * cell_size,
                row * cell_size,
                (column + 1) * cell_size,
                (row + 1) * cell_size,
            )
            cleaned.alpha_composite(
                clean_frame(
                    atlas.crop(box),
                    alpha_floor=args.alpha_floor,
                    minimum_island_area=args.minimum_island_area,
                ),
                box[:2],
            )

    args.output.parent.mkdir(parents=True, exist_ok=True)
    cleaned.save(args.output, "WEBP", quality=96, method=6, exact=True)

    if args.center_output:
        center = args.grid // 2
        center_box = (
            center * cell_size,
            center * cell_size,
            (center + 1) * cell_size,
            (center + 1) * cell_size,
        )
        cleaned.crop(center_box).save(
            args.center_output,
            "WEBP",
            quality=96,
            method=6,
            exact=True,
        )


if __name__ == "__main__":
    main()
