#!/usr/bin/env python3
"""Lock a portrait sequence to one body while preserving each head turn.

The generated turn frames vary in shoulder height and torso width.  This tool
uses the centre frame as an invariant lower-body plate and blends only the
head/upper-hair region from each turn frame.  It can also transplant the two
eye interiors from a locally repaired gaze frame without accepting any of the
model's unrelated full-image changes.
"""

from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter


FRAME_NAMES = (
    "frame-01-left.webp",
    "frame-02-left-25.webp",
    "frame-03-left-50.webp",
    "frame-04-left-75.webp",
    "frame-05-center.webp",
    "frame-06-right-25.webp",
    "frame-07-right-50.webp",
    "frame-08-right-75.webp",
    "frame-09-right.webp",
)


def soft_ellipse(
    size: tuple[int, int],
    center: tuple[float, float],
    radii: tuple[float, float],
    feather: float,
) -> np.ndarray:
    width, height = size
    yy, xx = np.mgrid[:height, :width]
    distance = np.sqrt(
        ((xx - center[0]) / radii[0]) ** 2
        + ((yy - center[1]) / radii[1]) ** 2
    )
    return np.clip((1 + feather - distance) / feather, 0, 1).astype(np.float32)


def paste_eye_interiors(target: Image.Image, repaired: Image.Image) -> Image.Image:
    """Take only the repaired eyeballs, discarding all other model changes."""
    target = target.convert("RGBA")
    repaired = repaired.convert("RGBA")

    # The repair output redrew the full image, but its eyeball interiors carry
    # the requested gaze.  These source/target rectangles align the eye whites
    # while keeping the original eyelids, lashes, brows, and glasses untouched.
    eye_maps = (
        ((267, 414, 357, 482), (281, 414, 371, 482), (326, 450), (38, 20)),
        ((407, 414, 503, 485), (437, 411, 533, 482), (485, 448), (42, 21)),
    )

    canvas = target.copy()
    for source_box, target_box, center, radii in eye_maps:
        patch = repaired.crop(source_box).resize(
            (target_box[2] - target_box[0], target_box[3] - target_box[1]),
            Image.Resampling.LANCZOS,
        )
        layer = Image.new("RGBA", target.size, (0, 0, 0, 0))
        layer.alpha_composite(patch, (target_box[0], target_box[1]))

        mask = soft_ellipse(target.size, center, radii, feather=0.22)
        mask_image = Image.fromarray(np.uint8(mask * 255), "L").filter(
            ImageFilter.GaussianBlur(1.6)
        )
        canvas = Image.composite(layer, canvas, mask_image)

    return canvas


