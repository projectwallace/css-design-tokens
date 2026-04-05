import { IDENTIFIER, OPERATOR } from '@projectwallace/css-parser/nodes'
import { parse_value } from '@projectwallace/css-parser/parse-value'
import { unquote } from './unquote.js'
import type { FontFamilyValue } from './types.js'

export function destructure_font_family(value: string): FontFamilyValue | undefined {
	if (value.toLowerCase().includes('var(')) {
		return undefined
	}

	let ast = parse_value(value)

	let families: string[] = []
	let { children, has_children } = ast

	if (!has_children || children.length === 0) {
		return families
	}

	let family_buffer = ''
	let prev_type: number | undefined

	for (let node of children) {
		if (node.type === OPERATOR && node.value === ',') {
			families.push(unquote(family_buffer))
			family_buffer = ''
			prev_type = node.type
			continue
		}
		// Add space back between identifiers, like in `Arial Black`
		if (prev_type === IDENTIFIER && node.type === IDENTIFIER) {
			family_buffer += ' '
		}
		family_buffer += node.text
		prev_type = node.type
	}

	families.push(unquote(family_buffer))

	return families
}
