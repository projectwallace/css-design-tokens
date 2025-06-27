import type { analyze } from '@projectwallace/css-analyzer'

export type CssAnalysis = ReturnType<typeof analyze>

export const EXTENSION_AUTHORED_AS = 'com.projectwallace.css-authored-as'

export type Easing = [number, number, number, number]

export type BaseToken = {
	$extensions?: {
		[EXTENSION_AUTHORED_AS]?: string
	}
}

export type DurationToken = BaseToken & {
	$type: 'duration'
	$value: {
		value: number
		unit: 'ms'
	}
}

export type UnparsedToken = BaseToken & {
	$value: string
	$type?: never
}

export type DimensionToken = BaseToken & {
	$type: 'dimension'
	$value: {
		value: number
		unit: string
	}
}

export type NumberToken = BaseToken & {
	$type: 'number'
	$value: number
}

export type CubicBezierToken = BaseToken & {
	$type: 'cubicBezier'
	$value: Easing
}

export type FontFamilyToken = BaseToken & {
	$type: 'fontFamily'
	$value: string[] | string
}
