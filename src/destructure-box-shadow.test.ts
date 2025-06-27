import { test, expect, describe } from 'vitest'
import { destructure_box_shadow } from './destructure-box-shadow.js'

function create_px_length(value: number): { value: number, unit: string, $type: 'dimension' } {
	return {
		$type: 'dimension',
		value,
		unit: 'px'
	}
}

test('handles invalid input', () => {
	expect.soft(destructure_box_shadow('')).toBeNull()
	expect.soft(destructure_box_shadow('foo')).toBeNull()
	expect.soft(destructure_box_shadow('#000')).toBeNull()
	expect.soft(destructure_box_shadow('2px')).toBeNull()
})

test('0px 0px 0px 0px #000', () => {
	expect(destructure_box_shadow('0px 0px 0px 0px #000')).toEqual([
		{
			color: '#000',
			offsetX: create_px_length(0),
			offsetY: create_px_length(0),
			blur: create_px_length(0),
			spread: create_px_length(0),
			inset: false
		}
	])
})

test('adds units when omitted: 0 0 0 0 #000', () => {
	expect(destructure_box_shadow('0 0 0 0 #000')).toEqual([
		{
			color: '#000',
			offsetX: create_px_length(0),
			offsetY: create_px_length(0),
			blur: create_px_length(0),
			spread: create_px_length(0),
			inset: false
		}
	])
})

test('offsetX and offsetY: 2px 4px #000', () => {
	expect(destructure_box_shadow('2px 4px #000')).toEqual([
		{
			color: '#000',
			offsetX: create_px_length(2),
			offsetY: create_px_length(4),
			blur: create_px_length(0),
			spread: create_px_length(0),
			inset: false
		}
	])
})

test('offsetX, offsetY and blur: 2px 4px 6px #000', () => {
	expect(destructure_box_shadow('2px 4px 6px #000')).toEqual([
		{
			color: '#000',
			offsetX: create_px_length(2),
			offsetY: create_px_length(4),
			blur: create_px_length(6),
			spread: create_px_length(0),
			inset: false
		}
	])
})

test('offsetX, offsetY, blur and spread: 2px 4px 6px 8px #000', () => {
	expect(destructure_box_shadow('2px 4px 6px 8px #000')).toEqual([
		{
			color: '#000',
			offsetX: create_px_length(2),
			offsetY: create_px_length(4),
			blur: create_px_length(6),
			spread: create_px_length(8),
			inset: false
		}
	])
})

test('inset: 2px 4px 6px 8px #000 inset', () => {
	expect(destructure_box_shadow('2px 4px 6px 8px #000 inset')).toEqual([
		{
			color: '#000',
			offsetX: create_px_length(2),
			offsetY: create_px_length(4),
			blur: create_px_length(6),
			spread: create_px_length(8),
			inset: true
		}
	])
})

test('INSET: 2px 4px 6px 8px #000 inset', () => {
	expect(destructure_box_shadow('2px 4px 6px 8px #000 INSET')).toEqual([
		{
			color: '#000',
			offsetX: create_px_length(2),
			offsetY: create_px_length(4),
			blur: create_px_length(6),
			spread: create_px_length(8),
			inset: true
		}
	])
})

test('color in a different order: #000 2px 4px 6px 8px', () => {
	expect(destructure_box_shadow('#000 2px 4px 6px 8px')).toEqual([
		{
			color: '#000',
			offsetX: create_px_length(2),
			offsetY: create_px_length(4),
			blur: create_px_length(6),
			spread: create_px_length(8),
			inset: false
		}
	])
})

test('multiple shadows', () => {
	expect(destructure_box_shadow('2px 4px 6px 8px #000, 0 0 0 0 #fff inset')).toEqual([
		{
			color: '#000',
			offsetX: create_px_length(2),
			offsetY: create_px_length(4),
			blur: create_px_length(6),
			spread: create_px_length(8),
			inset: false
		},
		{
			color: '#fff',
			offsetX: create_px_length(0),
			offsetY: create_px_length(0),
			blur: create_px_length(0),
			spread: create_px_length(0),
			inset: true
		}
	])
})

describe('color formats', () => {
	// Generate a list of colors to test with all different color formats (hsl, oklch, color(), etc.)
	let colors = [
		'#222222',
		'hsl(1, 20%, 30%)',
		'rgb(1, 1, 1)',
		'color(display-p3 -0.6112 1.0079 -0.2192)',
		'tomato',
	]
	for (let color of colors) {
		test(`1px ${color}`, () => {
			expect(destructure_box_shadow(`1px ${color}`)).toEqual([
				{
					color: color,
					offsetX: create_px_length(1),
					offsetY: create_px_length(0),
					blur: create_px_length(0),
					spread: create_px_length(0),
					inset: false
				}
			])
		})
	}
})
