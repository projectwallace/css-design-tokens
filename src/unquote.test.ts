import { test, expect } from 'vitest'
import { unquote } from './unquote.js'

test('removes double quotes from both ends', () => {
	const result = unquote('"hello"')
	expect(result).toBe('hello')
})

test('removes single quotes from both ends', () => {
	const result = unquote("'hello'")
	expect(result).toBe('hello')
})

test('removes only a single quote from both ends', () => {
	const result = unquote(`"'hello'"`)
	expect(result).toBe(`'hello'`)
})

test('does not remove quotes from middle', () => {
	const result = unquote(`hel"l'o`)
	expect(result).toBe(`hel"l'o`)
})

test('leaves empty strings intact', () => {
	const result = unquote('')
	expect(result).toBe('')
})

test('does not alter string without quotes', () => {
	const result = unquote('hello')
	expect(result).toBe('hello')
})

test('does not alter whitespace', () => {
	const result = unquote('" hello "')
	expect(result).toBe(' hello ')
})
