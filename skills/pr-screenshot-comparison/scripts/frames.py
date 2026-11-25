#!/usr/bin/env python3
# /// script
# dependencies = ["pillow"]
# ///
"""Lay out the frames of a captured animation as one labelled grid image."""
import argparse
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFont

LABEL_HEIGHT = 22
GAP = 6
FONT = '/System/Library/Fonts/Supplemental/Arial.ttf'


def parse_box(text):
    x, y, w, h = (int(v) for v in text.split(','))
    if w <= 0 or h <= 0:
        raise argparse.ArgumentTypeError('crop width and height must be positive')
    return (x, y, x + w, y + h)


def parse_picks(text):
    return [int(v) for v in text.split(',')]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('frames', type=Path, help='a folder of PNG frames, sorted by name, or one or more PNG files', nargs='+')
    parser.add_argument('-o', '--output', type=Path, required=True, help='the grid PNG to write')
    parser.add_argument('--crop', type=parse_box, help='x,y,width,height in image pixels, applied to every frame')
    parser.add_argument('--changed', action='store_true', help='keep only frames that differ from the frame before them')
    parser.add_argument('--pick', type=parse_picks, help='comma-separated frame numbers to keep, as the labels show them')
    parser.add_argument('--cols', type=int, default=6)
    parser.add_argument('--max-width', type=int, default=2400, help='scale tiles down so the grid is at most this wide')
    args = parser.parse_args()

    paths = []
    for p in args.frames:
        paths += sorted(p.glob('*.png')) if p.is_dir() else [p]
    paths = [p for p in paths if p.resolve() != args.output.resolve()]
    if not paths:
        parser.error('no PNG frames found')

    frames = [Image.open(p).convert('RGB') for p in paths]
    if args.crop:
        frames = [f.crop(args.crop) for f in frames]
    sizes = {f.size for f in frames}
    if len(sizes) > 1:
        parser.error(f'frames differ in size: {sorted(sizes)}; crop them to one size')

    numbers = list(range(len(frames)))
    if args.changed:
        numbers = [i for i in numbers if i == 0 or ImageChops.difference(frames[i], frames[i - 1]).getbbox()]
    if args.pick:
        unknown = [i for i in args.pick if i not in range(len(frames))]
        if unknown:
            parser.error(f'no frames numbered {unknown}; there are {len(frames)}')
        numbers = [i for i in numbers if i in args.pick] if args.changed else args.pick

    cols = max(1, min(args.cols, len(numbers)))
    rows = -(-len(numbers) // cols)
    width, height = frames[0].size
    scale = min(1.0, (args.max_width - GAP * (cols + 1)) / (width * cols))
    tile_w, tile_h = max(1, round(width * scale)), max(1, round(height * scale))
    grid = Image.new('RGB', (GAP + cols * (tile_w + GAP), GAP + rows * (tile_h + LABEL_HEIGHT + GAP)), '#16191F')
    draw = ImageDraw.Draw(grid)
    try:
        font = ImageFont.truetype(FONT, 14)
    except OSError:
        font = ImageFont.load_default()
    for k, i in enumerate(numbers):
        x = GAP + (k % cols) * (tile_w + GAP)
        y = GAP + (k // cols) * (tile_h + LABEL_HEIGHT + GAP)
        draw.text((x, y + 3), f'{i}  {paths[i].name}', fill='#F3F4F6', font=font)
        grid.paste(frames[i].resize((tile_w, tile_h), Image.LANCZOS), (x, y + LABEL_HEIGHT))
    args.output.parent.mkdir(parents=True, exist_ok=True)
    grid.save(args.output)
    print(f'{args.output}: {len(numbers)} of {len(frames)} frames, {cols}x{rows} tiles of {tile_w}x{tile_h} px (scale {scale:.2f})')
    print('frames:', ','.join(str(i) for i in numbers))


if __name__ == '__main__':
    main()
