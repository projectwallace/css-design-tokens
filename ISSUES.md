# css-analyzer rewrite (pkg.pr.new `71e5b1b`, 9.9.7): issues found integrating

Integration result: all 169 tests pass unchanged in expectation, `tsc`, lint, build OK.
Nothing below was worked around in the code unless stated.

## Issues

1. **`css-parser` version mismatch fails at runtime, not install time.**
   Analyzer depends on `css-parser ~0.19.5`. With the consumer's `css-parser` pinned/overridden to `~0.19.4`
   (our pnpm `overrides`), install succeeds but imports crash:
   `SyntaxError: The requested module '@projectwallace/css-parser' does not provide an export named 'walk_values'` (also `property_basename`).
   Ask: make it a `peerDependency` with a range, or avoid relying on new parser exports within a patch range.
   (We bumped our catalog to `~0.19.5`; that is the fix on our side, not a workaround.)

2. **No way to type a collector map under `isolatedDeclarations` without hand-writing it.**
   `ResultOf<typeof collectors>` is great, but exporting anything derived from an inferred collector map
   fails with TS9013. We had to hand-write
   `{ colors: CollectorDef<ColorsResult>, font_sizes: CollectorDef<CountResult>, ... }` (see `Collectors` in `src/index.ts`).
   This duplicates the analyzer's knowledge of each collector's result type and can drift.
   Ask: export per-collector return types (e.g. `Colors = ReturnType<typeof colors>`), or a helper type.

3. **Type exports are split across entry points.** `CollectorDef`, `CountResult`, `ContextCountResult`, `ResultOf` come from the root,
   `ColorsResult` etc. from `/collectors`. Two imports for one type signature; pick one home (or re-export all from root).

4. **Presets can't be parameterized.** `design_tokens_collectors` is exactly what we need but has no `locations` option
   (we support analyses with locations) and uses different keys (`radii`, `easings`). We use explicit collectors instead,
   which means re-listing the set ourselves. Ask: preset factory, e.g. `design_tokens_collectors({ locations: true })`.

5. **`contexts: true` only affects colors for us, but the option shape differs per collector.**
   `border_radiuses` is a `ContextCountResult` even without `contexts`, giving an always-present-but-empty `by_context`.
   Minor typing/ergonomics: result type claims data that isn't there unless opted in.

## Observations (no action needed)

- Installing from the `pkg.pr.new` tarball URL works with `blockExoticSubdeps` (direct dep).
- Old `cssKeywords` / `colorFunctions` map 1:1 to `/values` `keywords` / `color_functions`.
- Bundle size: our own `dist/index.js` unchanged (17.9 → 17.7 kB; analyzer is external). Bundling everything (esbuild, minified):
  145.7 kB → 134.9 kB (−7%), gzip 41.1 → 37.1 kB (−10%). Unused collectors (specificity, atrules, ...) are not pulled in.
  Note the analyzer's on-disk `dist` is larger (83 kB → 112 kB) because of per-collector chunking; irrelevant once tree-shaken.
- Result types are now far better: removed `as unknown as` cast and ~40 lines of local `Collection`/`ItemsPerContext` types.
