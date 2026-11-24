import { test, expect } from 'vitest'
import { group_colors } from './group-colors.ts'

function group_names(colors: string[]) {
	const input = Object.fromEntries(colors.map((color) => [color, 1]))
	return group_colors(input).map(([group]) => group)
}

test('sorts groups by size, largest first', () => {
	expect(group_names(['red', '#f00', 'darkred', 'blue', 'navy', 'green'])).toEqual([
		'red',
		'blue',
		'green',
	])
})

test('always puts the unknown group last', () => {
	const orders = [
		['var(--a)', 'var(--b)', 'var(--c)', 'red', 'blue', 'navy'],
		['red', 'var(--a)', 'blue', 'var(--b)', 'navy', 'var(--c)'],
		['red', 'blue', 'navy', 'var(--a)', 'var(--b)', 'var(--c)'],
	]
	for (const colors of orders) {
		expect(group_names(colors)).toEqual(['blue', 'red', 'unknown'])
	}
})
