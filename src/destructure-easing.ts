import type { Easing } from './types.js'

const EASING_KEYWORDS = new Map<string, Easing>([
	['linear', [0, 0, 1, 1]],
	['ease', [0.25, 0.1, 0.25, 1]],
	['ease-in', [0.42, 0, 1, 1]],
	['ease-out', [0, 0, 0.58, 1]],
	['ease-in-out', [0.42, 0, 0.58, 1]],
])

const CUBIC_BEZIER = /^cubic-bezier\(([^()]*)\)$/

export function destructure_easing(easing: string): Easing | null {
	easing = easing.trim().toLowerCase()

	if (EASING_KEYWORDS.has(easing)) {
		return EASING_KEYWORDS.get(easing) as Easing
	}

	if (easing.includes('var(')) {
		return null
	}

	let match = CUBIC_BEZIER.exec(easing)
	if (match !== null) {
		let parts = match[1]!.split(',').map((v) => v.trim())
		if (parts.length !== 4 || parts.some((v) => v === '')) {
			return null
		}
		let numbers = parts.map(Number)
		let [x1, , x2] = numbers
		if (
			numbers.every((n) => Number.isFinite(n)) &&
			// https://drafts.csswg.org/css-easing/#cubic-bezier-easing-functions: x values must be in [0, 1]
			x1! >= 0 &&
			x1! <= 1 &&
			x2! >= 0 &&
			x2! <= 1
		) {
			return numbers as Easing
		}
	}

	return null
}
