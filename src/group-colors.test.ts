import { test, expect } from 'vitest'
import { group_colors, color_dict } from './group-colors.js'

function group_names(colors: string[]) {
	let input = Object.fromEntries(colors.map((color) => [color, 1]))
	return group_colors(input).map(([group]) => color_dict.get(group))
}

test('sorts groups by size, largest first', () => {
	expect(group_names(['red', '#f00', 'darkred', 'blue', 'navy', 'green'])).toEqual([
		'red',
		'blue',
		'green',
	])
})

test('always puts the unknown group last', () => {
	let orders = [
		['var(--a)', 'var(--b)', 'var(--c)', 'red', 'blue', 'navy'],
		['red', 'var(--a)', 'blue', 'var(--b)', 'navy', 'var(--c)'],
		['red', 'blue', 'navy', 'var(--a)', 'var(--b)', 'var(--c)'],
	]
	for (let colors of orders) {
		expect(group_names(colors)).toEqual(['blue', 'red', 'unknown'])
	}
})
