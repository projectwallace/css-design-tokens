# css-design-tokens

Create Design Tokens by going through CSS to find colors, font-sizes, gradients etcetera and turn them into a spec-compliant token format.

## Installation

```sh
npm install @projectwallace/css-design-tokens
```

## Usage

```js
import { css_to_tokens } from '@projectwallace/css-design-tokens'

let tokens = css_to_tokens(`.my-design-system { color: green; }`)

// Or if you already have done CSS analysis with @projectwallace/css-analyzer:
// NOTE: it is important that `useLocations` is true
import { analyze } from '@projectwallace/css-analyzer'
import { analysis_to_tokens } from '@projectwallace/css-design-tokens'

let analysis = analyze(`.my-design-system { color: green; }`, {
  useLocations: true // MUST be true
})
let tokens = analysis_to_tokens(analysis)
```

## Acknowledgements

- ColorJS.io powers all color conversions necessary for grouping and sorting

## Related projects

- [CSS Analyzer](https://github.com/projectwallace/css-analyzer) - The best CSS analyzer that powers all analysis on [projectwallace.com](https://www.projectwallace.com?utm_source=github&utm_medium=wallace_format_css_related_projects)
- [Color Sorter](https://github.com/projectwallace/color-sorter) - Sort CSS colors
  by hue, saturation, lightness and opacity
