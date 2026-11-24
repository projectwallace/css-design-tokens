import { test, expect } from 'vitest'
import { group_colors } from './color-group.ts'

function group_names(colors: string[]) {
	return group_colors(colors).map(([group]) => group)
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

test('puts var() and calc() in the unknown group, case-insensitively', () => {
	const input = { 'VAR(--a)': 1, 'Var(--b)': 1, 'rgb(CALC(255 - 0) 0 0)': 1 }
	expect(group_colors(Object.keys(input))).toEqual([
		['unknown', ['VAR(--a)', 'Var(--b)', 'rgb(CALC(255 - 0) 0 0)']],
	])
})
