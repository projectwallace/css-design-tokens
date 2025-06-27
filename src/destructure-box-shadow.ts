import { parse, type CssNode, type Value } from 'css-tree'
import { named_colors, system_colors, color_functions } from './colors'

type CssLength = {
	value: number
	unit: string
}

export type DestructuredShadow = {
	color: string | undefined
	offsetX: CssLength | undefined
	offsetY: CssLength | undefined
	blur: CssLength | undefined
	spread: CssLength | undefined
	inset: boolean | undefined
}

function create_destructured(): DestructuredShadow {
	return {
		color: undefined,
		offsetX: undefined,
		offsetY: undefined,
		blur: undefined,
		spread: undefined,
		inset: false,
	}
}

export function destructure_box_shadow(value: string): null | DestructuredShadow[] {
	let ast = parse(value, {
		context: 'value',
		positions: true
	}) as Value

	function generate(node: CssNode) {
		if (node.loc) {
			return value.slice(node.loc.start.offset, node.loc.end.offset)
		}
		return ''
	}

	let current_shadow = create_destructured()
	let destructured: DestructuredShadow[] = [current_shadow]

	if (ast.children.size < 2) {
		return null
	}

	ast.children.forEach((node: CssNode) => {
		if (node.type === 'Identifier') {
			if (node.name.toLowerCase() === 'inset') {
				current_shadow.inset = true
			} else if (named_colors.has(node.name) || system_colors.has(node.name)) {
				current_shadow.color = node.name
			}
		}
		else if (node.type === 'Dimension' || (node.type === 'Number' && node.value === '0')) {
			let length = node.type === 'Dimension' ? {
				$type: 'dimension',
				value: Number(node.value),
				unit: node.unit
			} : {
				$type: 'dimension',
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
		}
		else if (node.type === 'Function') {
			if (color_functions.has(node.name)) {
				current_shadow.color = generate(node)
			} else if (node.name.toLowerCase() === 'var' && !current_shadow.color) {
				current_shadow.color = generate(node)
			}
		}
		else if (node.type === 'Hash') {
			current_shadow.color = generate(node)
		}
		else if (node.type === 'Operator' && node.value === ',') {
			// Start a new shadow, but only after we've made sure that the current shadow is valid
			complete_shadow_token(current_shadow)
			current_shadow = create_destructured()
			destructured.push(current_shadow)
		}
	})

	complete_shadow_token(current_shadow)

	return destructured
}

const DIMENSION_ZERO = {
	$type: 'dimension',
	value: 0,
	unit: 'px'
}

/**
 * @description
 * According to the spec every shadow MUST have an offsetX, offsetY, blur, spread and color,
 * only the inset is optional and defaults to false.
 */
function complete_shadow_token(token: DestructuredShadow) {
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
		token.color = '#000'
	}
	return token
}
