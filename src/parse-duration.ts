import { DIMENSION } from '@projectwallace/css-parser/nodes'
import { parse_value } from '@projectwallace/css-parser/parse-value'

/**
 * @description Parse a `<time>` into milliseconds. Returns `null` for anything that is not a
 * single `s` or `ms` dimension, like `var()`, `calc()` or a unitless `0`.
 * @see https://drafts.csswg.org/css-values/#time
 */
export function parse_duration(value: string): number | null {
	let ast = parse_value(value)
	if (ast.child_count !== 1) {
		return null
	}
	let node = ast.first_child!
	if (node.type !== DIMENSION) {
		return null
	}

	let unit = node.unit.toLowerCase()
	let amount = Number(node.value)
	if (unit === 'ms') {
		return amount
	}
	if (unit === 's') {
		return amount * 1000
	}
	return null
}
