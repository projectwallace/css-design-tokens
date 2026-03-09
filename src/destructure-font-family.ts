import type { CSSNode } from '@projectwallace/css-parser'
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
	let prev_type: CSSNode['type_name'] | undefined

	for (let node of children) {
		if (node.type_name === 'Operator' && node.value === ',') {
			families.push(unquote(family_buffer))
			family_buffer = ''
			prev_type = node.type_name
			continue
		}
		// Add space back between identifiers, like in `Arial Black`
		if (prev_type === 'Identifier' && node.type_name === 'Identifier') {
			family_buffer += ' '
		}
		family_buffer += node.text
		prev_type = node.type_name
	}

	families.push(unquote(family_buffer))

	return families
}
