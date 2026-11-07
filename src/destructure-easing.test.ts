import { test, expect, describe } from 'vitest'
import { destructure_easing } from './destructure-easing.ts'

describe('keywords', () => {
	test('ease', () => {
		expect(destructure_easing('ease')).toEqual([0.25, 0.1, 0.25, 1])
	})

	test('ease-in', () => {
		expect(destructure_easing('ease-in')).toEqual([0.42, 0, 1, 1])
	})

	test('ease-out', () => {
		expect(destructure_easing('ease-out')).toEqual([0, 0, 0.58, 1])
	})

	test('ease-in-out', () => {
		expect(destructure_easing('ease-in-out')).toEqual([0.42, 0, 0.58, 1])
	})
	test('linear', () => {
		expect(destructure_easing('linear')).toEqual([0, 0, 1, 1])
	})
})

describe('cubic-bezier', () => {
	test('cubic-bezier(1, 0, 1, 1)', () => {
		expect(destructure_easing('cubic-bezier(1, 0, 1, 1)')).toEqual([1, 0, 1, 1])
	})
	test('cubic-bezier(0.42, 0.0, 1.0, 1.0)', () => {
		expect(destructure_easing('cubic-bezier(0.42, 0.0, 1.0, 1.0)')).toEqual([0.42, 0, 1, 1])
	})
	test('cubic-bezier(1, 1e-1, 1, 1)', () => {
		expect(destructure_easing('cubic-bezier(1, 1e-1, 1, 1)')).toEqual([1, 0.1, 1, 1])
	})
	test('y values may be outside [0, 1]', () => {
		expect(destructure_easing('cubic-bezier(0.5, -0.5, 0.5, 1.5)')).toEqual([0.5, -0.5, 0.5, 1.5])
	})
	test('CUBIC-BEZIER(0, 0, 1, 1)', () => {
		expect(destructure_easing('CUBIC-BEZIER(0, 0, 1, 1)')).toEqual([0, 0, 1, 1])
	})
})

describe('unsupported', () => {
	test('var(--test)', () => {
		expect(destructure_easing('var(--test)')).toBeNull()
	})
	test('var(--test, ease-in)', () => {
		expect(destructure_easing('var(--test, ease-in)')).toBeNull()
	})
	test('step-start', () => {
		expect(destructure_easing('step-start')).toBeNull()
	})
	test('steps(4, end)', () => {
		expect(destructure_easing('steps(4, end)')).toBeNull()
	})
	test('cubic-bezier(1, var(--test), 0 0)', () => {
		expect(destructure_easing('cubic-bezier(1, var(--test), 0 0)')).toBeNull()
	})
	test('cubic-bezier(1, 2, 3)', () => {
		expect(destructure_easing('cubic-bezier(1, 2, 3)')).toBeNull()
	})
	test('x values outside [0, 1]', () => {
		expect.soft(destructure_easing('cubic-bezier(-0.1, 0, 1, 1)')).toBeNull()
		expect.soft(destructure_easing('cubic-bezier(0, 0, 1.1, 1)')).toBeNull()
	})
	test('empty arguments', () => {
		expect.soft(destructure_easing('cubic-bezier(, , , )')).toBeNull()
		expect.soft(destructure_easing('cubic-bezier(0, , 1, 1)')).toBeNull()
	})
	test('trailing content', () => {
		expect(destructure_easing('cubic-bezier(0, 0, 1, 1) foo')).toBeNull()
	})
	test('missing commas', () => {
		expect(destructure_easing('cubic-bezier(.1 .2 .3 .4)')).toBeNull()
	})
	test('too many arguments', () => {
		expect(destructure_easing('cubic-bezier(0, 0, 1, 1, 1)')).toBeNull()
	})
	test('trailing comma', () => {
		expect(destructure_easing('cubic-bezier(0, 0, 1, 1,)')).toBeNull()
	})
	test('non-number arguments', () => {
		expect.soft(destructure_easing('cubic-bezier(0, 0, 1px, 1)')).toBeNull()
		expect.soft(destructure_easing('cubic-bezier(0, 0, calc(1), 1)')).toBeNull()
	})
	test('other functions', () => {
		expect(destructure_easing('linear(0, 0.5, 1)')).toBeNull()
	})
})
