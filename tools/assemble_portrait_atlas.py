#!/usr/bin/env python3
"""Assemble anchor and generated midpoint atlases into one dense 9x9 atlas."""

from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
from PIL import Image


def load_cells(
    path: Path,
    rows: int,
    columns: int,
) -> list[list[Image.Image]]:
    atlas = Image.open(path).convert("RGB")
    if atlas.width % columns or atlas.height % rows:
        raise ValueError(
            f"{path} must be divisible into a {columns}x{rows} grid"
        )

    cell_width = atlas.width // columns
    cell_height = atlas.height // rows
    if cell_width != cell_height:
        raise ValueError(f"{path} must contain square cells")
    return [
        [
            atlas.crop(
                (
                    column * cell_width,
                    row * cell_height,
                    (column + 1) * cell_width,
                    (row + 1) * cell_height,
                )
            )
            for column in range(columns)
        ]
        for row in range(rows)
    ]


def normalize_white_background(image: Image.Image) -> Image.Image:
    """Make nearly-white background pixels stable without touching colored flyaways."""
    pixels = np.asarray(image).copy()
    channel_min = pixels.min(axis=2)
    channel_max = pixels.max(axis=2)
    background = (channel_min >= 248) & ((channel_max - channel_min) <= 5)
    pixels[background] = 255
    return Image.fromarray(pixels, "RGB")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("anchors", type=Path)
    parser.add_argument("horizontal", type=Path)
    parser.add_argument("vertical", type=Path)
    parser.add_argument("diagonal", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--cell-size", type=int, default=576)
    parser.add_argument("--quality", type=int, default=96)
    args = parser.parse_args()

    anchors = load_cells(args.anchors, 5, 5)
    horizontal = load_cells(args.horizontal, 5, 4)
    vertical = load_cells(args.vertical, 4, 5)
    diagonal = load_cells(args.diagonal, 4, 4)

    output = Image.new("RGB", (args.cell_size * 9, args.cell_size * 9), "white")
    for row in range(9):
        for column in range(9):
            if row % 2 == 0 and column % 2 == 0:
                cell = anchors[row // 2][column // 2]
            elif row % 2 == 0:
                cell = horizontal[row // 2][column // 2]
            elif column % 2 == 0:
                cell = vertical[row // 2][column // 2]
            else:
                cell = diagonal[row // 2][column // 2]

            if cell.size != (args.cell_size, args.cell_size):
                cell = cell.resize(
                    (args.cell_size, args.cell_size),
                    Image.Resampling.LANCZOS,
                )
            cell = normalize_white_background(cell)
            output.paste(cell, (column * args.cell_size, row * args.cell_size))

    args.output.parent.mkdir(parents=True, exist_ok=True)
    output.save(args.output, "WEBP", quality=args.quality, method=6)


if __name__ == "__main__":
    main()
