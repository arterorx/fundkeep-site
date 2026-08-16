#!/usr/bin/env python3
"""Draws public/apple-touch-icon.png and public/og.png.

    python3 scripts/make-images.py

Two bitmaps that browsers and link previews will not take as SVG. Kept as a
script rather than as files somebody once exported, so the share card can be
corrected the way everything else on this site is corrected: change the
constant, run it again.

The icon is the same drawing as `Scripts/make-icon.swift` in the app
repository — envelope with a banknote rising out of it, on a slate-blue plate
— transcribed rather than copied. The app repository is read-only from here,
and this site's repository is public, so nothing of the app comes across
except these numbers.

Needs Pillow. It is not a dependency of the site build: the PNGs are
committed, and this runs only when they change.

Every word on the share card obeys the same rules as the pages (CLAUDE.md):
platforms and payment model are checkable facts, and nothing here advises
anybody what to do with money.
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parent.parent / 'public'
SS = 2  # supersample, then downscale: cheap way to get clean edges

# --- The icon's palette, from the app's own drawing script -------------------
PLATE_TOP = (33, 51, 74)
PLATE_BOTTOM = (18, 28, 43)
ENVELOPE_FRONT = (245, 242, 235)
ENVELOPE_BACK = (214, 209, 199)
ENVELOPE_EDGE = (184, 178, 168)
NOTE = (51, 158, 107)
NOTE_DARK = (38, 128, 87)

# --- The share card ----------------------------------------------------------
W, H = 1200, 630
PAPER = (247, 248, 251)
TEXT = (23, 26, 34)
MUTED = (78, 85, 104)
RULE = (220, 225, 238)
ACCENT = (43, 67, 150)

TITLE = 'Fundkeep'
LINE = 'Envelope budgeting, bought once'
SUB = 'Give every dollar a job on iPhone, iPad and Mac'
FOOT = 'One purchase  ·  No subscription  ·  No bank logins'

# The system face, which is what the app itself is set in. A downloaded font
# would be a third-party file, and this site does not have any.
SYSTEM_FONT = '/System/Library/Fonts/SFNS.ttf'
FALLBACK_FONT = '/System/Library/Fonts/HelveticaNeue.ttc'


def font(size: int, weight: str = 'Regular') -> ImageFont.FreeTypeFont:
    """SF Pro at a named weight, falling back to Helvetica Neue."""
    try:
        f = ImageFont.truetype(SYSTEM_FONT, size * SS)
        f.set_variation_by_name(weight)
        return f
    except (OSError, AttributeError):
        return ImageFont.truetype(FALLBACK_FONT, size * SS)


def rounded(draw: ImageDraw.ImageDraw, box, radius, **kw) -> None:
    draw.rounded_rectangle(box, radius=radius, **kw)


def draw_icon(size: int) -> Image.Image:
    """The app icon at `size` pixels, drawn at SS× and downscaled."""
    px = size * SS
    img = Image.new('RGBA', (px, px), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Plate, with the vertical gradient of the app icon: lighter at the top.
    for y in range(px):
        t = y / max(1, px - 1)
        draw.line(
            [(0, y), (px, y)],
            fill=tuple(
                round(a + (b - a) * t) for a, b in zip(PLATE_TOP, PLATE_BOTTOM)
            ),
        )
    # Mask the plate into the rounded square Apple expects.
    mask = Image.new('L', (px, px), 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        [0, 0, px - 1, px - 1], radius=round(px * 0.2197), fill=255
    )
    img.putalpha(mask)

    # Everything below is a fraction of the plate, exactly as the app draws it.
    s = px / 1024
    rounded(draw, [194.5 * s, 333.2 * s, 829.5 * s, 752.3 * s],
            38 * s, fill=ENVELOPE_BACK)
    rounded(draw, [321.5 * s, 226.6 * s, 702.5 * s, 612.2 * s],
            19 * s, fill=NOTE)
    rounded(draw, [390.1 * s, 305.6 * s, 633.9 * s, 326.8 * s],
            10.6 * s, fill=NOTE_DARK)
    rounded(draw, [428.2 * s, 367.3 * s, 595.8 * s, 388.5 * s],
            10.6 * s, fill=NOTE_DARK)

    # Front panel, with the flap's V cut out of its top edge.
    front = [
        (194.5 * s, 386 * s),
        (512 * s, 509.2 * s),
        (829.5 * s, 386 * s),
        (829.5 * s, 714.2 * s),
        (791.4 * s, 752.3 * s),
        (232.6 * s, 752.3 * s),
        (194.5 * s, 714.2 * s),
    ]
    draw.polygon(front, fill=ENVELOPE_FRONT, outline=ENVELOPE_EDGE,
                 width=max(1, round(4 * s)))

    return img.resize((size, size), Image.LANCZOS)


def draw_card() -> Image.Image:
    img = Image.new('RGB', (W * SS, H * SS), PAPER)
    draw = ImageDraw.Draw(img)

    pad = 76 * SS
    icon_px = 104 * SS
    icon = draw_icon(icon_px)
    img.paste(icon, (pad, pad), icon)

    # Wordmark, optically centred against the icon rather than top-aligned.
    title_font = font(50, 'Bold')
    title_box = draw.textbbox((0, 0), TITLE, font=title_font)
    draw.text(
        (pad + icon_px + 28 * SS,
         pad + (icon_px - (title_box[3] - title_box[1])) / 2 - title_box[1]),
        TITLE,
        font=title_font,
        fill=TEXT,
    )

    draw.text((pad, pad + icon_px + 62 * SS), LINE,
              font=font(62, 'Bold'), fill=TEXT)
    draw.text((pad, pad + icon_px + 148 * SS), SUB,
              font=font(34, 'Regular'), fill=MUTED)

    rule_y = H * SS - pad - 62 * SS
    draw.line([(pad, rule_y), (W * SS - pad, rule_y)], fill=RULE, width=2 * SS)
    draw.text((pad, rule_y + 22 * SS), FOOT,
              font=font(26, 'Medium'), fill=ACCENT)

    return img.resize((W, H), Image.LANCZOS)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)

    # 180 px is what iOS asks for; nothing on the web needs it larger.
    icon = draw_icon(180)
    icon.save(OUT / 'apple-touch-icon.png', optimize=True)
    print(f'wrote {OUT / "apple-touch-icon.png"} (180×180)')

    card = draw_card()
    card.save(OUT / 'og.png', optimize=True)
    print(f'wrote {OUT / "og.png"} ({W}×{H})')


if __name__ == '__main__':
    main()
