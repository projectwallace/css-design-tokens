import { test, expect, describe } from 'vitest'
import { color_to_token } from './colors.js'

describe('xyz', () => {
	test('xyz-d65 components are on a 0-1 scale', () => {
		let token = color_to_token('color(xyz-d65 0.1 0.2 0.3)')!
		expect(token.colorSpace).toBe('xyz-d65')
		expect(token.components[0]).toBeCloseTo(0.1)
		expect(token.components[1]).toBeCloseTo(0.2)
		expect(token.components[2]).toBeCloseTo(0.3)
	})

	test('xyz is an alias for xyz-d65', () => {
		let token = color_to_token('color(xyz 0.1 0.2 0.3)')!
		expect(token.colorSpace).toBe('xyz-d65')
		expect(token.components[0]).toBeCloseTo(0.1)
	})

	test('xyz-d50 components are on a 0-1 scale', () => {
		let token = color_to_token('color(xyz-d50 0.1 0.2 0.3)')!
		expect(token.colorSpace).toBe('xyz-d50')
		expect(token.components[0]).toBeCloseTo(0.1)
		expect(token.components[1]).toBeCloseTo(0.2)
		expect(token.components[2]).toBeCloseTo(0.3)
	})
})

describe('unsupported input', () => {
	test.each([
		'inherit',
		'currentColor',
		'var(--color)',
		'rgb(var(--rgb))',
		'Canvas',
		'#zzz',
		'not-a-color',
		'color(srgb-linear 0.5 0.2 0.1)',
	])('%s returns null', (color) => {
		expect(color_to_token(color)).toBeNull()
	})
})

test.each([
	['#f00', 'srgb'],
	['red', 'srgb'],
	['rgb(255 0 0)', 'srgb'],
	['hsl(0 100% 50%)', 'hsl'],
	['hwb(0 0% 0%)', 'hwb'],
	['lab(50 40 60)', 'lab'],
	['lch(50 40 60)', 'lch'],
	['oklab(0.5 0.1 0.1)', 'oklab'],
	['oklch(0.5 0.1 60)', 'oklch'],
	['color(display-p3 1 0 0)', 'display-p3'],
	['color(rec2020 1 0 0)', 'rec2020'],
	['color(a98-rgb 1 0 0)', 'a98-rgb'],
	['color(prophoto-rgb 1 0 0)', 'prophoto-rgb'],
])('%s is converted to %s', (color, space) => {
	expect(color_to_token(color)?.colorSpace).toBe(space)
})
