import { cssKeywords as css_keywords } from '@projectwallace/css-analyzer'
import { EXTENSION_CSS_PROPERTIES, type BaseToken } from './types.ts'
import { colordx, extend, getFormat, type ColorFormat, type Colordx } from '@colordx/core'
import hwb from '@colordx/core/plugins/hwb'
import lab from '@colordx/core/plugins/lab'
import lch from '@colordx/core/plugins/lch'
import p3 from '@colordx/core/plugins/p3'
import rec2020 from '@colordx/core/plugins/rec2020'
import a98rgb from '@colordx/core/plugins/a98rgb'
import prophoto from '@colordx/core/plugins/prophoto'
import names from '@colordx/core/plugins/names'
import { str_equals, str_index_of } from '@projectwallace/css-parser/string-utils'

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
	const value = color.toRgb()
	return {
		components: [value.r / 255, value.g / 255, value.b / 255],
		alpha: value.alpha,
	}
}

// colordx returns XYZ on a 0-100 scale, DTCG expects 0-1
function xyz_triple(value: { x: number; y: number; z: number; alpha: number }): Converted {
	return { components: [value.x / 100, value.y / 100, value.z / 100], alpha: value.alpha }
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
		const value = color.toHsl(PRECISION)
		return { components: [value.h, value.s, value.l], alpha: value.alpha }
	},
	hwb: (color) => {
		const value = color.toHwb(PRECISION)
		return { components: [value.h, value.w, value.b], alpha: value.alpha }
	},
	lab: (color) => {
		const value = color.toLab(PRECISION)
		return { components: [value.l, value.a, value.b], alpha: value.alpha }
	},
	lch: (color) => {
		const value = color.toLch(PRECISION)
		return { components: [value.l, value.c, value.h], alpha: value.alpha }
	},
	oklab: (color) => {
		const value = color.toOklab(PRECISION)
		return { components: [value.l, value.a, value.b], alpha: value.alpha }
	},
	oklch: (color) => {
		const value = color.toOklch(PRECISION)
		return { components: [value.l, value.c, value.h], alpha: value.alpha }
	},
	p3: (color) => rgb_triple(color.toP3(PRECISION)),
	rec2020: (color) => rgb_triple(color.toRec2020(PRECISION)),
	'a98-rgb': (color) => rgb_triple(color.toA98(PRECISION)),
	'prophoto-rgb': (color) => rgb_triple(color.toProphoto(PRECISION)),
	xyz: (color) => xyz_triple(color.toXyz(PRECISION)),
	'xyz-d65': (color) => xyz_triple(color.toXyzD65(PRECISION)),
}

export type ColorSpace =
	| 'srgb'
	| 'display-p3'
	| 'hsl'
	| 'hwb'
	| 'lab'
	| 'lch'
	| 'oklab'
	| 'oklch'
	| 'a98-rgb'
	| 'prophoto-rgb'
	| 'rec2020'
	| 'xyz-d65'
	| 'xyz-d50'

export type ColorComponent = number | 'none'

export type ColorValue = {
	colorSpace: ColorSpace
	components: [ColorComponent, ColorComponent, ColorComponent]
	alpha: number
	/** Optional DTCG sRGB fallback, currently not populated */
	hex?: string
}

export type ColorToken = BaseToken & {
	$type: 'color'
	$value: ColorValue
	$extensions: {
		[EXTENSION_CSS_PROPERTIES]: Array<string>
	}
}

export function color_to_token(color: string): ColorValue | null {
	if (
		str_equals('currentcolor', color) ||
		str_index_of('var(', color) !== -1 ||
		css_keywords.has(color.toLowerCase())
	) {
		return null
	}

	// Cheap format lookup first, so unsupported formats never get fully parsed
	const format = getFormat(color)
	if (!format) {
		return null
	}

	const converter_fn = CONVERTERS[format]
	if (!converter_fn) {
		return null
	}

	const parsed = colordx(color)
	if (!parsed.isValid()) {
		return null
	}

	const colorSpace = (FORMAT_TO_SPACE[format] ?? format) as ColorSpace
	return { colorSpace, ...converter_fn(parsed) }
}
