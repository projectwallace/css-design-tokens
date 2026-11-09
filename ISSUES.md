# css-analyzer rewrite: issues found integrating

Verified against `71e5b1b` (first integration) and `abf54a8` (fixes). With `abf54a8`: 169 tests pass,
`tsc`, lint, knip and build are clean, and no workarounds remain in the code.

## Fixed in abf54a8

1. Collector map couldn't be typed under `isolatedDeclarations` without hand-writing it → `DesignTokensCollectors` is exported from `/presets`.
2. Type exports were split across entry points → `CollectorDef`, `CountResult`, `ResultOf`, ... are exported from `/presets` and `/collectors`.
3. Presets couldn't take options → `design_tokens_collectors({ locations })`, with keys matching the collector names.
4. `by_context` was always typed as present → `WithContexts` only adds it when `contexts: true`.

## Open

1. **The design-tokens preset sets `contexts: true` on `border_radiuses`.** We don't use per-property radius counts,
   so this is extra work and memory. Ask: only enable contexts where the preset's consumers need them, or let
   `design_tokens_collectors` take per-collector overrides.

## Observations

- Bundled size (esbuild, minified, everything inlined): 145.7 kB → 134.9 kB (−7%), gzip 41.1 → 37.1 kB (−10%) compared to analyzer 9.9.6.
  Using the preset (instead of explicit collectors) doesn't change this: unused collectors (specificity, ...) are still tree-shaken.
- Our own `dist/index.js` is 17.1 kB (4.75 kB gzip), down from 17.9 kB (4.94 kB) before the rewrite.
- Old `cssKeywords` / `colorFunctions` map 1:1 to `/values` `keywords` / `color_functions`.
- Removed the `as unknown as` cast and ~40 lines of local analyzer result types.
