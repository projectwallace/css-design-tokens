import { parse_value } from '@projectwallace/css-parser/parse-value'
import { color_to_token } from './colors.js'
import type { ColorValue } from './types.js'
import { namedColors as named_colors, systemColors as system_colors, colorFunctions as color_functions } from '@projectwallace/css-analyzer'

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

	let current_shadow = create_destructured()
	let destructured: ShadowValue[] = [current_shadow]

	if (ast.children.length < 2) {
		return null
	}

	for (let node of ast.children) {
		if (node.type_name === 'Identifier') {
			if (node.name.toLowerCase() === 'inset') {
				current_shadow.inset = true
			} else if (named_colors.has(node.name) || system_colors.has(node.name)) {
				let color_token = color_to_token(node.name)
				if (color_token === null) {
					continue
				}
				current_shadow.color = color_token
			}
		} else if (node.type_name === 'Dimension' || (node.type_name === 'Number' && node.value === 0)) {
			let length =
				node.type_name === 'Dimension'
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
		} else if (node.type_name === 'Function') {
			if (color_functions.has(node.name)) {
				let color_token = color_to_token(node.text)
				if (color_token === null) {
					continue
				}
				current_shadow.color = color_token
			} else if (node.name.toLowerCase() === 'var' && !current_shadow.color) {
				let color_token = color_to_token(node.text)
				if (color_token === null) {
					continue
				}
				current_shadow.color = color_token
			}
		} else if (node.type_name === 'Hash') {
			let color_token = color_to_token(node.text)
			if (color_token === null) {
				continue
			}
			current_shadow.color = color_token
		} else if (node.type_name === 'Operator' && node.name === ',') {
			// Start a new shadow, but only after we've made sure that the current shadow is valid
			complete_shadow_token(current_shadow)
			current_shadow = create_destructured()
			destructured.push(current_shadow)
		}
	}

	complete_shadow_token(current_shadow)

	return destructured
}

const DIMENSION_ZERO = {
	value: 0,
	unit: 'px',
}

/**
 * @description
 * According to the spec every shadow MUST have an offsetX, offsetY, blur, spread and color,
 * only the inset is optional and defaults to false.
 */
function complete_shadow_token(token: ShadowValue) {
	if (!token.offsetX) {
		token.offsetX = DIMENSION_ZERO
	}
	if (!token.offsetY) {
		token.offsetY = DIMENSION_ZERO
	}
	if (!token.blur) {
		token.blur = DIMENSION_ZERO
	}
	if (!token.spread) {
		token.spread = DIMENSION_ZERO
	}
	if (!token.color) {
		token.color = color_to_token('#000')!
	}
	return token
}
