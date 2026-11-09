import { analyze, type CountMap, type ResultOf } from '@projectwallace/css-analyzer'
import {
	design_tokens_collectors,
	type DesignTokensCollectors,
} from '@projectwallace/css-analyzer/presets'
import { group_colors } from './group-colors.ts'
import { destructure_box_shadow } from './destructure-box-shadow.ts'
import { destructure_easing } from './destructure-easing.ts'
import { destructure_font_family } from './destructure-font-family.ts'
import { hash } from './hash.ts'
import { destructure_line_height } from './destructure-line-height.ts'
import { parse_length } from './parse-length.ts'
import { parse_duration } from './parse-duration.ts'
import {
	EXTENSION_AUTHORED_AS,
	EXTENSION_USAGE_COUNT,
	EXTENSION_CSS_PROPERTIES,
	type CubicBezierToken,
	type DimensionToken,
	type DurationToken,
	type FontFamilyToken,
	type NumberToken,
	type UnparsedToken,
	type ColorToken,
	type BaseToken,
	type ShadowToken,
} from './types.ts'
import { color_to_token } from './colors.ts'
export { color_to_token } from './colors.ts'

export {
	EXTENSION_AUTHORED_AS,
	EXTENSION_USAGE_COUNT,
	EXTENSION_CSS_PROPERTIES,
	type Easing,
	type BaseToken,
	type CubicBezierToken,
	type DimensionValue,
	type DimensionToken,
	type DurationToken,
	type DurationValue,
	type FontFamilyToken,
	type NumberToken,
	type UnparsedToken,
	type ShadowToken,
	type ColorSpace,
	type ColorToken,
	type ColorValue,
	type ColorComponent,
} from './types.ts'
export type { CssLength, ShadowValue } from './destructure-box-shadow.ts'

export function css_to_tokens(css: string): Tokens {
	return analysis_to_tokens(analyze(css, design_tokens_collectors()))
}

export { design_tokens_collectors as create_collectors }
export type { DesignTokensCollectors as Collectors }

/** The analyzer result that `analysis_to_tokens` consumes */
export type CssAnalysis = ResultOf<DesignTokensCollectors>

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
	unique: CountMap,
	parse?: (value: string) => Parsed<T> | null,
): Record<TokenID, T | UnparsedToken> {
	let tokens = Object.create(null) as Record<TokenID, T | UnparsedToken>

	for (let [authored, { count }] of unique) {
		let extensions = {
			[EXTENSION_AUTHORED_AS]: authored,
			[EXTENSION_USAGE_COUNT]: count,
		}
		let parsed = parse?.(authored) ?? null

		if (parsed === null) {
			tokens[`${prefix}-${hash(authored)}`] = {
				$value: authored,
				$extensions: extensions,
			}
			continue
		}

		let name = `${prefix}-${hash(parsed.key)}`
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
			let colors = Object.create(null) as Record<TokenID, ColorToken>
			let unique = analysis.colors.unique
			let color_groups = group_colors(unique.keys())

			// Build a color -> properties lookup once, instead of scanning every context for every color
			let properties_per_color = new Map<string, Set<string>>()
			for (let [property, collection] of analysis.colors.by_context) {
				for (let color of collection.unique.keys()) {
					let properties = properties_per_color.get(color)
					if (properties === undefined) {
						properties_per_color.set(color, new Set([property]))
					} else {
						properties.add(property)
					}
				}
			}

			for (let [group, group_colors] of color_groups) {
				for (let color of group_colors) {
					let color_token = color_to_token(color)
					let count = unique.get(color)!.count

					if (color_token !== null) {
						let { colorSpace, components, alpha } = color_token
						let name = `${group}-${hash([colorSpace, ...components, alpha].join(','))}`

						let new_properties = properties_per_color.get(color) ?? new Set<string>()

						if (colors[name]) {
							let old_properties = colors[name].$extensions[EXTENSION_CSS_PROPERTIES]
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
		font_size: to_tokens<DimensionToken>('fontSize', analysis.font_sizes.unique, (value) => {
			let parsed = parse_length(value)
			if (parsed === null) {
				return null
			}
			return {
				key: parsed.value.toString() + parsed.unit,
				token: { $type: 'dimension', $value: parsed },
			}
		}),
		font_family: to_tokens<FontFamilyToken>(
			'fontFamily',
			analysis.font_families.unique,
			(value) => {
				let parsed = destructure_font_family(value)
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
			analysis.line_heights.unique,
			(value) => {
				let parsed = destructure_line_height(value)
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
		gradient: to_tokens('gradient', analysis.gradients.unique),
		box_shadow: to_tokens<ShadowToken>('boxShadow', analysis.box_shadows.unique, (value) => {
			let parsed = destructure_box_shadow(value)
			if (parsed === null) {
				return null
			}
			// Dedupe on the parsed value so equivalent notations (`0 0 0 #000` vs `0px 0px #000000`) merge
			return {
				key: JSON.stringify(parsed),
				token: { $type: 'shadow', $value: parsed.length === 1 ? parsed[0]! : parsed },
			}
		}),
		radius: to_tokens('radius', analysis.border_radiuses.unique),
		duration: to_tokens<DurationToken>('duration', analysis.durations.unique, (value) => {
			let parsed = parse_duration(value)
			if (parsed === null) {
				return null
			}
			return {
				key: parsed.toString(),
				token: { $type: 'duration', $value: { value: parsed, unit: 'ms' } },
			}
		}),
		easing: to_tokens<CubicBezierToken>('easing', analysis.timing_functions.unique, (value) => {
			let parsed = destructure_easing(value)
			if (parsed === null) {
				return null
			}
			// Dedupe on the parsed value so `ease` and `cubic-bezier(0.25, 0.1, 0.25, 1)` merge
			return {
				key: parsed.join(','),
				token: { $value: parsed, $type: 'cubicBezier' },
			}
		}),
	}
}
