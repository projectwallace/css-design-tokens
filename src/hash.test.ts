import { test, expect } from 'vitest'
import { hash } from './hash.js'

test('hash contains only hex characters', () => {
	const result = hash('hello')
	expect(result).toMatch(/^[0-9a-f]+$/)
})

test('hash is shorter than long input strings', () => {
	let input = 'var(--token-for-some-color)'
	const result = hash(input)
	expect.soft(result).toBe('39016ca6')
	expect(result.length).toBeLessThan(input.length)
})

test('handles empty input', () => {
	const result = hash('')
	expect(result).toBe('0')
})

test('handles undefined input', () => {
	const result = hash(undefined)
	expect(result).toBe('0')
})

/**
 * @description FontFaces requests a hash based on a number of object props, all of which could
 * be `undefined`, ending up with `undefined + undefined` which is `NaN`
 */
test('handles NaN input', () => {
	const result = hash(NaN)
	expect(result).toBe('0')
})

test('handles number input', () => {
	const result = hash(123)
	expect(result).toMatch('be32')
})
