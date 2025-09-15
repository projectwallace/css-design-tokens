import { analyze } from '@projectwallace/css-analyzer'
import { convert as convert_duration } from 'css-time-sort'
import { group_colors, color_dict } from './group-colors.js'
import { destructure_box_shadow } from './destructure-box-shadow.js'
import { destructure_easing } from './destructure-easing.js'
import { destructure_font_family } from './destructure-font-family.js'
import { hash } from './hash.js'
import { destructure_line_height } from './destructure-line-height.js'
import { parse_length } from './parse-length.js'
import {
	EXTENSION_AUTHORED_AS,
	type CubicBezierToken,
	type DimensionToken,
	type DurationToken,
	type FontFamilyToken,
	type NumberToken,
	type UnparsedToken,
	type ColorToken,
	type CssAnalysis,
	type ShadowToken,
	EXTENSION_USAGE_COUNT,
} from './types.js'
import { color_to_token } from './colors.js'

export function css_to_tokens(css: string) {
	let analysis = analyze(css)
	return analysis_to_tokens(analysis)
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
type Collection = {
	unique: UniqueCount
} | {
	uniqueWithLocations: UniqueWithLocations
}
type TokenID = string

type Tokens = {
	color: Record<TokenID, ColorToken | UnparsedToken>
	font_size: Record<TokenID, UnparsedToken | DimensionToken>
	font_family: Record<TokenID, FontFamilyToken>
	line_height: Record<TokenID, UnparsedToken | DimensionToken | NumberToken>
	gradient: Record<TokenID, UnparsedToken>
	box_shadow: Record<TokenID, ShadowToken | UnparsedToken>
	radius: Record<TokenID, UnparsedToken>
	duration: Record<TokenID, DurationToken | UnparsedToken>
	easing: Record<TokenID, UnparsedToken | CubicBezierToken>
}

/**
 * Function to get the unique values from a collection regardless of whether the analysis was run with
 * locations enabled or not.
 */
function get_unique(collection: Collection) {
	if ('uniqueWithLocations' in collection) {
		return collection.uniqueWithLocations
	}
	return collection.unique
}

function get_count(collection_item: number | CssLocation[]) {
	if (Array.isArray(collection_item)) {
		return collection_item.length
	}
	return collection_item
}

export function analysis_to_tokens(analysis: CssAnalysis): Tokens {
	return {
		color: (() => {
			let colors = Object.create(null) as Record<TokenID, ColorToken | UnparsedToken>
			let unique = get_unique(analysis.values.colors)
			let color_groups = group_colors(unique)

			for (let [group, group_colors] of color_groups) {
				for (let color of group_colors) {
					let color_token = color_to_token(color)
					if (color_token !== null) {
						let name = `${color_dict.get(group)}-${hash(color)}`
						colors[name] = {
							$type: 'color',
							$value: color_token,
							$extensions: {
								[EXTENSION_AUTHORED_AS]: color,
								[EXTENSION_USAGE_COUNT]: get_count(unique[color]!)
							}
						}
					}
				}
			}
			return colors
		})(),
		font_size: (() => {
			let font_sizes = Object.create(null) as Record<TokenID, UnparsedToken | DimensionToken>
			let unique = get_unique(analysis.values.fontSizes)

			for (let font_size in unique) {
				let name = `fontSize-${hash(font_size)}`
				let parsed = parse_length(font_size)
				let extensions = {
					[EXTENSION_AUTHORED_AS]: font_size,
					[EXTENSION_USAGE_COUNT]: get_count(unique[font_size]!),
				}

				if (parsed === null) {
					font_sizes[name] = {
						$value: font_size,
						$extensions: extensions,
					}
				} else {
					font_sizes[name] = {
						$type: 'dimension',
						$value: parsed,
						$extensions: extensions,
					}
				}
			}
			return font_sizes
		})(),
		font_family: (() => {
			let families = Object.create(null) as Record<TokenID, FontFamilyToken>
			let unique = get_unique(analysis.values.fontFamilies)

			for (let font_family in unique) {
				let parsed = destructure_font_family(font_family)
				let name = `fontFamily-${hash(font_family)}`
				families[name] = {
					$type: 'fontFamily',
					$value: parsed,
					$extensions: {
						[EXTENSION_AUTHORED_AS]: font_family,
						[EXTENSION_USAGE_COUNT]: get_count(unique[font_family]!)
					}
				}
			}
			return families
		})(),
		line_height: (() => {
			let line_heights = Object.create(null) as Record<TokenID, UnparsedToken | DimensionToken | NumberToken>
			let unique = get_unique(analysis.values.lineHeights)

			for (let line_height in unique) {
				let name = `lineHeight-${hash(line_height)}`
				let parsed = destructure_line_height(line_height)
				let extensions = {
					[EXTENSION_AUTHORED_AS]: line_height,
					[EXTENSION_USAGE_COUNT]: get_count(unique[line_height]!),
				}

				if (parsed === null) {
					line_heights[name] = {
						$value: line_height,
						$extensions: extensions,
					}
				} else if (typeof parsed === 'number') {
					line_heights[name] = {
						$type: 'number',
						$value: parsed,
						$extensions: extensions,
					}
				} else if (typeof parsed === 'object') {
					if (parsed.unit === 'px' || parsed.unit === 'rem') {
						line_heights[name] = {
							$type: 'dimension',
							$value: parsed,
							$extensions: extensions,
						}
					} else {
						line_heights[name] = {
							$value: line_height,
							$extensions: extensions,
						}
					}
				}
			}
			return line_heights
		})(),
		gradient: (() => {
			let gradients = Object.create(null) as Record<TokenID, UnparsedToken>
			let unique = get_unique(analysis.values.gradients)

			for (let gradient in unique) {
				gradients[`gradient-${hash(gradient)}`] = {
					$value: gradient,
					$extensions: {
						[EXTENSION_AUTHORED_AS]: gradient,
						[EXTENSION_USAGE_COUNT]: get_count(unique[gradient]!),
					},
				}
			}
			return gradients
		})(),
		box_shadow: (() => {
			let shadows = Object.create(null) as Record<TokenID, ShadowToken | UnparsedToken>
			let unique = get_unique(analysis.values.boxShadows)

			for (let box_shadow in unique) {
				let name = `boxShadow-${hash(box_shadow)}`
				let parsed = destructure_box_shadow(box_shadow)
				let extensions = {
					[EXTENSION_AUTHORED_AS]: box_shadow,
					[EXTENSION_USAGE_COUNT]: get_count(unique[box_shadow]!),
				}

				if (parsed === null) {
					shadows[name] = {
						$value: box_shadow,
						$extensions: extensions,
					}
				} else {
					shadows[name] = {
						$type: 'shadow',
						$value: parsed.length === 1 ? parsed[0]! : parsed,
						$extensions: extensions,
					}
				}
			}
			return shadows
		})(),
		radius: (() => {
			let radii = Object.create(null) as Record<TokenID, UnparsedToken>
			let unique = get_unique(analysis.values.borderRadiuses)

			for (let radius in unique) {
				let name = `radius-${hash(radius)}`
				radii[name] = {
					$value: radius,
					$extensions: {
						[EXTENSION_AUTHORED_AS]: radius,
						[EXTENSION_USAGE_COUNT]: get_count(unique[radius]!),
					},
				}
			}
			return radii
		})(),
		duration: (() => {
			let durations = Object.create(null) as Record<TokenID, DurationToken | UnparsedToken>
			let unique = get_unique(analysis.values.animations.durations)

			for (let duration in unique) {
				let parsed = convert_duration(duration)
				let is_valid = parsed < Number.MAX_SAFE_INTEGER - 1
				let name = hash(parsed.toString())
				let extensions = {
					[EXTENSION_AUTHORED_AS]: duration,
					[EXTENSION_USAGE_COUNT]: get_count(unique[duration]!),
				}

				if (is_valid) {
					durations[`duration-${name}`] = {
						$type: 'duration',
						$value: {
							value: parsed,
							unit: 'ms'
						},
						$extensions: extensions,
					}
				} else {
					durations[`duration-${name}`] = {
						$value: duration,
						$extensions: extensions,
					}
				}
			}
			return durations
		})(),
		easing: (() => {
			let easings = Object.create(null) as Record<TokenID, UnparsedToken | CubicBezierToken>
			let unique = get_unique(analysis.values.animations.timingFunctions)

			for (let easing in unique) {
				let name = `easing-${hash(easing)}`
				let value = destructure_easing(easing)
				let extensions = {
					[EXTENSION_AUTHORED_AS]: easing,
					[EXTENSION_USAGE_COUNT]: get_count(unique[easing]!),
				}

				if (value !== null) {
					easings[name] = {
						$value: value,
						$type: 'cubicBezier',
						$extensions: extensions,
					}
				} else {
					easings[name] = {
						$value: easing,
						$extensions: extensions,
					}
				}
			}
			return easings
		})(),
	}
}