#!/usr/bin/env python3
"""Compose aligned product captures without changing their contents. Requires Pillow."""
import argparse
import json
import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

PALETTES = {
    'light': ('#F3F4F6', '#20242B', '#515966', '#CED3DA'),
    'dark': ('#16191F', '#F3F4F6', '#B5BDC9', '#424954'),
}
FONT_PAIRS = [
    ('/System/Library/Fonts/Supplemental/Arial.ttf',
     '/System/Library/Fonts/Supplemental/Arial Bold.ttf'),
    ('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
     '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'),
]


def require(condition, message):
    if not condition:
        raise ValueError(message)


def lines(text, font, width, draw):
    result = []
    for word in text.split():
        require(draw.textlength(word, font=font) <= width,
                'Caption contains an overlong word; shorten it.')
        candidate = f'{result[-1]} {word}' if result else word
        if result and draw.textlength(candidate, font=font) <= width:
            result[-1] = candidate
        else:
            result.append(word)
    require(len(result) <= 2, 'Caption exceeds two lines; shorten it.')
    return result


def compose(spec_path, output, regular=None, bold=None):
    spec = json.loads(spec_path.read_text())
    panels = spec['panels']
    require(len(panels) in (2, 3), 'Use two or three panels per comparison.')
    expected = ['Before', 'After'] if len(panels) == 2 else [
        'Before', 'After at rest', 'After activated']
    require([p['label'] for p in panels] == expected, 'Panel labels/order do not match the comparison states.')
    vw, vh = spec['viewport']
    x, y, w, h = spec['crop']
    require(all(isinstance(v, (int, float)) and math.isfinite(v)
                for v in (vw, vh, x, y, w, h)), 'Dimensions must be finite numbers.')
    require(vw > 0 and vh > 0 and w > 0 and h > 0, 'Dimensions must be positive.')
    require(x >= 0 and y >= 0 and x + w <= vw and y + h <= vh,
            'Crop extends outside the viewport; do not pad missing pixels.')
    require(w <= 680, 'Crop is wider than 680 CSS px; narrow the proof area or use a separate detail capture.')
    images = []
    for panel in panels:
        require(panel.get('commit') and panel.get('route'), 'Record each capture commit and route.')
        path = Path(panel['image'])
        if not path.is_absolute():
            path = spec_path.parent / path
        with Image.open(path) as image:
            images.append(image.convert('RGB'))
    require(len({im.size for im in images}) == 1, 'Capture dimensions differ; recapture at matching viewport and scale.')
    sx, sy = images[0].width / vw, images[0].height / vh
    require(abs(sx - sy) / max(sx, sy) < .005,
            'Image dimensions do not match the recorded viewport; supply full viewport captures, not clipped or resized images.')
    require(sx >= .99, 'Capture is smaller than the CSS viewport; recapture without downscaling.')
    require(len({p['route'] for p in panels}) == 1, 'Comparison routes differ; capture the same product route.')
    require(panels[0]['commit'] != panels[1]['commit'], 'Before and after must name distinct commits.')
    if len(panels) == 3:
        require(panels[1]['commit'] == panels[2]['commit'], 'After states must use the same commit.')
    require(bool(regular) == bool(bold), 'Supply both --font and --bold-font.')
    if not regular:
        pair = next((pair for pair in FONT_PAIRS if all(Path(p).exists() for p in pair)), None)
        require(pair is not None, 'No supported font pair found; supply --font and --bold-font.')
        regular, bold = pair
    scale = min(sx, sy)
    px = lambda value: round(value * scale)
    title_font = ImageFont.truetype(str(bold), px(16))
    caption_font = ImageFont.truetype(str(regular), px(14))
    box = (round(x * sx), round(y * sy), round((x + w) * sx), round((y + h) * sy))
    crops = [im.crop(box) for im in images]
    cw, ch = crops[0].size
    bg, fg, secondary, border = PALETTES[spec.get('frame', 'light')]
    measure = ImageDraw.Draw(Image.new('RGB', (1, 1)))
    captions = [lines(p.get('caption', ''), caption_font, cw, measure) for p in panels]
    for label in expected:
        require(measure.textlength(label, font=title_font) <= cw, 'Crop too narrow for the state label.')
    # Equal header heights keep the same landmark at the same offset in every panel.
    header = px(24 + (max(map(len, captions)) * 20) + 12)
    padding, gap = px(20), px(24)
    height = padding * 2 + len(panels) * (header + ch) + (len(panels) - 1) * gap
    canvas = Image.new('RGB', (cw + padding * 2, height), bg)
    draw = ImageDraw.Draw(canvas)
    top = padding
    for panel, caption, crop in zip(panels, captions, crops):
        draw.text((padding, top), panel['label'], font=title_font, fill=fg)
        for index, line in enumerate(caption):
            draw.text((padding, top + px(24 + index * 20)), line, font=caption_font, fill=secondary)
        canvas.paste(crop, (padding, top + header))
        draw.rectangle((padding - 1, top + header - 1, padding + cw, top + header + ch), outline=border)
        top += header + ch + gap
    output.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(output)
    require(output.stat().st_size < 10_000_000, 'PNG exceeds GitHub’s image limit; reduce the capture area.')
    preview = output.with_name(output.stem + '-preview.png')
    preview_width = min(720, round(canvas.width / scale))
    canvas.resize((preview_width, round(canvas.height * preview_width / canvas.width)), Image.Resampling.LANCZOS).save(preview)
    print(json.dumps({'output': str(output), 'preview': str(preview), 'font': str(regular),
                      'capture_scale': scale, 'output_pixels': canvas.size}))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('spec', type=Path)
    parser.add_argument('output', type=Path)
    parser.add_argument('--font', type=Path)
    parser.add_argument('--bold-font', type=Path)
    args = parser.parse_args()
    try:
        compose(args.spec, args.output, args.font, args.bold_font)
    except (ValueError, KeyError, OSError) as error:
        parser.exit(1, f'Comparison rejected: {error}\n')
