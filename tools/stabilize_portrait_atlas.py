#!/usr/bin/env python3
"""Add safe framing and lock every portrait frame to the sweater baseline."""

from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
from PIL import Image


def clothing_center(image: Image.Image) -> float:
    """Estimate the body center from the green sweater near the lower edge."""
    pixels = np.asarray(image.convert("RGB"), dtype=np.float32)
    red, green, blue = (pixels[:, :, index] for index in range(3))
    height, width = red.shape
    mask = (
        (green > red * 1.04)
        & (green > blue * 1.04)
        & (green < 175)
        & (red < 150)
    )
    lower_band = mask[int(height * 0.86) : int(height * 0.98)]
    profile = lower_band.sum(axis=0)
    body_columns = np.flatnonzero(profile > max(8, lower_band.shape[0] * 0.3))
    if body_columns.size < width * 0.25:
        return width / 2
    return float(body_columns[0] + body_columns[-1]) / 2


def stabilize_cell(
    image: Image.Image,
    scale: float,
    trim_bottom: float,
) -> Image.Image:
    image = image.convert("RGB")
    width, height = image.size
    # Some generated midpoint sheets contain the first few rows of the next
    # portrait at the bottom of a cell. Remove that hand-off strip before any
    # resize so it cannot be scaled back into view.
    crop_height = round(height * (1 - trim_bottom))
    image = image.crop((0, 0, width, crop_height))
    center_x = clothing_center(image)
    resized = image.resize(
        (round(width * scale), round(crop_height * scale)),
        Image.Resampling.LANCZOS,
    )

    output = Image.new("RGB", image.size, "white")
    paste_x = round(width / 2 - center_x * scale)
    paste_y = height - resized.height
    output.paste(resized, (paste_x, paste_y))

    pixels = np.asarray(output).copy()
    channel_min = pixels.min(axis=2)
    channel_max = pixels.max(axis=2)
    background = (channel_min >= 248) & ((channel_max - channel_min) <= 5)
    pixels[background] = 255
    return Image.fromarray(pixels, "RGB")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--grid-size", type=int, default=9)
    parser.add_argument("--scale", type=float, default=0.82)
    parser.add_argument("--trim-bottom", type=float, default=0.0625)
    parser.add_argument("--quality", type=int, default=96)
    args = parser.parse_args()

    source = Image.open(args.input).convert("RGB")
    if source.width != source.height or source.width % args.grid_size:
        raise ValueError("Expected a square atlas divisible by grid size")
    if not 0.5 <= args.scale <= 1:
        raise ValueError("Scale must be between 0.5 and 1")
    if not 0 <= args.trim_bottom < 0.2:
        raise ValueError("Bottom trim must be between 0 and 0.2")

    cell_size = source.width // args.grid_size
    output = Image.new("RGB", source.size, "white")
    for row in range(args.grid_size):
        for column in range(args.grid_size):
            box = (
                column * cell_size,
                row * cell_size,
                (column + 1) * cell_size,
                (row + 1) * cell_size,
            )
            cell = stabilize_cell(
                source.crop(box),
                args.scale,
                args.trim_bottom,
            )
            output.paste(cell, (box[0], box[1]))

    args.output.parent.mkdir(parents=True, exist_ok=True)
    output.save(args.output, "WEBP", quality=args.quality, method=6)


if __name__ == "__main__":
    main()
