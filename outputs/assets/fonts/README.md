# Fonts bundled with the course

`NotoSans.ttf` is Noto Sans, a variable TrueType font from the Google Fonts Noto Sans family. The file is bundled unchanged and embedded in PDF reports so Russian text remains readable on devices without this font installed.

The course UI uses local WOFF2 subsets of Noto Sans and Noto Sans Mono. They include Latin, Cyrillic, and Cyrillic Extended glyphs (including Kyrgyz letters), and are served from this folder with `font-display: swap`. The course and student assignment service workers cache all six subsets, so no font request goes to an external host at runtime.

Copyright 2022 The Noto Project Authors and contributors. The font is licensed under the SIL Open Font License, Version 1.1. The full license is in [`OFL.txt`](OFL.txt).

Source: <https://github.com/google/fonts/tree/main/ofl/notosans> and <https://github.com/google/fonts/tree/main/ofl/notosansmono>

The Noto Sans and Noto Sans Mono families are licensed under the SIL Open Font License, Version 1.1; the full license is in [`OFL.txt`](OFL.txt). PDF output is generated with PDFKit and the font is loaded from this local directory; report generation does not fetch fonts at runtime.
