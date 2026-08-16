#!/usr/bin/env python3
"""Converts the app's store screenshots into the sizes this site serves.

    python3 scripts/make-screens.py

Reads from the app repository, which is read-only from here, and writes WebP
into `public/screens/`. Nothing is retouched, composited or cropped: what the
page shows is the capture, at a smaller size. The rounded corners and the
shadow are CSS, so the image itself stays an honest screenshot.

WHICH FRAMES, AND WHY NOT THE OTHERS — every frame in that folder was looked
at by eye before this list was written (CLAUDE.md rule 5):

  01-board    the board. SPEC §7 makes it the hero: it shows the method in a
              second — money still to be assigned, then envelopes with what is
              left in each.
  02-newspend entering a spend.
  03-reports  reports. "An observation, calculated from your own figures" is
              on the screen itself, which is the no-advice rule made visible.

  04-year     NOT USED. Ten of its twelve months read $0.00, because the demo
              budget only has two months of history. It is a true screenshot
              of an empty year and it makes the app look empty.
  01-board iPad  NOT USED. Current design and a fuller board, but half the
              frame is "No Envelope Selected" and there is a cursor artifact
              in the corner. A weak image is worse than no image; the iPad is
              stated in words instead.
  iap-review-paywall  NOT USED. It exists for App Review, not for a shopfront.
  ux-review-2026-08-16/*  NEVER USE. That folder is the design from *before*
              the August design pass — the one the owner called "сделано на
              коленке". `ux-02-board.png` in particular looks like an ordinary
              board screenshot and is the easiest mistake in this repository
              to make.
"""

from pathlib import Path

from PIL import Image

SOURCE = Path.home() / 'Downloads/kuvert/Screenshots'
OUT = Path(__file__).resolve().parent.parent / 'public/screens'

# name in public/screens → file in the app repository
FRAMES = {
    'board': '01-board-iPhone-17-Pro.png',
    'newspend': '02-newspend-iPhone-17-Pro.png',
    'reports': '03-reports-iPhone-17-Pro.png',
}

# The widths the layout asks for, and their retina pairs.
WIDTHS = (360, 720)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)

    for name, filename in FRAMES.items():
        source = SOURCE / filename
        if not source.exists():
            raise SystemExit(f'missing: {source}')

        original = Image.open(source).convert('RGB')
        for width in WIDTHS:
            height = round(original.height * width / original.width)
            resized = original.resize((width, height), Image.LANCZOS)
            target = OUT / f'{name}-{width}.webp'
            resized.save(target, 'WEBP', quality=82, method=6)
            print(f'{target.name:24} {width}×{height}  {target.stat().st_size // 1024} kB')

        print(f'  (source {original.width}×{original.height})')


if __name__ == '__main__':
    main()
