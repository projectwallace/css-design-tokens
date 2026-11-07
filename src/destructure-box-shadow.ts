import { parse_value } from '@projectwallace/css-parser/parse-value'
import {
	DIMENSION,
	FUNCTION,
	HASH,
	IDENTIFIER,
	NUMBER,
	OPERATOR,
} from '@projectwallace/css-parser/nodes'
import { colorFunctions as color_functions } from '@projectwallace/css-analyzer'
import { color_to_token } from './colors.ts'
import type { ColorValue } from './types.ts'

export type CssLength = {
	value: number
	unit: string
}

export type ShadowValue = {
	color: ColorValue | undefined
	offsetX: CssLength | undefined
	offsetY: CssLength | undefined
	blur: CssLength | undefined
	spread: CssLength | undefined
	inset: boolean | undefined
}

function create_destructured(): ShadowValue {
	return {
		color: undefined,
		offsetX: undefined,
		offsetY: undefined,
		blur: undefined,
		spread: undefined,
		inset: false,
	}
}

export function destructure_box_shadow(value: string): null | ShadowValue[] {
	let ast = parse_value(value)

	if (ast.child_count < 2) {
		return null
	}

	let current_shadow = create_destructured()
	let destructured: ShadowValue[] = [current_shadow]

	for (let node of ast) {
		if (node.type === IDENTIFIER) {
			if (node.name.toLowerCase() === 'inset') {
				current_shadow.inset = true
			} else {
				// Named colors and `transparent` resolve; system colors, `currentcolor` and
				// unknown keywords don't, and would otherwise silently become a black shadow
				let color_token = color_to_token(node.name)
				if (color_token === null) {
					return null
				}
				current_shadow.color = color_token
			}
		} else if (node.type === DIMENSION || (node.type === NUMBER && node.value === 0)) {
			let length =
				node.type === DIMENSION
					? {
							value: Number(node.value),
							unit: node.unit!,
						}
					: {
							value: 0,
							unit: 'px',
						}

			if (!current_shadow.offsetX) {
				current_shadow.offsetX = length
			} else if (!current_shadow.offsetY) {
				current_shadow.offsetY = length
			} else if (!current_shadow.blur) {
				current_shadow.blur = length
			} else if (!current_shadow.spread) {
				current_shadow.spread = length
			}
		} else if (node.type === FUNCTION) {
			// Anything we can't resolve statically (var(), calc(), env(), a color function
			// containing var(), ...) would otherwise silently become a 0px length or a black
			// color, so bail out and let the caller emit an unparsed token instead.
			if (!color_functions.has(node.name)) {
				return null
			}
			let color_token = color_to_token(node.text)
			if (color_token === null) {
				return null
			}
			current_shadow.color = color_token
		} else if (node.type === HASH) {
			let color_token = color_to_token(node.text)
			if (color_token === null) {
				return null
			}
			current_shadow.color = color_token
		} else if (node.type === OPERATOR && node.value === ',') {
			// Start a new shadow, but only after we've made sure that the current shadow is valid
			complete_shadow_token(current_shadow)
			current_shadow = create_destructured()
			destructured.push(current_shadow)
		}
	}

	complete_shadow_token(current_shadow)

	return destructured
}

// A fresh object per call, so tokens never share (and accidentally mutate) the same length
function zero_px(): CssLength {
	return { value: 0, unit: 'px' }
}

/**
 * @description
 * According to the spec every shadow MUST have an offsetX, offsetY, blur, spread and color,
 * only the inset is optional and defaults to false.
 */
function complete_shadow_token(token: ShadowValue) {
	if (!token.offsetX) {
		token.offsetX = zero_px()
	}
	if (!token.offsetY) {
		token.offsetY = zero_px()
	}
	if (!token.blur) {
		token.blur = zero_px()
	}
	if (!token.spread) {
		token.spread = zero_px()
	}
	if (!token.color) {
		token.color = color_to_token('#000')!
	}
	return token
}
