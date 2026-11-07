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
