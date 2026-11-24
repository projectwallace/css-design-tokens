import { analyze } from '@projectwallace/css-analyzer'
import { group_colors } from './color-group.ts'
import { destructure_box_shadow, type ShadowToken } from './destructure-box-shadow.ts'
import { destructure_easing, type CubicBezierToken } from './destructure-easing.ts'
import { destructure_font_family, type FontFamilyToken } from './destructure-font-family.ts'
import { hash } from './hash.ts'
import { destructure_line_height } from './destructure-line-height.ts'
import { parse_length } from './parse-length.ts'
import { parse_duration, type DurationToken } from './parse-duration.ts'
import {
	EXTENSION_AUTHORED_AS,
	EXTENSION_USAGE_COUNT,
	EXTENSION_CSS_PROPERTIES,
	type DimensionToken,
	type NumberToken,
	type UnparsedToken,
	type BaseToken,
	type CssAnalysis,
} from './types.ts'
import { color_to_token, type ColorToken } from './color.ts'

//#region deprecated exported functions and types
export {
	/** @deprecated Use `import { color_to_token } from '@projectwallace/css-design-tokens/color'` instead */
	color_to_token,
} from './color.ts'

export type { Easing, CubicBezierToken } from './destructure-easing.ts'
export type { ColorSpace, ColorToken, ColorValue, ColorComponent } from './color.ts'
export type { CssLength, ShadowValue, ShadowToken } from './destructure-box-shadow.ts'
export type { FontFamilyToken } from './destructure-font-family.ts'
export type { DurationToken, DurationValue } from './parse-duration.ts'
//#endregion

export {
	EXTENSION_AUTHORED_AS,
	EXTENSION_USAGE_COUNT,
	EXTENSION_CSS_PROPERTIES,
	type BaseToken,
	type DimensionValue,
	type DimensionToken,
	type NumberToken,
	type UnparsedToken,
	type CssAnalysis,
} from './types.ts'

export function css_to_tokens(css: string): Tokens {
	const analysis = analyze(css)
	// The analyze function has overloads and TypeScript's ReturnType only captures the last overload's return type,
	// making the two variants structurally incompatible for a direct cast.
	// The as unknown as CssAnalysis double assertion is the standard escape hatch for this.
	return analysis_to_tokens(analysis as unknown as CssAnalysis)
}

// TODO: get @projectwallace/css-analyzer types in order
type UniqueCount = Record<string, number>
type CssLocation = {
	line: number
	column: number
	offset: number
	length: number
}
type UniqueWithLocations = Record<string, CssLocation[]>
type Collection =
	| {
			unique: UniqueCount
			uniqueWithLocations?: UniqueWithLocations | null
	  }
	| {
			unique?: UniqueCount
			uniqueWithLocations: UniqueWithLocations
	  }
type ItemsPerContext = Record<
	string,
	{
		unique: Record<string, number>
		uniqueWithLocations?: UniqueWithLocations
	}
>

type TokenID = string

export type Tokens = {
	color: Record<TokenID, ColorToken>
	font_size: Record<TokenID, DimensionToken | UnparsedToken>
	font_family: Record<TokenID, FontFamilyToken | UnparsedToken>
	line_height: Record<TokenID, DimensionToken | NumberToken | UnparsedToken>
	gradient: Record<TokenID, UnparsedToken>
	box_shadow: Record<TokenID, ShadowToken | UnparsedToken>
	radius: Record<TokenID, UnparsedToken>
	duration: Record<TokenID, DurationToken | UnparsedToken>
	easing: Record<TokenID, CubicBezierToken | UnparsedToken>
}

/**
 * Function to get the unique values from a collection regardless of whether the analysis was run with
 * locations enabled or not.
 */
function get_unique(collection: Collection): UniqueCount | UniqueWithLocations {
	if (
		'uniqueWithLocations' in collection &&
		collection.uniqueWithLocations !== null &&
		collection.uniqueWithLocations !== undefined
	) {
		return collection.uniqueWithLocations
	}
	return collection.unique!
}

/**
 * Function to get the count of a specific value from a collection item regardless of whether the
 * analysis was run with locations enabled or not.
 */
function get_count(collection_item: number | CssLocation[]) {
	if (Array.isArray(collection_item)) {
		return collection_item.length
	}
	return collection_item
}

type Parsed<T extends BaseToken> = {
	/** Value to dedupe on, so equivalent notations merge into a single token */
	key: string | number
	token: Omit<T, '$extensions'>
}

/**
 * Turn a collection of authored values into tokens. Values that `parse` can't handle become
 * unparsed tokens; parsed values that share a `key` are merged and their usage counts summed.
 */
function to_tokens<T extends BaseToken = never>(
	prefix: string,
	unique: UniqueCount | UniqueWithLocations,
	parse?: (value: string) => Parsed<T> | null,
): Record<TokenID, T | UnparsedToken> {
	const tokens = Object.create(null) as Record<TokenID, T | UnparsedToken>

	for (const authored in unique) {
		const extensions = {
			[EXTENSION_AUTHORED_AS]: authored,
			[EXTENSION_USAGE_COUNT]: get_count(unique[authored]!),
		}
		const parsed = parse?.(authored) ?? null

		if (parsed === null) {
			tokens[`${prefix}-${hash(authored)}`] = {
				$value: authored,
				$extensions: extensions,
			}
			continue
		}

		const name = `${prefix}-${hash(parsed.key)}`
		if (tokens[name]) {
			tokens[name].$extensions[EXTENSION_USAGE_COUNT] += extensions[EXTENSION_USAGE_COUNT]
		} else {
			tokens[name] = { ...parsed.token, $extensions: extensions } as T
		}
	}
	return tokens
}

