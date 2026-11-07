import type { CSSNode } from '@projectwallace/css-parser'
import { FUNCTION, OPERATOR, STRING } from '@projectwallace/css-parser/nodes'
import { parse_value } from '@projectwallace/css-parser/parse-value'
import type { FontFamilyValue } from './types.ts'

// https://drafts.csswg.org/css-syntax/#consume-escaped-code-point
const ESCAPE = /\\(?:([0-9a-f]{1,6})[ \t\n]?|(.))/gis

function unescape_css(input: string): string {
	return input.replaceAll(ESCAPE, (_, hex: string | undefined, char: string | undefined) =>
		hex === undefined ? char! : String.fromCodePoint(Number.parseInt(hex, 16) || 0xfffd),
	)
}

/**
 * A single family is either one <string> or a sequence of <custom-ident>s,
 * whose whitespace collapses into a single space.
 * @see https://drafts.csswg.org/css-fonts/#family-name-syntax
 */
function family_name(nodes: CSSNode[]): string | undefined {
	if (nodes.length === 0) {
		return undefined
	}
	if (nodes.length === 1 && nodes[0]!.type === STRING) {
		// Strip the surrounding quotes, which the parser keeps in the node text
		return unescape_css(nodes[0]!.text.slice(1, -1))
	}
	return nodes.map((node) => unescape_css(node.text)).join(' ')
}

export function destructure_font_family(value: string): FontFamilyValue | undefined {
	let ast = parse_value(value)

	let families: string[] = []
	let current: CSSNode[] = []

	for (let node of ast) {
		// var(), env(), attr(), ... can't be resolved statically
		if (node.type === FUNCTION) {
			return undefined
		}
		if (node.type === OPERATOR && node.value === ',') {
			let name = family_name(current)
			if (name === undefined) {
				return undefined
			}
			families.push(name)
			current = []
			continue
		}
		current.push(node)
	}

	// An empty value has no families at all; a trailing comma is invalid
	if (current.length === 0 && families.length === 0) {
		return families
	}
	let name = family_name(current)
	if (name === undefined) {
		return undefined
	}
	families.push(name)

	return families
}
