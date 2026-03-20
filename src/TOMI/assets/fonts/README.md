# SangBleu Font Files

Place the following SangBleu font files in this directory.
The files are commercial — obtain them from Swiss Typefaces (swisstype.faces).

Required files:
- `SangBleu-Regular.otf`   → fontFamily: 'SangBleu-Regular'
- `SangBleu-Medium.otf`    → fontFamily: 'SangBleu-Medium'
- `SangBleu-Bold.otf`      → fontFamily: 'SangBleu-Bold'
- `SangBleu-Black.otf`     → fontFamily: 'SangBleu-Black'

When files are present, `constants/fonts.ts` will reference them and
`app/_layout.tsx` will load them via `useFonts`.

Until the files are added the app gracefully falls back to the system font.
