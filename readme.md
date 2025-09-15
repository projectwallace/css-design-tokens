# css-design-tokens

Create Design Tokens by going through CSS to find colors, font-sizes, gradients etcetera and turn them into a [Design Tokens spec](https://tr.designtokens.org/)-compliant token format.

## Table of contents

- [Installation](#installation)
- [Usage](#usage)
- [Token types](#token-types)
  - [Color](#color)
  - [Font-size](#font-size)
  - [Font-family](#font-family)
  - [Line-height](#line-height)
  - [Gradient](#gradient)
  - [Box-shadow](#box-shadow)
  - [Radius](#radius)
  - [Duration](#duration)
  - [Easing](#easing)
- [Extensions](#extensions)
- [Acknowledgements](#acknowledgements)

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

## Token types

### Color

['Color' Design Token format](https://www.designtokens.org/tr/third-editors-draft/color/#format)

Only fully compliant colors are listed. Colors that can't be parsed by [colorjs.io](https://colorjs.io/) are ignored, like `rgb(var(--red) var(--green) var(--blue))` or CSS system colors like `ButtonText`.

- The optional `alpha` property is _always_ present.
- The optional `hex` fallback property is _never_ present.
- In addition to other tokens all colors have a `com.projectwallace.css-properties` extension that contains all the CSS properties that a specific color was used for.

```js
let { color } = css_to_tokens(`.my-design-system { color: green; }`)

let color = {
  'green-5e0cf03': {
    $type: 'color',
    $value: {
      colorSpace: 'srgb',
      components: [0, 0.5019607843137255, 0],
      alpha: 1,
    },
    $extensions: {
      'com.projectwallace.css-authored-as': 'green',
      'com.projectwallace.usage-count': 2,
      'com.projectwallace.css-properties': ['color', 'border-color'],
    }
  }
}
```

### Font-size

['Dimension' Design Token format](https://www.designtokens.org/tr/third-editors-draft/format/#dimension)

Font-sizes are listed as `$type: 'dimension'` types if the font-size is declared with either `px` or `rem` or as plain type-less tokens otherwise.

```js
let { font_size } = css_to_tokens(`.my-design-system {
  .my-design-system {
    font-size: 16px;
    font-size: 1rem;
    font-size: 20vmin;
  }
}`)

let font_size = {
  'fontSize-171eed': {
    $type: 'dimension',
    $value: {
      value: 16,
      unit: 'px'
    },
    $extensions: {
      'com.projectwallace.css-authored-as': '16px',
      'com.projectwallace.usage-count': 1,
    }
  },
  'fontSize-582e015a': {
    $value: '20vmin',
    $extensions: {
      'com.projectwallace.css-authored-as': '20vmin',
      'com.projectwallace.usage-count': 1,
    }
  },
}
```

### Font-family

['fontFamily' Design Token format](https://www.designtokens.org/tr/third-editors-draft/format/#font-family)

Font-families are _always_ listed as `$type: 'fontFamily'`.

```js
let { font_family } = css_to_tokens(`.my-design-system {
  .my-design-system {
    font-family: 'Inter';
    font-family: Arial Black, sans-serif;
  }
}`)

let font_family = {
  'fontFamily-3375cf09': {
    $type: 'fontFamily',
    $value: ['\'Inter\''],
    $extensions: {
      'com.projectwallace.css-authored-as': '\'Inter\'',
      'com.projectwallace.usage-count': 1,
    }
  },
  'fontFamily-582e015a': {
    $value: ['Arial Black', 'sans-serif'],
    $extensions: {
      'com.projectwallace.css-authored-as': 'Arial Black, sans-serif',
      'com.projectwallace.usage-count': 1,
    }
  },
}
```

### Line-height

Line heights can either be `dimension` or `number` types, or a plain type-less token. This depends on how well the value can be mapped to a valid token.

```ts
let { line_height } = css_to_tokens(`
  .my-design-system {
    line-height: 1.5rem; /* rem -> type=dimension */
    line-height: 1.5; /* no unit -> type=number */
    line-height: 20vmin; /* can not be mapped to valid token type */
  }
`)

let line_height = {
  'lineHeight-563f7fe2': {
    $type: 'dimension',
    $value: {
      value: 1.5,
      unit: 'rem'
    },
    $extensions: {
      'com.projectwallace.css-authored-as': '1.5rem',
      'com.projectwallace.usage-count': 1,
    }
  },
  'lineHeight-bdb8': {
    $type: 'number',
    $value: 1.5,
    $extensions: {
      'com.projectwallace.css-authored-as': '1.5',
      'com.projectwallace.usage-count': 1,
    }
  },
  'lineHeight-582e015a': {
    $value: '20vmin',
    $extensions: {
      'com.projectwallace.css-authored-as': '20vmin',
      'com.projectwallace.usage-count': 1,
    }
  }
}
```

### Gradient

Gradients are passed as-is, no mapping is done. This is because the spec is currently too limited in expressing a CSS gradient.

```ts
let { gradient } = css_to_tokens(`
  .my-design-system {
    background: linear-gradient(to right, red, blue);
  }
`)

let gradient = {
  'gradient-2aec04e5': {
    $value: 'linear-gradient(to right, red, blue)',
    $extensions: {
      'com.projectwallace.css-authored-as': 'linear-gradient(to right, red, blue)',
      'com.projectwallace.usage-count': 1,
    }
  }
}
```

### Box-shadow

['Shadow' Design Token type](https://www.designtokens.org/tr/third-editors-draft/format/#shadow)

- Multiple shadows can be mapped, so beware that `$value` van either be a single object or an array.
- Only if a box-shadow has a valid `color` type it will be mapped as a `box-shadow` type

```ts
let { box_shadow } = css_to_tokens(`
  .my-design-system {
    box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.5);
    box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.5), 0 0 10px 0 rgba(0, 0, 0, 0.5);
    box-shadow: 0 0 0 0 var(--red);
  }
`)

let box_shadow = {
  'boxShadow-6f90da6b': {
    $type: 'shadow',
    $value: {
      offsetX: {
        value: 0,
        unit: 'px'
      },
      offsetY: {
        value: 0,
        unit: 'px'
      },
      blur: {
        value: 10,
        unit: 'px'
      },
      spread: {
        value: 0,
        unit: 'px'
      },
      inset: false,
      color: {
        colorSpace: 'srgb',
        components: [0, 0, 0],
        alpha: 0.5,
      },
    },
    $extensions: {
      'com.projectwallace.css-authored-as': '0 0 10px 0 rgba(0, 0, 0, 0.5)',
      'com.projectwwallace.usage-count': 1,
    }
  },
  'boxShadow-be2751ac': {
    $type: 'shadow',
    $value: [
      {
        offsetX: {
          value: 0,
          unit: 'px'
        },
        offsetY: {
          value: 0,
          unit: 'px'
        },
        blur: {
          value: 10,
          unit: 'px'
        },
        spread: {
          value: 0,
          unit: 'px'
        },
        inset: false,
        color: {
          colorSpace: 'srgb',
          components: [0, 0, 0],
          alpha: 0.5,
        },
      },
      {
        offsetX: {
          value: 0,
          unit: 'px'
        },
        offsetY: {
          value: 0,
          unit: 'px'
        },
        blur: {
          value: 10,
          unit: 'px'
        },
        spread: {
          value: 0,
          unit: 'px'
        },
        inset: false,
        color: {
          colorSpace: 'srgb',
          components: [0, 0, 0],
          alpha: 0.5,
        },
      }
    ],
    $extensions: {
      'com.projectwwallace.css-authored-as': '0 0 10px 0 rgba(0, 0, 0, 0.5), 0 0 10px 0 rgba(0, 0, 0, 0.5)',
      'com.projectwwallace.usage-count': 1,
    }
  },
  'boxShadow-j4h5gas5h': {
    $value: '0 0 0 0 var(--red)',
    $extensions: {
      'com.projectwwallace.css-authored-as': '0 0 0 0 var(--red)',
      'com.projectwwallace.usage-count': 1,
    }
  }
}
```

### Radius

Radii are passed as-is, no mapping is done.

```ts
let { radius } = css_to_tokens(`
  .my-design-system {
    border-radius: 10px;
  }
`)

let radius = {
  'radius-170867': {
    $value: '10px',
    $extensions: {
      'com.projectwwallace.css-authored-as': '10px',
      'com.projectwwallace.usage-count': 1,
    }
  }
}
```

### Duration

['Duration' Design Token type](https://www.designtokens.org/tr/third-editors-draft/format/#duration)

Durations can either be animation- or transition-durations or -delays. Even though `s` is a valid unit we _always_ map to `ms`.

```ts
let { duration } = css_to_tokens(`
  .my-design-system {
    animation-duration: 1s;
  }
`)

let duration = {
  'duration-17005f': {
    $type: 'duration',
    $value: {
      value: 1000,
      unit: 'ms'
    },
    $extensions: {
      'com.projectwwallace.css-authored-as': '1s',
      'com.projectwwallace.usage-count': 1,
    }
  }
}
```

### Easing

['Cubic Bézier' Design Token type](https://www.designtokens.org/tr/third-editors-draft/format/#cubic-bezier)

Easings are mapped to cubic béziers when possible or represented as plain type-less tokens otherwise. [CSS Easing keywords](https://developer.mozilla.org/en-US/docs/Web/CSS/easing-function) are also converted to cubic béziers.

```ts
let actual = css_to_tokens(`
  .my-design-system {
    animation-timing-function: ease-in-out;
    animation-timing-function: cubic-bezier(0, 0, 0.5, .8);
    animation-timing-function: var(--test);
  }
`)

let easing = {
  'easing-ea6c7565': {
    $type: 'cubicBezier',
    $value: [
      0.42,
      0,
      0.58,
      1
    ],
    $extensions: {
      'com.projectwwallace.css-authored-as': 'ease-in-out',
      'com.projectwwallace.usage-count': 1,
    }
  },
  'easing-90111eba': {
    $type: 'cubicBezier',
    $value: [
      0,
      0,
      0.5,
      0.8
    ],
    $extensions: {
      'com.projectwwallace.css-authored-as': 'cubic-bezier(0, 0, 0.5, .8)',
      'com.projectwwallace.usage-count': 1,
    }
  },
  'easing-12bb7f36': {
    $value: 'var(--test)',
    $extensions: {
      'com.projectwwallace.css-authored-as': 'var(--test)',
      'com.projectwwallace.usage-count': 1,
    }
  }
}
```

## Extensions

This library adds a couple of potentially extensions to the design token values via the `com.projectwallace` namespace on the `$extensions` property of all generated design tokens.

### Authored CSS values

This package parses CSS into Design Tokens but also provides a way to get the authored CSS via the `$extensions['com.projectwallace.css-authored-as']` property on any of the tokens:

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

### Usage count

If you need to know how often a particalur design token was found in the CSS you can use the `$extensions['com.projectwallace.usage-count']` property on any of the tokens:

```ts
let { color } = css_to_tokens(`.my-design-system { color: green; }`)

// {
//   'green-5e0cf03': {
//     ...
//     $extensions: {
//       'com.projectwallace.usage-count': 1
//     }
//   },
// }

let green_count = color['green-5e0cf03']['$extensions']['com.projectwallace.usage-count']

// 1
```

### CSS property usage

__For color tokens only__

You can read the `$extensions['com.projectwallace.css-properties']` property to see for which CSS properties a color was used:

```ts
let { color } = css_to_tokens(`.my-design-system { color: green; }`)

// {
//   'green-5e0cf03': {
//     ...
//     $extensions: {
//       'com.projectwallace.css-properties': ['color']
//     }
//   },
// }

let properties = color['green-5e0cf03']['$extensions']['com.projectwallace.css-properties']

// ['color']
```

## Acknowledgements

- [CSSTree](https://github.com/csstree/csstree) does all the heavy lifting of parsing CSS
- [ColorJS.io](https://colorjs.io/) powers all color conversions necessary for grouping and sorting and converting into Color tokens

## Related projects

- [Design Tokens analyzer](https://www.projectwallace.com/design-tokens) - Online CSS to Design Tokens convernter, uses this package
- [CSS Analyzer](https://github.com/projectwallace/css-analyzer) - The best CSS analyzer that powers all analysis on [projectwallace.com](https://www.projectwallace.com?utm_source=github&utm_medium=wallace_css_design_tokens_related_projects)
- [Color Sorter](https://github.com/projectwallace/color-sorter) - Sort CSS colors
  by hue, saturation, lightness and opacity
- [CSS Time Sort](https://github.com/projectwallace/css-time-sort) - Sort an array of `<time>` values
