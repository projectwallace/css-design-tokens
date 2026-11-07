import { DIMENSION, IDENTIFIER, NUMBER } from '@projectwallace/css-parser/nodes'
import { parse_value } from '@projectwallace/css-parser/parse-value'
import type { Length } from './types.ts'

// https://developer.mozilla.org/en-US/docs/Web/CSS/absolute-size#values
let absolute_size_map = new Map([
	['xx-small', 0.6],
	['x-small', 0.75],
	['small', 0.89],
	['medium', 1],
	['large', 1.2],
	['x-large', 1.5],
	['xx-large', 2],
	['xxx-large', 3],
])

/**
 * @description Parse a font-size-like length from a css value. Supports:
 * - a `<length>` in `px` or `rem`
 * - an `<absolute-size>` keyword (`small`, `x-large`, ...), converted to `rem`
 * - the unitless number `0`, normalized to `0px`
 * Anything else returns `null`.
 */
export function parse_length(value: string): Length | null {
	let ast = parse_value(value)
	if (!ast.has_children || ast.child_count !== 1) {
		return null
	}
	let maybe_length = ast.first_child

	switch (maybe_length.type) {
		case DIMENSION: {
			let unit = maybe_length.unit.toLowerCase()
			if (unit === 'px' || unit === 'rem') {
				let value = Number(maybe_length.value)
				// Always return `0px`, `0`, or `0rem` as `0px`
				if (value === 0) {
					return {
						value: 0,
						unit: 'px',
					}
				}
				return {
					value: value,
					unit,
				}
			}
			break
		}
		case IDENTIFIER: {
			// https://drafts.csswg.org/css-fonts/#absolute-size-mapping, relative to `medium` (1rem)
			let name = maybe_length.name.toLowerCase()
			if (absolute_size_map.has(name)) {
				return {
					value: absolute_size_map.get(name)!,
					unit: 'rem',
				}
			}
			break
		}
		case NUMBER: {
			if (Number(maybe_length.value) === 0) {
				return {
					value: 0,
					unit: 'px',
				}
			}
			break
		}
	}

	return null
}
