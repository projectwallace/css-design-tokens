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
	expect
		.soft(destructure_font_family('Arial Black, sans-serif'))
		.toEqual(['Arial Black', 'sans-serif'])
})

test('multiple font-family with spaces and quotes', () => {
	expect
		.soft(destructure_font_family('"Arial Black", sans-serif'))
		.toEqual(['Arial Black', 'sans-serif'])
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

test('keeps numbers in unquoted names', () => {
	expect.soft(destructure_font_family('Font 2, serif')).toEqual(['Font 2', 'serif'])
})

test('collapses whitespace and comments in unquoted names', () => {
	expect.soft(destructure_font_family('Arial   Black, serif')).toEqual(['Arial Black', 'serif'])
	expect.soft(destructure_font_family('Arial /* x */ Black')).toEqual(['Arial Black'])
})

test('preserves whitespace inside quoted names', () => {
	expect.soft(destructure_font_family('"Arial  Black"')).toEqual(['Arial  Black'])
})

test('single quotes', () => {
	expect.soft(destructure_font_family("'Inter', sans-serif")).toEqual(['Inter', 'sans-serif'])
})

test('does not strip quotes of a different kind inside a string', () => {
	expect.soft(destructure_font_family(`"It's a font"`)).toEqual(["It's a font"])
	expect.soft(destructure_font_family(`'"Quoted"'`)).toEqual(['"Quoted"'])
})

test('unescapes CSS escapes', () => {
	expect.soft(destructure_font_family('"Foo\\"Bar"')).toEqual(['Foo"Bar'])
	expect.soft(destructure_font_family('"Foo \\26 Bar"')).toEqual(['Foo &Bar'])
})

test('var( inside a quoted name is not a var()', () => {
	expect
		.soft(destructure_font_family('"My var(x) font", serif'))
		.toEqual(['My var(x) font', 'serif'])
})

test('var() after other families', () => {
	expect.soft(destructure_font_family('Arial, var(--fallback)')).toBeUndefined()
})

test('empty families are invalid', () => {
	expect.soft(destructure_font_family('Arial,, serif')).toBeUndefined()
	expect.soft(destructure_font_family('Arial,')).toBeUndefined()
	expect.soft(destructure_font_family(', Arial')).toBeUndefined()
})
