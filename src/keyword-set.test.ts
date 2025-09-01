import { KeywordSet } from './keyword-set'
import { test, expect } from 'vitest'

test('happy path', () => {
	expect.soft(new KeywordSet([]).has('a')).toBeFalsy()
	expect.soft(new KeywordSet([]).has('')).toBeFalsy()
	expect.soft(new KeywordSet(['a', 'b']).has('a')).toBeTruthy()
	expect.soft(new KeywordSet(['a', 'b']).has('A')).toBeTruthy()
	expect.soft(new KeywordSet(['a', 'b']).has('aa')).toBeFalsy()

	expect.soft(new KeywordSet(['currentcolor']).has('currentColor')).toBeTruthy()
	expect.soft(new KeywordSet(['marktext']).has('MarkText')).toBeTruthy()
	expect.soft(new KeywordSet(['revert-layer']).has('Revert-Layer')).toBeTruthy()
})
