import {
	colorKeywords as color_keywords,
	cssKeywords as css_keywords,
} from '@projectwallace/css-analyzer'
import { type ColorValue } from './types.js'
import { colordx, extend, getFormat, type ColorFormat } from '@colordx/core'
import hwb from '@colordx/core/plugins/hwb'
import lab from '@colordx/core/plugins/lab'
import lch from '@colordx/core/plugins/lch'
import p3 from '@colordx/core/plugins/p3'
import rec2020 from '@colordx/core/plugins/rec2020'
import a98rgb from '@colordx/core/plugins/a98rgb'
import prophoto from '@colordx/core/plugins/prophoto'
import names from '@colordx/core/plugins/names'

// Register color spaces for parsing and converting
extend([hwb, lab, lch, p3, rec2020, a98rgb, prophoto, names])

// Full precision, to avoid rounding differences from the original authored value
const PRECISION = 15

export function color_to_token(color: string): ColorValue | null {
	let lowercased = color.toLowerCase()

	// The keyword "transparent" specifies a transparent black.
	// > https://drafts.csswg.org/css-color-4/#transparent-color
	if (lowercased === 'transparent') {
		return {
			colorSpace: 'srgb',
			components: [0, 0, 0],
			alpha: 0,
		}
	}

	if (css_keywords.has(lowercased) || color_keywords.has(lowercased)) {
		return null
	}

	if (lowercased.includes('var(')) {
		return null
	}

	let format: ColorFormat | undefined = getFormat(color)
	if (format === undefined) return null

	let parsed = colordx(color)
	if (!parsed.isValid()) return null

	switch (format) {
		case 'hex':
		case 'rgb':
		case 'name': {
			let rgb = parsed.toRgb()
			return {
				colorSpace: 'srgb',
				components: [rgb.r / 255, rgb.g / 255, rgb.b / 255],
				alpha: rgb.alpha,
			}
		}
		case 'hsl': {
			let value = parsed.toHsl(PRECISION)
			return {
				colorSpace: 'hsl',
				components: [value.h, value.s, value.l],
				alpha: value.alpha,
			}
		}
		case 'hwb': {
			let value = parsed.toHwb(PRECISION)
			return {
				colorSpace: 'hwb',
				components: [value.h, value.w, value.b],
				alpha: value.alpha,
			}
		}
		case 'lab': {
			let value = parsed.toLab(PRECISION)
			return {
				colorSpace: 'lab',
				components: [value.l, value.a, value.b],
				alpha: value.alpha,
			}
		}
		case 'lch': {
			let value = parsed.toLch(PRECISION)
			return {
				colorSpace: 'lch',
				components: [value.l, value.c, value.h],
				alpha: value.alpha,
			}
		}
		case 'oklab': {
			let value = parsed.toOklab(PRECISION)
			return {
				colorSpace: 'oklab',
				components: [value.l, value.a, value.b],
				alpha: value.alpha,
			}
		}
		case 'oklch': {
			let value = parsed.toOklch(PRECISION)
			return {
				colorSpace: 'oklch',
				components: [value.l, value.c, value.h],
				alpha: value.alpha,
			}
		}
		case 'p3': {
			let value = parsed.toP3(PRECISION)
			return {
				colorSpace: 'display-p3',
				components: [value.r, value.g, value.b],
				alpha: value.alpha,
			}
		}
		case 'rec2020': {
			let value = parsed.toRec2020(PRECISION)
			return {
				colorSpace: 'rec2020',
				components: [value.r, value.g, value.b],
				alpha: value.alpha,
			}
		}
		case 'a98-rgb': {
			let value = parsed.toA98(PRECISION)
			return {
				colorSpace: 'a98-rgb',
				components: [value.r, value.g, value.b],
				alpha: value.alpha,
			}
		}
		case 'prophoto-rgb': {
			let value = parsed.toProphoto(PRECISION)
			return {
				colorSpace: 'prophoto-rgb',
				components: [value.r, value.g, value.b],
				alpha: value.alpha,
			}
		}
		case 'xyz': {
			let value = parsed.toXyz(PRECISION)
			return {
				colorSpace: 'xyz-d50',
				components: [value.x, value.y, value.z],
				alpha: value.alpha,
			}
		}
		case 'xyz-d65': {
			let value = parsed.toXyzD65(PRECISION)
			return {
				colorSpace: 'xyz-d65',
				components: [value.x, value.y, value.z],
				alpha: value.alpha,
			}
		}
		default:
			return null
	}
}
