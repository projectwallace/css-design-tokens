import { FUNCTION, IDENTIFIER, NUMBER, OPERATOR } from '@projectwallace/css-parser/nodes'
import { parse_value } from '@projectwallace/css-parser/parse-value'
import type { BaseToken } from './types.ts'
import { str_equals } from '@projectwallace/css-parser/string-utils'

export type Easing = [number, number, number, number]

export type CubicBezierToken = BaseToken & {
	$type: 'cubicBezier'
	$value: Easing
}

const EASING_KEYWORDS = new Map<string, Easing>([
	['linear', [0, 0, 1, 1]],
	['ease', [0.25, 0.1, 0.25, 1]],
	['ease-in', [0.42, 0, 1, 1]],
	['ease-out', [0, 0, 0.58, 1]],
	['ease-in-out', [0.42, 0, 0.58, 1]],
])

export function destructure_easing(easing: string): Easing | null {
	const ast = parse_value(easing)
	if (ast.child_count !== 1) {
		return null
	}
	const node = ast.first_child!

	if (node.type === IDENTIFIER) {
		return EASING_KEYWORDS.get(node.name.toLowerCase()) ?? null
	}

	if (node.type !== FUNCTION || !str_equals('cubic-bezier', node.name)) {
		return null
	}

	// Expect exactly `<number> , <number> , <number> , <number>`
	const children = [...node]
	if (children.length !== 7) {
		return null
	}

	const numbers: number[] = []
	for (const [index, child] of children.entries()) {
		if (index % 2 === 1) {
			if (child.type !== OPERATOR || child.value !== ',') {
				return null
			}
		} else if (child.type === NUMBER) {
			numbers.push(Number(child.value))
		} else {
			return null
		}
	}

	// https://drafts.csswg.org/css-easing/#cubic-bezier-easing-functions: x values must be in [0, 1]
	const [x1, , x2] = numbers as Easing
	if (x1 < 0 || x1 > 1 || x2 < 0 || x2 > 1) {
		return null
	}

	return numbers as Easing
}
