/**
 * @description A Set-like construct to search CSS keywords in a case-insensitive way
 */
export class KeywordSet {
	private set: Set<string>

	constructor(items: Lowercase<string>[]) {
		this.set = new Set(items)
	}

	has(item: string) {
		return this.set.has(item.toLowerCase())
	}
}
