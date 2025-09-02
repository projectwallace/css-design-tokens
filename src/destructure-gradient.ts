import { type ColorToken, type GradientToken, EXTENSION_AUTHORED_AS } from "./types"
import { parse, type Value, type FunctionNode, type CssNode } from "css-tree"
import { KeywordSet } from "./keyword-set"
import { color_functions, named_colors, system_colors, color_to_token } from "./colors"

// TODO: support more gradient types
const GRADIENT_FUNCTIONS = new KeywordSet([
	'linear-gradient',
])

function validate_gradient(gradient: string): null | FunctionNode {
	try {
		let ast = parse(gradient, {
			context: 'value',
			positions: true
		}) as Value

		if (ast.children?.size !== 1) {
			return null
		}

		let first_child = ast.children.first

		if (first_child?.type !== 'Function') {
			return null
		}

		if (!GRADIENT_FUNCTIONS.has(first_child.name)) {
			return null
		}

		return first_child
	} catch (error) {
		return null
	}
}

function is_color(node: CssNode) {
	if (node.type === 'Function') {
		return color_functions.has(node.name)
	}
	if (node.type === 'Identifier') {
		return named_colors.has(node.name) || system_colors.has(node.name)
	}
	if (node.type === 'Hash') {
		return true
	}
	return false
}

export function destructure_gradient(gradient: string): GradientToken | null {
	let gradient_node = validate_gradient(gradient)
	if (!gradient_node || gradient_node.children.size === 0) {
		return null
	}

	let color_stops: Array<{ color: ColorToken, position: number | null }> = []

	for (let child of gradient_node?.children) {
		if (is_color(child)) {
			let color_string = gradient.substring(child.loc!.start.offset, child.loc!.end.offset)
			let token = color_to_token(color_string)

			// Bail out if _any_ of the colors can't be parsed as a color because the spec says only type color is allowed
			if (token.$type !== 'color') {
				return null
			}

			color_stops.push({
				color: token,
				// TODO: set position here if it is explicit from the CSS
				position: null
			})
		}
	}

	if (color_stops.length === 2) {
		color_stops[0].position = 0
		color_stops[1].position = 1
	} else {
		for (let i = 0; i < color_stops.length; i++) {
			if (color_stops[i].position === null) {
				color_stops[i].position = i / (color_stops.length - 1)
			}
		}
	}

	return {
		$type: 'gradient',
		$value: color_stops,
		$extensions: {
			[EXTENSION_AUTHORED_AS]: gradient,
		},
	}
}
