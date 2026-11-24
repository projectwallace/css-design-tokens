import { DIMENSION, IDENTIFIER, NUMBER } from '@projectwallace/css-parser/nodes'
import { parse_value } from '@projectwallace/css-parser/parse-value'
import { str_equals } from '@projectwallace/css-parser/string-utils'
import type { DimensionValue, Length } from './types.ts'

/**
 * @description Destructure a line-height from a string
 * The line-height property is specified as any one of the following:
 *  - a `<number>`
 *  - a `<length>`
 * - a `<percentage>`
 * - the keyword `normal`.
 */
export function destructure_line_height(value: string): Length | DimensionValue | number | null {
	const ast = parse_value(value)
	if (!ast.has_children || ast.child_count !== 1) {
		return null
	}
	const maybe_dimension = ast.first_child

	switch (maybe_dimension.type) {
		case DIMENSION: {
			const { value, unit } = maybe_dimension

			if (value === 0) {
				return 0
			}

			if (unit === '%') {
				return Number(value) / 100
			}

			if (str_equals('px', unit)) {
				return { value, unit: 'px' }
			}
			if (str_equals('rem', unit)) {
				return { value, unit: 'rem' }
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
			if (str_equals('normal', maybe_dimension.name)) {
				return 1.2
			}
		}
	}

	return null
}
