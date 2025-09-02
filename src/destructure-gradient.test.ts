import { test, expect } from 'vitest'
import { destructure_gradient } from './destructure-gradient'

test('linear-gradient(blue)', () => {
	expect(destructure_gradient('linear-gradient(blue)')).toEqual({
		$type: 'gradient',
		$value: [
			{
				color: {
					$type: 'color',
					$value: {
						alpha: 1,
						colorSpace: 'srgb',
						components: [0, 0, 1],
					},
					$extensions: {
						'com.projectwallace.css-authored-as': 'blue'
					},
				},
				position: 0,
			},
		],
		$extensions: {
			'com.projectwallace.css-authored-as': 'linear-gradient(blue)'
		}
	})
})

test('linear-gradient(blue, red)', () => {
	expect(destructure_gradient('linear-gradient(blue, red)')).toEqual({
		$type: 'gradient',
		$value: [
			{
				color: {
					$type: 'color',
					$value: {
						alpha: 1,
						colorSpace: 'srgb',
						components: [0, 0, 1],
					},
					$extensions: {
						'com.projectwallace.css-authored-as': 'blue'
					},
				},
				position: 0,
			},
			{
				color: {
					$type: 'color',
					$value: {
						alpha: 1,
						colorSpace: 'srgb',
						components: [1, 0, 0],
					},
					$extensions: {
						'com.projectwallace.css-authored-as': 'red'
					},
				},
				position: 1,
			},
		],
		$extensions: {
			'com.projectwallace.css-authored-as': 'linear-gradient(blue, red)'
		}
	})
})

test('linear-gradient(blue, red)', () => {
	expect(destructure_gradient('linear-gradient(blue, red, green)')).toEqual({
		$type: 'gradient',
		$value: [
			{
				color: {
					$type: 'color',
					$value: {
						alpha: 1,
						colorSpace: 'srgb',
						components: [0, 0, 1],
					},
					$extensions: {
						'com.projectwallace.css-authored-as': 'blue'
					},
				},
				position: 0,
			},
			{
				color: {
					$type: 'color',
					$value: {
						alpha: 1,
						colorSpace: 'srgb',
						components: [1, 0, 0],
					},
					$extensions: {
						'com.projectwallace.css-authored-as': 'red'
					},
				},
				position: 0.5,
			},
			{
				color: {
					$type: 'color',
					$value: {
						alpha: 1,
						colorSpace: 'srgb',
						components: [0, 1, 0],
					},
					$extensions: {
						'com.projectwallace.css-authored-as': 'green'
					},
				},
				position: 1,
			},
		],
		$extensions: {
			'com.projectwallace.css-authored-as': 'linear-gradient(blue, red, green)'
		}
	})
})

test('linear-gradient(90deg, #0000ff, #ff0000)', () => {
	expect(destructure_gradient('linear-gradient(90deg, #0000ff, #ff0000)')).toEqual({
		$type: 'gradient',
		$value: [
			{
				color: {
					$type: 'color',
					$value: {
						alpha: 1,
						colorSpace: 'srgb',
						components: [0, 0, 1],
					},
					$extensions: {
						'com.projectwallace.css-authored-as': '#0000ff'
					},
				},
				position: 0,
			},
			{
				color: {
					$type: 'color',
					$value: {
						alpha: 1,
						colorSpace: 'srgb',
						components: [1, 0, 0],
					},
					$extensions: {
						'com.projectwallace.css-authored-as': '#ff0000'
					},
				},
				position: 1,
			},
		],
		$extensions: {
			'com.projectwallace.css-authored-as': 'linear-gradient(90deg, #0000ff, #ff0000)'
		}
	})
})

test('unsupported cases', () => {
	expect.soft(destructure_gradient('')).toBeNull()
	expect.soft(destructure_gradient('var(--my-gradient')).toBeNull()
	expect.soft(destructure_gradient('var(--my-gradient, var(--my-fallback)')).toBeNull()
	// expect.soft(destructure_gradient('var(--my-gradient, linear-gradient(red, green)')).toBeNull()
	// expect.soft(destructure_gradient('linear-gradient(red, var(--green))')).toBeNull()
})