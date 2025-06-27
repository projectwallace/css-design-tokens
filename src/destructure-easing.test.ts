import { test, expect, describe } from 'vitest'
import { destructure_easing } from './destructure-easing.js'

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
})

describe('unsupported', () => {
	test('var(--test)', () => {
		expect(destructure_easing('var(--test)')).toBeUndefined()
	})
	test('step-start', () => {
		expect(destructure_easing('step-start')).toBeUndefined()
	})
	test('steps(4, end)', () => {
		expect(destructure_easing('steps(4, end)')).toBeUndefined()
	})
	test('cubic-bezier(1, var(--test), 0 0)', () => {
		expect(destructure_easing('cubic-bezier(1, var(--test), 0 0)')).toBeUndefined()
	})
	test('cubic-bezier(1, 2, 3)', () => {
		expect(destructure_easing('cubic-bezier(1, 2, 3)')).toBeUndefined()
	})
})