"""Rebuild French subsets from the pinned Fontsource fonts. Keeps wght axes.
Requires fonttools and brotli; no Node dependency or network at build time.
"""
from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont

root = Path(__file__).resolve().parents[1]
out = root / 'src/assets/fonts'
out.mkdir(parents=True, exist_ok=True)
# French Latin, punctuation and arrows. Greek is a separate unicode-range.
unicodes = list(range(0x20, 0x7f)) + [ord(c) for c in 'ÀÂÆÇÉÈÊËÎÏÔŒÙÛÜŸàâæçéèêëîïôœùûüÿ«»\u00a0'] + [0x131, 0x152, 0x153, 0x178] + list(range(0x2000, 0x2070)) + [0x20ac, 0x2122] + list(range(0x2190, 0x2200))
for family, source, target in [
 ('@fontsource-variable/newsreader', 'newsreader-latin-wght-normal.woff2', 'newsreader-fr-normal.woff2'),
 ('@fontsource-variable/newsreader', 'newsreader-latin-wght-italic.woff2', 'newsreader-fr-italic.woff2'),
 ('@fontsource-variable/jetbrains-mono', 'jetbrains-mono-latin-wght-normal.woff2', 'jetbrains-fr.woff2'),
]:
 font = TTFont(root / 'node_modules' / family / 'files' / source)
 options = subset.Options(); options.flavor = 'woff2'; options.layout_features = ['kern', 'liga', 'clig', 'calt']
 worker = subset.Subsetter(options=options); worker.populate(unicodes=unicodes); worker.subset(font)
 font.flavor = 'woff2'; font.save(out / target)
 # Evidence: French forms exist in the font cmap, and variable axes survive.
 cmap = font.getBestCmap()
 assert all(ord(c) in cmap for c in 'œÉàçê'), target
 assert 'fvar' in font, target
 print(target, (out / target).stat().st_size, 'bytes; variable wght retained; œ É verified')
 (out / (target + '.LICENSE')).write_text((root / 'node_modules' / family / 'LICENSE').read_text(encoding='utf-8'), encoding='utf-8')

