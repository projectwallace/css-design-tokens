import { cssKeywords as css_keywords } from '@projectwallace/css-analyzer'
import { type ColorValue, type ColorSpace } from './types.js'
import { colordx, extend, getFormat, type ColorFormat, type Colordx } from '@colordx/core'
import hwb from '@colordx/core/plugins/hwb'
import lab from '@colordx/core/plugins/lab'
import lch from '@colordx/core/plugins/lch'
import p3 from '@colordx/core/plugins/p3'
import rec2020 from '@colordx/core/plugins/rec2020'
import a98rgb from '@colordx/core/plugins/a98rgb'
import prophoto from '@colordx/core/plugins/prophoto'
import names from '@colordx/core/plugins/names'

extend([hwb, lab, lch, p3, rec2020, a98rgb, prophoto, names])

// Full precision, to avoid rounding differences from the original authored value
const PRECISION = 15

type Converted = Pick<ColorValue, 'components' | 'alpha'>

// `color()` spaces sharing colordx's { r, g, b, alpha } shape on a 0-1 scale
function rgb_triple(value: { r: number; g: number; b: number; alpha: number }): Converted {
	return { components: [value.r, value.g, value.b], alpha: value.alpha }
}

// hex/rgb()/named colors: colordx's toRgb() is 0-255 and unscaled, unlike every other `toX()`
function to_srgb(color: Colordx): Converted {
	let value = color.toRgb()
	return {
		components: [value.r / 255, value.g / 255, value.b / 255],
		alpha: value.alpha,
	}
}

// To map the `getFormat()` return value to a DTCG ColorSpace
const FORMAT_TO_SPACE: Partial<Record<ColorFormat, ColorSpace>> = {
	hex: 'srgb',
	rgb: 'srgb',
	name: 'srgb',
	p3: 'display-p3',
	xyz: 'xyz-d50',
}

// colordx has no space-agnostic "raw channels" API: every space needs its own accessor
// since the returned properties differ (r/g/b, h/s/l, l/a/b, l/c/h, x/y/z, ...)
const CONVERTERS: Partial<Record<ColorFormat, (color: Colordx) => Converted>> = {
	hex: to_srgb,
	rgb: to_srgb,
	name: to_srgb,
	hsl: (color) => {
		let value = color.toHsl(PRECISION)
		return { components: [value.h, value.s, value.l], alpha: value.alpha }
	},
	hwb: (color) => {
		let value = color.toHwb(PRECISION)
		return { components: [value.h, value.w, value.b], alpha: value.alpha }
	},
	lab: (color) => {
		let value = color.toLab(PRECISION)
		return { components: [value.l, value.a, value.b], alpha: value.alpha }
	},
	lch: (color) => {
		let value = color.toLch(PRECISION)
		return { components: [value.l, value.c, value.h], alpha: value.alpha }
	},
	oklab: (color) => {
		let value = color.toOklab(PRECISION)
		return { components: [value.l, value.a, value.b], alpha: value.alpha }
	},
	oklch: (color) => {
		let value = color.toOklch(PRECISION)
		return { components: [value.l, value.c, value.h], alpha: value.alpha }
	},
	p3: (color) => rgb_triple(color.toP3(PRECISION)),
	rec2020: (color) => rgb_triple(color.toRec2020(PRECISION)),
	'a98-rgb': (color) => rgb_triple(color.toA98(PRECISION)),
	'prophoto-rgb': (color) => rgb_triple(color.toProphoto(PRECISION)),
	xyz: (color) => {
		let value = color.toXyz(PRECISION)
		return { components: [value.x, value.y, value.z], alpha: value.alpha }
	},
	'xyz-d65': (color) => {
		let value = color.toXyzD65(PRECISION)
		return { components: [value.x, value.y, value.z], alpha: value.alpha }
	},
}

export function color_to_token(color: string): ColorValue | null {
	let lowercased = color.toLowerCase()

	if (
		css_keywords.has(lowercased) ||
		lowercased === 'currentcolor' ||
		lowercased.includes('var(')
	) {
		return null
	}

	let parsed = colordx(color)
	if (!parsed.isValid()) {
		return null
	}

	let format = getFormat(color)

	if (!format) {
		return null
	}

	let colorSpace = (FORMAT_TO_SPACE[format] ?? format) as ColorSpace
	let converter_fn = format && CONVERTERS[format]

	if (!converter_fn) {
		return null
	}

	return { colorSpace, ...converter_fn(parsed) }
}