def head_mask(moving: Image.Image) -> np.ndarray:
    """Keep the moving face and top hair, but hand the body to frame five."""
    size = moving.size
    width, height = size
    yy, _ = np.mgrid[:height, :width]

    # Top hair is sourced entirely from each turn frame.  The hand-off begins
    # above the collar and is complete before the shoulder line.
    vertical = np.clip((650 - yy) / 110, 0, 1).astype(np.float32)

    # Preserve the face down through the chin while the fixed centre-frame
    # collar remains underneath it.  The broad feather hides the join in hair.
    face = soft_ellipse(size, (512, 455), (300, 235), feather=0.24)
    mask = np.maximum(vertical, face)

    # Remove the moving olive collar and dark-green sweater from the hand-off.
    # This is the key stability constraint: all nine frames use frame five's
    # exact clothing pixels, shoulder line, torso centre, and lower silhouette.
    rgba = np.asarray(moving.convert("RGBA"), dtype=np.float32)
    red, green, blue, alpha = (rgba[:, :, channel] for channel in range(4))
    clothing = (
        (yy > 520)
        & (alpha > 16)
        & (green > red * 1.025)
        & (green > blue * 1.055)
    )
    clothing_image = Image.fromarray(np.uint8(clothing) * 255, "L")
    clothing_image = clothing_image.filter(ImageFilter.MaxFilter(13)).filter(
        ImageFilter.GaussianBlur(5)
    )
    clothing_soft = np.asarray(clothing_image, dtype=np.float32) / 255
    mask *= 1 - clothing_soft

    # Generated frames also vary in how much neck appears above the collar.
    # Remove that lower skin strip so it cannot form a moving ring over the
    # fixed collar, while leaving the jaw and chin from the turn frame intact.
    skin_below_chin = (
        (yy > 620)
        & (alpha > 16)
        & (red > green * 1.10)
        & (red > blue * 1.14)
        & (red > 105)
    )
    skin_image = Image.fromarray(np.uint8(skin_below_chin) * 255, "L")
    skin_image = skin_image.filter(ImageFilter.MaxFilter(11)).filter(
        ImageFilter.GaussianBlur(4)
    )
    mask *= 1 - np.asarray(skin_image, dtype=np.float32) / 255

    # Below the jaw, permit only dark brown hair from the moving frame.  This
    # keeps the silhouette responsive while guaranteeing that the neck,
    # collar, shoulders, and sweater all come from the same centre plate.
    hair = (
        (alpha > 16)
        & (red < 165)
        & (green < 135)
        & (blue < 125)
        & (red > green * 0.84)
        & (red > blue * 0.94)
    )
    hair_image = Image.fromarray(np.uint8(hair) * 255, "L")
    hair_image = hair_image.filter(ImageFilter.MaxFilter(9)).filter(
        ImageFilter.GaussianBlur(4)
    )
    hair_soft = np.asarray(hair_image, dtype=np.float32) / 255
    jaw_handoff = np.clip((625 - yy) / 35, 0, 1).astype(np.float32)
    mask *= jaw_handoff + (1 - jaw_handoff) * hair_soft

    return np.asarray(
        Image.fromarray(np.uint8(mask * 255), "L").filter(
            ImageFilter.GaussianBlur(7)
        ),
        dtype=np.float32,
    ) / 255


def premultiplied_mix(
    moving: Image.Image,
    fixed: Image.Image,
    moving_weight: np.ndarray,
) -> Image.Image:
    moving_array = np.asarray(moving.convert("RGBA"), dtype=np.float32) / 255
    fixed_array = np.asarray(fixed.convert("RGBA"), dtype=np.float32) / 255
    weight = moving_weight[:, :, None]

    moving_alpha = moving_array[:, :, 3:4]
    fixed_alpha = fixed_array[:, :, 3:4]
    alpha = moving_alpha * weight + fixed_alpha * (1 - weight)
    premultiplied = (
        moving_array[:, :, :3] * moving_alpha * weight
        + fixed_array[:, :, :3] * fixed_alpha * (1 - weight)
    )
    rgb = np.divide(
        premultiplied,
        np.maximum(alpha, 1 / 255),
        out=np.zeros_like(premultiplied),
        where=alpha > 0,
    )
    result = np.concatenate((rgb, alpha), axis=2)
    return Image.fromarray(np.uint8(np.clip(result, 0, 1) * 255), "RGBA")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--gaze-repair", type=Path)
    parser.add_argument("--quality", type=int, default=98)
    args = parser.parse_args()

    centre = Image.open(args.input / FRAME_NAMES[4]).convert("RGBA")
    args.output.mkdir(parents=True, exist_ok=True)

    for index, name in enumerate(FRAME_NAMES):
        moving = Image.open(args.input / name).convert("RGBA")
        if index == 1 and args.gaze_repair:
            moving = paste_eye_interiors(moving, Image.open(args.gaze_repair))

        result = (
            centre.copy()
            if index == 4
            else premultiplied_mix(moving, centre, head_mask(moving))
        )
        result.save(
            args.output / name,
            "WEBP",
            lossless=True,
            quality=args.quality,
            method=6,
        )


if __name__ == "__main__":
    main()
