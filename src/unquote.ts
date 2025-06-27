export function unquote(input: string): string {
	return input.replaceAll(/^['"]|['"]$/g, '')
}
