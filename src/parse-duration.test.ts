import { test, expect } from 'vitest'
import { parse_duration } from './parse-duration.ts'

test.each([
	['100ms', 100],
	['0.1s', 100],
	['.1s', 100],
	['1S', 1000],
	['1000MS', 1000],
	['0s', 0],
	['0ms', 0],
	['1e3ms', 1000],
	['+1s', 1000],
	['-1s', -1000],
])('%s is %d ms', (input, expected) => {
	expect(parse_duration(input)).toBe(expected)
})

test.each(['0', '1', 'var(--duration)', 'calc(1s * 2)', '1x', '1px', 'foo', '1s 2s', ''])(
	'%s is not a duration',
	(input) => {
		expect(parse_duration(input)).toBeNull()
	},
)
