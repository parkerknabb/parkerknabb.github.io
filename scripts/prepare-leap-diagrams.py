#!/usr/bin/env python3
"""Copy LEAP source SVGs and make palette-only, theme-aware web previews.

Usage: python3 scripts/prepare-leap-diagrams.py /path/to/source/directory
The original SVGs remain unchanged; only the *-preview.svg files are themed.
"""
from pathlib import Path
import re
import math
import subprocess
import tempfile
from PIL import Image
import sys
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(sys.argv[1])
OUTPUT = ROOT / 'images' / 'diagrams'
PALETTE = {
    '#000000': ('ink', '#000000', '#e8edf5'),
    '#202122': ('secondary-ink', '#202122', '#c6d0de'),
    '#cfe2f3': ('node', '#cfe2f3', '#20364b'),
    '#ffffff': ('paper', '#f7f9fc', '#080e1a'),
    '#ff0000': ('red', '#ff0000', '#ff6262'),
    '#ff9900': ('orange', '#ff9900', '#ffb347'),
    '#9900ff': ('purple', '#9900ff', '#b981ff'),
    '#ff00ff': ('magenta', '#ff00ff', '#f478ed'),
    '#38761d': ('green', '#38761d', '#82bd60'),
}
light = ';'.join(f'--drawing-{name}:{day}' for name, day, night in PALETTE.values())
dark = ';'.join(f'--drawing-{name}:{night}' for name, day, night in PALETTE.values())
style = f'<style>:root{{{light}}}@media(prefers-color-scheme:dark){{:root{{{dark}}}}}</style>'
OUTPUT.mkdir(parents=True, exist_ok=True)
for original, slug in [('Video Signal Flow.svg', 'signal'), ('Video Power Flow.svg', 'power')]:
    source = (SOURCE / original).read_text()
    svg = ET.fromstring(source)
    if any(e.tag.split('}')[-1] in {'script', 'foreignObject', 'image'} for e in svg.iter()):
        raise ValueError(f'Unexpected embedded content in {original}')
    if re.search(r'\bon\w+\s*=|(?:href|src)=["\'](?:https?:|javascript:)', source, re.I):
        raise ValueError(f'Unexpected active content in {original}')
    (OUTPUT / f'leap-imag-{slug}.svg').write_text(source)
    # Measure painted pixels, excluding the export's transparent canvas.
    # Render at 2x so thin strokes are included accurately, then allow 12 SVG units.
    x, y, width, height = map(float, svg.get('viewBox').split())
    with tempfile.TemporaryDirectory() as temporary:
        rendered = Path(temporary) / 'bounds.png'
        subprocess.run(['rsvg-convert', '--zoom', '2', str(SOURCE / original), '-o', str(rendered)], check=True)
        with Image.open(rendered) as image:
            bounds = image.getchannel('A').getbbox()
            if bounds is None:
                raise ValueError(f'Empty drawing in {original}')
            sx, sy = width / image.width, height / image.height
            left = math.floor(x + bounds[0] * sx) - 12
            top = math.floor(y + bounds[1] * sy) - 12
            right = math.ceil(x + bounds[2] * sx) + 12
            bottom = math.ceil(y + bounds[3] * sy) + 12
    crop_width, crop_height = right - left, bottom - top
    print(f'{slug}: preview dimensions {crop_width} x {crop_height}, viewBox {left} {top} {crop_width} {crop_height}')
    themed = re.sub(r'viewBox="[^"]+"', f'viewBox="{left} {top} {crop_width} {crop_height}"', source, count=1)
    for color, (name, _, _) in PALETTE.items():
        themed = themed.replace(f'"{color}"', f'"var(--drawing-{name})"')
    end = themed.index('>') + 1
    # Transparent parts of the drawing reveal this canvas. Geometry is untouched.
    themed = themed[:end] + style + f'<rect x="{left}" y="{top}" width="{crop_width}" height="{crop_height}" fill="var(--drawing-paper)"/>' + themed[end:]
    (OUTPUT / f'leap-imag-{slug}-preview.svg').write_text(themed)
