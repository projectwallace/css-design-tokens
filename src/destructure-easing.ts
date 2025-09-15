import type { Easing } from './types.js'

const EASING_KEYWORDS = new Map<string, Easing>([
	['linear', [0, 0, 1, 1]],
	['ease', [0.25, 0.1, 0.25, 1]],
	['ease-in', [0.42, 0, 1, 1]],
	['ease-out', [0, 0, 0.58, 1]],
	['ease-in-out', [0.42, 0, 0.58, 1]]
])

export function destructure_easing(easing: string): Easing | null {
	easing = easing.trim().toLowerCase()

	if (EASING_KEYWORDS.has(easing)) {
		return EASING_KEYWORDS.get(easing) as Easing
	}

	if (easing.includes('var(')) {
		return null
	}

	if (easing.startsWith('cubic-bezier(')) {
		let parts = easing
			.replace('cubic-bezier(', '')
			.replace(')', '')
			.split(',')
			.map((v) => Number(v.trim()))
		if (parts.length === 4 && parts.every(n => Number.isFinite(n))) {
			return parts as Easing
		}
	}

	return null
}