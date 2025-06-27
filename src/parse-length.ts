import { parse, type Value } from 'css-tree'

type DesignTokenLength = {
	value: number
	unit: 'px' | 'rem'
}

// https://developer.mozilla.org/en-US/docs/Web/CSS/absolute-size#values
let absolute_size_map = new Map([
	['xx-small', 0.6],
	['x-small', 0.75],
	['small', 0.89],
	['medium', 1],
	['large', 1.2],
	['x-large', 1.5],
	['xx-large', 2],
	['xxx-large', 3]
])

/**
 * @description Parse a length from a css value
 *  - a `<number>`
 *  - a `<length>`
 * - a `<percentage>`
 * - the keyword `normal`.
 */
export function parse_length(value: string): DesignTokenLength | null {
	let ast = parse(value, { context: 'value' }) as Value
	if (ast.children === null) return null
	if (ast.children.size !== 1) return null
	let maybe_length = ast.children.first!

	switch (maybe_length.type) {
		case 'Dimension': {
			if (maybe_length.unit === 'px' || maybe_length.unit === 'rem') {
				return {
					value: Number(maybe_length.value),
					unit: maybe_length.unit
				}
			}
			break
		}
		case 'Identifier': {
			// https://developer.mozilla.org/en-US/docs/Web/CSS/line-height#values
			// > Depends on the user agent. Desktop browsers (including Firefox) use a default value of roughly 1.2,
			// depending on the element's font-family.
			let name = maybe_length.name.toLowerCase()
			if (absolute_size_map.has(name)) {
				return {
					value: absolute_size_map.get(name)!,
					unit: 'rem'
				}
			}
		}
	}

	return null
}