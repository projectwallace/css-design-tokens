import { test, expect } from 'vitest'
import { parse_length } from './parse-length.js'

test('px values', () => {
	expect.soft(parse_length('1px')).toEqual({ value: 1, unit: 'px' })
	expect.soft(parse_length('1.5px')).toEqual({ value: 1.5, unit: 'px' })
	expect.soft(parse_length('.5px')).toEqual({ value: 0.5, unit: 'px' })
	expect.soft(parse_length('1e2px')).toEqual({ value: 100, unit: 'px' })
})

test('rem values', () => {
	expect.soft(parse_length('1rem')).toEqual({ value: 1, unit: 'rem' })
	expect.soft(parse_length('1.5rem')).toEqual({ value: 1.5, unit: 'rem' })
	expect.soft(parse_length('.5rem')).toEqual({ value: 0.5, unit: 'rem' })
	expect.soft(parse_length('1e2rem')).toEqual({ value: 100, unit: 'rem' })
})

test('absolute size keywords', () => {
	expect.soft(parse_length('xx-small')).toEqual({ value: 0.6, unit: 'rem' })
	expect.soft(parse_length('x-small')).toEqual({ value: 0.75, unit: 'rem' })
	expect.soft(parse_length('small')).toEqual({ value: 0.89, unit: 'rem' })
	expect.soft(parse_length('medium')).toEqual({ value: 1, unit: 'rem' })
	expect.soft(parse_length('large')).toEqual({ value: 1.2, unit: 'rem' })
	expect.soft(parse_length('x-large')).toEqual({ value: 1.5, unit: 'rem' })
	expect.soft(parse_length('xx-large')).toEqual({ value: 2, unit: 'rem' })
	expect.soft(parse_length('xxx-large')).toEqual({ value: 3, unit: 'rem' })
})

test('unitless 0', () => {
	expect.soft(parse_length('0')).toEqual({ value: 0, unit: 'px' })
	expect.soft(parse_length('0.0')).toEqual({ value: 0, unit: 'px' })
	expect.soft(parse_length('+0')).toEqual({ value: 0, unit: 'px' })
})

test('invalid values', () => {
	expect.soft(parse_length('')).toBeNull()
	expect.soft(parse_length('1')).toBeNull()
	expect.soft(parse_length('1.5')).toBeNull()
})

test('unsupported units', () => {
	expect.soft(parse_length('100%')).toBeNull()
	expect.soft(parse_length('100vh')).toBeNull()
	expect.soft(parse_length('1em')).toBeNull()
})

test('unsupported keywords', () => {
	expect.soft(parse_length('normal')).toBeNull()
	expect.soft(parse_length('smaller')).toBeNull()
	expect.soft(parse_length('inherit')).toBeNull()
	expect.soft(parse_length('larger')).toBeNull()
})
