import { analyze } from "@projectwallace/css-analyzer"

export function cssToDesignTokens(css: string) {
	let analysis = analyze(css)

	return {}
}
