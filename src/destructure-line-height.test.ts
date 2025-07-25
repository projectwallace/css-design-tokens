import { test, expect } from 'vitest'
import { destructure_line_height } from './destructure-line-height.js'

test('`normal` keyword', () => {
	expect(destructure_line_height('normal')).toEqual(1.2)
})

test('other keywords', () => {
	expect.soft(destructure_line_height('inherit')).toEqual(null)
	expect.soft(destructure_line_height('initial')).toEqual(null)
	expect.soft(destructure_line_height('unset')).toEqual(null)
	expect.soft(destructure_line_height('revert')).toEqual(null)
	expect.soft(destructure_line_height('revert-layer')).toEqual(null)
})

test('percentage', () => {
	expect.soft(destructure_line_height('120%')).toEqual(1.2)
	expect.soft(destructure_line_height('0%')).toEqual(0)
	expect.soft(destructure_line_height('1.1%')).toEqual(1.1 / 100) // ugh, floating point math
	expect.soft(destructure_line_height('2e2%')).toEqual(2)
})

test('number', () => {
	expect.soft(destructure_line_height('1')).toEqual(1)
	expect.soft(destructure_line_height('1.1')).toEqual(1.1)
	expect.soft(destructure_line_height('1e2')).toEqual(100)
})

test('length', () => {
	expect.soft(destructure_line_height('1px')).toEqual({ value: 1, unit: 'px' })
	expect.soft(destructure_line_height('1em')).toEqual({ value: 1, unit: 'em' })
	expect.soft(destructure_line_height('1rem')).toEqual({ value: 1, unit: 'rem' })
	expect.soft(destructure_line_height('1cm')).toEqual({ value: 1, unit: 'cm' })

	expect.soft(destructure_line_height('1.1px')).toEqual({ value: 1.1, unit: 'px' })
	expect.soft(destructure_line_height('1e2em')).toEqual({ value: 100, unit: 'em' })
})

test('unprocessable values', () => {
	expect.soft(destructure_line_height('var(--my-line-height)')).toEqual(null)
	expect.soft(destructure_line_height('var(--my-line-height, 1.2)')).toEqual(null)
})
