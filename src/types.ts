import type { analyze } from '@projectwallace/css-analyzer'
import type { DestructuredShadow } from './destructure-box-shadow'

export type CssAnalysis = ReturnType<typeof analyze>

export const EXTENSION_AUTHORED_AS = 'com.projectwallace.css-authored-as'
export const EXTENSION_USAGE_COUNT = 'com.projectwallace.usage-count'
export const EXTENSION_CSS_PROPERTIES = 'com.projectwallace.css-properties'

export type Easing = [number, number, number, number]

export type BaseToken = {
	$extensions: {
		[EXTENSION_AUTHORED_AS]: string,
		[EXTENSION_USAGE_COUNT]: number
	}
}

type DurationValue = {
	value: number
	unit: 'ms'
}

export type DurationToken = BaseToken & {
	$type: 'duration'
	$value: DurationValue
}

export type UnparsedToken = BaseToken & {
	$value: string
	$type?: never
}

type ColorSpace = string | 'srgb' | 'display-p3' | 'hsl' | 'hwb' | 'lab' | 'lch' | 'oklab' | 'oklch' | 'display-p3' | 'a98-rgb' | 'prophoto-rgb' | 'rec2020' | 'xyz-d65' | 'xyz-d50'

export type ColorComponent = number | 'none'

export type ColorValue = {
	colorSpace: ColorSpace
	components: [ColorComponent, ColorComponent, ColorComponent]
	alpha: number
	hex?: string
}

export type ColorToken = BaseToken & {
	$type: 'color'
	$value: ColorValue,
	$extensions: {
		[EXTENSION_CSS_PROPERTIES]: Array<string>
	}
}

export type DimensionValue = {
	value: number
	unit: string
}

export type DimensionToken = BaseToken & {
	$type: 'dimension'
	$value: DimensionValue
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

export type ShadowToken = BaseToken & {
	$type: 'shadow'
	$value: DestructuredShadow | DestructuredShadow[]
}
