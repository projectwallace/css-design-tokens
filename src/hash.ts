export function hash(input: string | undefined | number): string {
	if (input === undefined) {
		return '0'
	}

	if (typeof input === 'number' && isNaN(input)) {
		return '0'
	}

	if (typeof input !== 'string') {
		input = input.toString()
	}

	let hash = 0
	for (let char of input) {
		hash = (hash << 5) - hash + char.charCodeAt(0)
		hash |= 0
	}
	return (hash >>> 0).toString(16)
}
