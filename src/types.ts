import type { analyze } from '@projectwallace/css-analyzer'

// CssAnalysis represents the result of analyze() which can be called with or without useLocations
// TypeScript infers this as the union of both overload return types
export type CssAnalysis = ReturnType<typeof analyze>

export const EXTENSION_AUTHORED_AS = 'com.projectwallace.css-authored-as'
export const EXTENSION_USAGE_COUNT = 'com.projectwallace.usage-count'
export const EXTENSION_CSS_PROPERTIES = 'com.projectwallace.css-properties'

export type BaseToken = {
	$extensions: {
		[EXTENSION_AUTHORED_AS]: string
		[EXTENSION_USAGE_COUNT]: number
	}
}

export type UnparsedToken = BaseToken & {
	$value: string
	$type?: never
}

type Unit = 'rem' | 'px'

export type DimensionValue = {
	value: number
	unit: Unit
}

/** @deprecated use type DimensionValue instead */
export type Length = DimensionValue

export type DimensionToken = BaseToken & {
	$type: 'dimension'
	$value: DimensionValue
}

export type NumberToken = BaseToken & {
	$type: 'number'
	$value: number
}
