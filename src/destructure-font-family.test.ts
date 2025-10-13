import { test, expect } from 'vitest'
import { destructure_font_family } from './destructure-font-family.js'

test('single font-family', () => {
	expect.soft(destructure_font_family('Arial')).toEqual(['Arial'])
})

test('singe font-family with spaces', () => {
	expect.soft(destructure_font_family('Arial Black')).toEqual(['Arial Black'])
})

test('multiple font-family', () => {
	expect.soft(destructure_font_family('Arial, sans-serif')).toEqual(['Arial', 'sans-serif'])
})

test('multiple font-family with spaces', () => {
	expect.soft(destructure_font_family('Arial Black, sans-serif')).toEqual(['Arial Black', 'sans-serif'])
})

test('multiple font-family with spaces and quotes', () => {
	expect.soft(destructure_font_family('"Arial Black", sans-serif')).toEqual(['Arial Black', 'sans-serif'])
})

test('with emoji name', () => {
	expect.soft(destructure_font_family('💪')).toEqual(['💪'])
})

test('single var()', () => {
	expect.soft(destructure_font_family('var(--family)')).toBeUndefined()
})

test('multiple var()', () => {
	expect.soft(destructure_font_family('var(--family), var(--family2)')).toBeUndefined()
})

test('var() with fallback', () => {
	expect.soft(destructure_font_family('var(--family, Arial)')).toBeUndefined()
})
