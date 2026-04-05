import { DIMENSION, IDENTIFIER, NUMBER } from '@projectwallace/css-parser/nodes'
import { parse_value } from '@projectwallace/css-parser/parse-value'
import { type Length, type Unit } from './types'

const ALLOWED_UNITS = new Set(['px', 'rem'])

/**
 * @description Destructure a line-height from a string
 * The line-height property is specified as any one of the following:
 *  - a `<number>`
 *  - a `<length>`
 * - a `<percentage>`
 * - the keyword `normal`.
 */
export function destructure_line_height(value: string): Length | number | null {
	let ast = parse_value(value)
	if (!ast.has_children) return null
	if (ast.child_count !== 1) return null
	let maybe_dimension = ast.first_child

	switch (maybe_dimension.type) {
		case DIMENSION: {
			let { value, unit } = maybe_dimension
			if (value === 0) {
				return 0
			}

			if (unit === '%') {
				return Number(value) / 100
			}

			unit = unit.toLowerCase()

			if (ALLOWED_UNITS.has(unit)) {
				return {
					value: value,
					unit: unit as Unit,
				}
			}
			return null
		}
		case NUMBER: {
			return Number(maybe_dimension.value)
		}
		case IDENTIFIER: {
			// https://developer.mozilla.org/en-US/docs/Web/CSS/line-height#values
			// > Depends on the user agent. Desktop browsers (including Firefox) use a default value of roughly 1.2,
			// depending on the element's font-family.
			if (maybe_dimension.name.toLowerCase() === 'normal') {
				return 1.2
			}
		}
	}

	return null
}
