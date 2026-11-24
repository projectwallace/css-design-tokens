import { test, expect } from 'vitest'
import * as color from './exports/color.ts'
import * as box_shadow from './exports/box-shadow.ts'
import * as easing from './exports/easing.ts'
import * as font_family from './exports/font-family.ts'
import * as line_height from './exports/line-height.ts'
import * as duration from './exports/duration.ts'
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
