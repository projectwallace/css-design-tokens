import { parse, type Value, type CssNode } from 'css-tree'
import { unquote } from './unquote.js'
import type { FontFamilyValue } from './types.js'

export function destructure_font_family(value: string): FontFamilyValue | undefined {
	if (value.toLowerCase().includes('var(')) {
		return undefined
	}

	let ast = parse(value, {
		context: 'value',
		positions: true,
	}) as Value

	function generate(node: CssNode) {
		if (node.loc) {
			return value.slice(node.loc.start.offset, node.loc.end.offset)
		}
		return ''
	}

	let families: string[] = []

	if (!ast.children || ast.children.size === 0) {
		return families
	}

	let family_buffer = ''
	let prev_type: CssNode['type'] | undefined

	for (let child of ast.children) {
		if (child.type === 'Operator' && child.value === ',') {
			families.push(unquote(family_buffer))
			family_buffer = ''
			prev_type = child.type
			continue
		}
		// Add space back between identifiers, like in `Arial Black`
		if (prev_type === 'Identifier' && child.type === 'Identifier') {
			family_buffer += ' '
		}
		family_buffer += generate(child)
		prev_type = child.type
	}

	families.push(unquote(family_buffer))

	return families
}
