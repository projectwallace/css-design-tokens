import { DIMENSION } from '@projectwallace/css-parser/nodes'
import { parse_value } from '@projectwallace/css-parser/parse-value'
import { str_equals } from '@projectwallace/css-parser/string-utils'

/**
 * @description Parse a `<time>` into milliseconds. Returns `null` for anything that is not a
 * single `s` or `ms` dimension, like `var()`, `calc()` or a unitless `0`.
 * @see https://drafts.csswg.org/css-values/#time
 */
export function parse_duration(value: string): number | null {
	const ast = parse_value(value)
	if (ast.child_count !== 1) {
		return null
	}
	const node = ast.first_child!
	if (node.type !== DIMENSION) {
		return null
	}

	const { unit } = node
	const amount = Number(node.value)
	if (str_equals('ms', unit)) {
		return amount
	}
	if (str_equals('s', unit)) {
		return amount * 1000
	}
	return null
}