export function analysis_to_tokens(analysis: CssAnalysis): Tokens {
	return {
		color: (() => {
			const colors = Object.create(null)
			const unique = get_unique(analysis.values.colors)
			const color_groups = group_colors(unique)

			// Build a color -> properties lookup once, instead of scanning every context for every color
			const properties_per_color = new Map<string, Set<string>>()
			const items_per_context = analysis.values.colors.itemsPerContext as ItemsPerContext
			for (const property in items_per_context) {
				const collection = items_per_context[property]!
				for (const source of [collection.unique, collection.uniqueWithLocations]) {
					if (!source) {
						continue
					}
					for (const color in source) {
						const properties = properties_per_color.get(color)
						if (properties === undefined) {
							properties_per_color.set(color, new Set([property]))
						} else {
							properties.add(property)
						}
					}
				}
			}

			for (const [group, group_colors] of color_groups) {
				for (const color of group_colors) {
					const color_token = color_to_token(color)
					const count = get_count(unique[color]!)

					if (color_token !== null) {
						const { colorSpace, components, alpha } = color_token
						const name = `${group}-${hash([colorSpace, ...components, alpha].join(','))}`

						const new_properties = properties_per_color.get(color) ?? new Set<string>()

						if (colors[name]) {
							const old_properties = colors[name].$extensions[EXTENSION_CSS_PROPERTIES]
							colors[name].$extensions[EXTENSION_CSS_PROPERTIES] = Array.from(
								new Set(old_properties).union(new_properties),
							)
							colors[name].$extensions[EXTENSION_USAGE_COUNT] += count
						} else {
							colors[name] = {
								$type: 'color',
								$value: color_token,
								$extensions: {
									[EXTENSION_AUTHORED_AS]: color,
									[EXTENSION_USAGE_COUNT]: count,
									[EXTENSION_CSS_PROPERTIES]: Array.from(new_properties),
								},
							}
						}
					}
				}
			}
			return colors
		})(),
		font_size: to_tokens<DimensionToken>(
			'fontSize',
			get_unique(analysis.values.fontSizes),
			(value) => {
				const parsed = parse_length(value)
				if (parsed === null) {
					return null
				}
				return {
					key: parsed.value.toString() + parsed.unit,
					token: { $type: 'dimension', $value: parsed },
				}
			},
		),
		font_family: to_tokens<FontFamilyToken>(
			'fontFamily',
			get_unique(analysis.values.fontFamilies),
			(value) => {
				const parsed = destructure_font_family(value)
				if (!parsed) {
					return null
				}
				// Dedupe on the full (normalized) stack: `Arial, serif` and `Arial, sans-serif` are different tokens
				return {
					key: parsed.join(','),
					token: { $type: 'fontFamily', $value: parsed },
				}
			},
		),
		line_height: to_tokens<DimensionToken | NumberToken>(
			'lineHeight',
			get_unique(analysis.values.lineHeights),
			(value) => {
				const parsed = destructure_line_height(value)
				if (parsed === null) {
					return null
				}
				if (typeof parsed === 'number') {
					return { key: parsed, token: { $type: 'number', $value: parsed } }
				}
				// destructure_line_height only returns px or rem lengths
				return {
					key: parsed.value.toString() + parsed.unit,
					token: { $type: 'dimension', $value: parsed },
				}
			},
		),
		gradient: to_tokens('gradient', get_unique(analysis.values.gradients)),
		box_shadow: to_tokens<ShadowToken>(
			'boxShadow',
			get_unique(analysis.values.boxShadows),
			(value) => {
				const parsed = destructure_box_shadow(value)
				if (parsed === null) {
					return null
				}
				// Dedupe on the parsed value so equivalent notations (`0 0 0 #000` vs `0px 0px #000000`) merge
				return {
					key: JSON.stringify(parsed),
					token: { $type: 'shadow', $value: parsed.length === 1 ? parsed[0]! : parsed },
				}
			},
		),
		radius: to_tokens('radius', get_unique(analysis.values.borderRadiuses)),
		duration: to_tokens<DurationToken>(
			'duration',
			get_unique(analysis.values.animations.durations),
			(value) => {
				const parsed = parse_duration(value)
				if (parsed === null) {
					return null
				}
				return {
					key: parsed.toString(),
					token: { $type: 'duration', $value: { value: parsed, unit: 'ms' } },
				}
			},
		),
		easing: to_tokens<CubicBezierToken>(
			'easing',
			get_unique(analysis.values.animations.timingFunctions),
			(value) => {
				const parsed = destructure_easing(value)
				if (parsed === null) {
					return null
				}
				// Dedupe on the parsed value so `ease` and `cubic-bezier(0.25, 0.1, 0.25, 1)` merge
				return {
					key: parsed.join(','),
					token: { $value: parsed, $type: 'cubicBezier' },
				}
			},
		),
	}
}
