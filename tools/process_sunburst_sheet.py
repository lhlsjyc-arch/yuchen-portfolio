#!/usr/bin/env python3
"""Extract a clean 5x5 portrait frame set from a Sunburst contact sheet."""

from __future__ import annotations

import argparse
from pathlib import Path

import cv2
import numpy as np


GRID_SIZE = 5


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("sheet", type=Path)
    parser.add_argument("output_dir", type=Path)
    args = parser.parse_args()

    sheet = cv2.imread(str(args.sheet), cv2.IMREAD_UNCHANGED)
    if sheet is None or sheet.ndim != 3 or sheet.shape[2] != 4:
        raise SystemExit("Expected a readable BGRA PNG sheet")

    height, width = sheet.shape[:2]
    if width != height or width % GRID_SIZE:
        raise SystemExit("Expected a square sheet divisible into a 5x5 grid")

    cell_size = width // GRID_SIZE
    args.output_dir.mkdir(parents=True, exist_ok=True)

    kernel = np.ones((7, 7), np.uint8)

    for row in range(GRID_SIZE):
        for column in range(GRID_SIZE):
            y0 = row * cell_size
            x0 = column * cell_size
            cell = sheet[y0 : y0 + cell_size, x0 : x0 + cell_size].copy()

            alpha = cell[:, :, 3].astype(np.float32) / 255.0
            alpha = np.clip((alpha - 0.26) / (0.62 - 0.26), 0.0, 1.0)

            seed_mask = (alpha > 0.03).astype(np.uint8)
            count, labels, stats, _ = cv2.connectedComponentsWithStats(seed_mask, 8)

            center_y = int(cell_size * 0.48)
            center_x = cell_size // 2
            keep_label = int(labels[center_y, center_x])

            if keep_label == 0:
                central = np.zeros_like(seed_mask)
                margin = cell_size // 5
                central[margin:-margin, margin:-margin] = 1
                best_area = -1
                for label in range(1, count):
                    overlap = int(np.count_nonzero((labels == label) & (central == 1)))
                    area = int(stats[label, cv2.CC_STAT_AREA])
                    score = overlap * 10 + area
                    if score > best_area:
                        best_area = score
                        keep_label = label

            keep = (labels == keep_label).astype(np.uint8)
            keep = cv2.dilate(keep, kernel, iterations=1)
            alpha *= keep.astype(np.float32)

            cell[:, :, 3] = np.rint(alpha * 255.0).astype(np.uint8)
            output = args.output_dir / f"frame-r{row}-c{column}.png"
            if not cv2.imwrite(str(output), cell):
                raise SystemExit(f"Failed to write {output}")


if __name__ == "__main__":
    main()
