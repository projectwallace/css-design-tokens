# css-design-tokens

Create Design Tokens by going through CSS to find colors, font-sizes, gradients etcetera and turn them into a [Design Tokens spec](https://tr.designtokens.org/)-compliant token format.

## Installation

```sh
npm install @projectwallace/css-design-tokens
```

## Usage

```js
import { css_to_tokens } from '@projectwallace/css-design-tokens'

let {
  color,
  font_size,
  font_family,
  line_height,
  gradient,
  box_shadow,
  radius,
  duration,
  easing,
} = css_to_tokens(`.my-design-system { color: green; }`)

// Or if you already have done CSS analysis with @projectwallace/css-analyzer
import { analyze } from '@projectwallace/css-analyzer'
import { analysis_to_tokens } from '@projectwallace/css-design-tokens'

let analysis = analyze(`.my-design-system { color: green; }`, {
  useLocations: true // may be `true` or `false`, it works either way
})
let tokens = analysis_to_tokens(analysis)
```

### Stable unique token ID's

All tokens have a stabe unique ID using a very simple hashing algorithm. This is helpful when you run analysis multiple times over your project and lets you identify removed or added tokens easily.

```ts
let { color } = css_to_tokens(
  `.my-design-system {
    color: green;
    color: rgb(100 100 100 / 20%);
  }`
)

// {
//   'green-5e0cf03': {
//     $type: 'color',
//     ...
//   },
//   'grey-8139d9b': {
//     $type: 'color',
//     ...
//   }
// }
```

### Getting authored values

The tokens output parses most CSS into Design Tokens but in most cases it also provides a way to get the authored CSS via the `$extensions` property. The custom identifier for this project is `com.projectwallace` and the authored values can be found with `com.projectwallace.css-authored-as` on the `$extensions` object.

```ts
let { color } = css_to_tokens(`.my-design-system { color: green; }`)

// {
//   'green-5e0cf03': {
//     ...
//     $extensions: {
//       'com.projectwallace.css-authored-as': 'green'
//     }
//   },
// }

let authored_green = color['green-5e0cf03']['$extensions']['com.projectwallace.css-authored-as']

// 'green'
```

## Acknowledgements

- [CSSTree](https://github.com/csstree/csstree) does all the heavy lifting of parsing CSS
- [ColorJS.io](https://colorjs.io/) powers all color conversions necessary for grouping and sorting and converting into Color tokens

## Related projects

- [Design Tokens analyzer](https://www.projectwallace.com/design-tokens) - Online CSS to Design Tokens convernter, uses this package
- [CSS Analyzer](https://github.com/projectwallace/css-analyzer) - The best CSS analyzer that powers all analysis on [projectwallace.com](https://www.projectwallace.com?utm_source=github&utm_medium=wallace_format_css_related_projects)
- [Color Sorter](https://github.com/projectwallace/color-sorter) - Sort CSS colors
  by hue, saturation, lightness and opacity
- [CSS Time Sort](https://github.com/projectwallace/css-time-sort) - Sort an array of `<time>` values
