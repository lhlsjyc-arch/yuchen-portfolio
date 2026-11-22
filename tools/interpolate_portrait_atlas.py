#!/usr/bin/env python3
"""Build a denser 2D portrait sprite atlas with motion-compensated frames."""

from __future__ import annotations

import argparse
import shutil
import subprocess
import tempfile
from pathlib import Path

from PIL import Image


def interpolate_sequence(
    images: list[Image.Image],
    output_count: int,
    working_directory: Path,
) -> list[Image.Image]:
    input_directory = working_directory / "input"
    output_directory = working_directory / "output"
    input_directory.mkdir(parents=True)
    output_directory.mkdir(parents=True)

    for index, image in enumerate(images):
        image.save(input_directory / f"frame-{index:02d}.png")

    fps = (output_count - 1) / (len(images) - 1)
    stop_duration = 1 / fps
    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg:
        raise RuntimeError("ffmpeg is required to generate interpolated frames")

    command = [
        ffmpeg,
        "-y",
        "-hide_banner",
        "-loglevel",
        "error",
        "-framerate",
        "1",
        "-start_number",
        "0",
        "-i",
        str(input_directory / "frame-%02d.png"),
        "-frames:v",
        str(len(images)),
        "-vf",
        (
            f"tpad=stop_mode=clone:stop_duration={stop_duration},"
            f"minterpolate=fps={fps}:mi_mode=mci:mc_mode=aobmc:"
            "me_mode=bidir:vsbmc=1"
        ),
        "-frames:v",
        str(output_count),
        str(output_directory / "frame-%02d.png"),
    ]
    subprocess.run(command, check=True)

    frame_paths = sorted(output_directory.glob("frame-*.png"))
    if len(frame_paths) != output_count:
        raise RuntimeError(
            f"Expected {output_count} interpolated frames, got {len(frame_paths)}"
        )
    return [Image.open(path).convert("RGBA") for path in frame_paths]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--source-grid", type=int, default=5)
    parser.add_argument("--target-grid", type=int, default=9)
    parser.add_argument("--cell-size", type=int, default=640)
    args = parser.parse_args()

    source = Image.open(args.input).convert("RGBA")
    if source.width != source.height or source.width % args.source_grid:
        raise ValueError("Expected a square atlas divisible by the source grid")

    source_cell_size = source.width // args.source_grid
    source_rows: list[list[Image.Image]] = []
    for row in range(args.source_grid):
        source_row = []
        for column in range(args.source_grid):
            box = (
                column * source_cell_size,
                row * source_cell_size,
                (column + 1) * source_cell_size,
                (row + 1) * source_cell_size,
            )
            source_row.append(source.crop(box))
        source_rows.append(source_row)

    with tempfile.TemporaryDirectory(prefix="portrait-atlas-") as temp:
        temporary_root = Path(temp)
        horizontal_rows = [
            interpolate_sequence(
                row,
                args.target_grid,
                temporary_root / f"horizontal-{row_index:02d}",
            )
            for row_index, row in enumerate(source_rows)
        ]

        output_columns = []
        for column in range(args.target_grid):
            column_images = [
                horizontal_rows[row][column]
                for row in range(args.source_grid)
            ]
            output_columns.append(
                interpolate_sequence(
                    column_images,
                    args.target_grid,
                    temporary_root / f"vertical-{column:02d}",
                )
            )

    atlas_size = args.target_grid * args.cell_size
    output = Image.new("RGBA", (atlas_size, atlas_size), (0, 0, 0, 0))
    for column, column_images in enumerate(output_columns):
        for row, image in enumerate(column_images):
            if image.size != (args.cell_size, args.cell_size):
                image = image.resize(
                    (args.cell_size, args.cell_size),
                    Image.Resampling.LANCZOS,
                )
            output.alpha_composite(
                image,
                (column * args.cell_size, row * args.cell_size),
            )

    args.output.parent.mkdir(parents=True, exist_ok=True)
    output.save(args.output, "WEBP", quality=94, method=6, exact=True)


if __name__ == "__main__":
    main()
