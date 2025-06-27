import { parse, type Value } from 'css-tree'

type Length = {
	value: number
	unit: string
}

/**
 * @description Destructure a line-height from a string
 * The line-height property is specified as any one of the following:
 *  - a `<number>`
 *  - a `<length>`
 * - a `<percentage>`
 * - the keyword `normal`.
 */
export function destructure_line_height(value: string): Length | number | null {
	let ast = parse(value, { context: 'value' }) as Value
	if (ast.children === null) return null
	if (ast.children.size !== 1) return null
	let maybe_dimension = ast.children.first!

	switch (maybe_dimension.type) {
		case 'Dimension': {
			return {
				value: Number(maybe_dimension.value),
				unit: maybe_dimension.unit
			}
		}
		case 'Number': {
			return Number(maybe_dimension.value)
		}
		case 'Percentage': {
			return Number(maybe_dimension.value) / 100
		}
		case 'Identifier': {
			// https://developer.mozilla.org/en-US/docs/Web/CSS/line-height#values
			// > Depends on the user agent. Desktop browsers (including Firefox) use a default value of roughly 1.2,
			// depending on the element's font-family.
			if (maybe_dimension.name === 'normal') {
				return 1.2
			}
		}
	}

	return null
}