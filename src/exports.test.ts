import { test, expect } from 'vitest'
import * as color from './colors.ts'
import * as box_shadow from './destructure-box-shadow.ts'
import * as easing from './destructure-easing.ts'
import * as font_family from './destructure-font-family.ts'
import * as line_height from './destructure-line-height.ts'
import * as duration from './parse-duration.ts'
import { color_to_token } from './index.ts'

test('sub-exports expose their functions', () => {
	expect(color.color_to_token).toBeTypeOf('function')
	expect(color.group_colors).toBeTypeOf('function')
	expect(box_shadow.destructure_box_shadow).toBeTypeOf('function')
	expect(easing.destructure_easing).toBeTypeOf('function')
	expect(font_family.destructure_font_family).toBeTypeOf('function')
	expect(line_height.destructure_line_height).toBeTypeOf('function')
	expect(duration.parse_duration).toBeTypeOf('function')
})

test('main still exports color_to_token', () => {
	expect(color_to_token).toBe(color.color_to_token)
})
