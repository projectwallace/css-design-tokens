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
	EXTENSION_USAGE_COUNT,
	EXTENSION_CSS_PROPERTIES,
	type CubicBezierToken,
	type DimensionToken,
	type DurationToken,
	type FontFamilyToken,
	type NumberToken,
	type UnparsedToken,
	type ColorToken,
	type CssAnalysis,
	type ShadowToken,
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
type Collection =
	| {
			unique: UniqueCount
	  }
	| {
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
function get_unique(collection: Collection) {
	if ('uniqueWithLocations' in collection) {
		return collection.uniqueWithLocations
	}
	return collection.unique
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

export function analysis_to_tokens(analysis: CssAnalysis): Tokens {
	return {
		color: (() => {
			let colors = Object.create(null) as Record<TokenID, ColorToken>
			let unique = get_unique(analysis.values.colors)
			let color_groups = group_colors(unique)

			for (let [group, group_colors] of color_groups) {
				for (let color of group_colors) {
					let color_token = color_to_token(color)
					let count = get_count(unique[color]!)

					if (color_token !== null) {
						let { colorSpace, components, alpha } = color_token
						let name = `${color_dict.get(group)}-${hash([colorSpace, ...components, alpha].join(''))}`

						let items_per_context = analysis.values.colors.itemsPerContext as ItemsPerContext
						let new_properties = Object.entries(items_per_context).reduce((acc, [property, collection]) => {
							if (color in collection.unique) {
								return acc.add(property)
							}
							if (collection.uniqueWithLocations && color in collection.uniqueWithLocations) {
								return acc.add(property)
							}
							return acc
						}, new Set() as Set<string>)

						if (colors[name]) {
							let old_properties = colors[name].$extensions[EXTENSION_CSS_PROPERTIES]
							colors[name].$extensions[EXTENSION_CSS_PROPERTIES] = Array.from(new Set(old_properties).union(new_properties))
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
		font_size: (() => {
			let font_sizes = Object.create(null) as Record<TokenID, UnparsedToken | DimensionToken>
			let unique = get_unique(analysis.values.fontSizes)

			for (let font_size in unique) {
				let parsed = parse_length(font_size)
				let extensions = {
					[EXTENSION_AUTHORED_AS]: font_size,
					[EXTENSION_USAGE_COUNT]: get_count(unique[font_size]!),
				}

				if (parsed === null) {
					let name = `fontSize-${hash(font_size)}`
					font_sizes[name] = {
						$value: font_size,
						$extensions: extensions,
					}
				} else {
					let name = `fontSize-${hash(parsed.value.toString() + parsed.unit)}`
					if (font_sizes[name]) {
						font_sizes[name].$extensions[EXTENSION_USAGE_COUNT] += extensions[EXTENSION_USAGE_COUNT]
					} else {
						font_sizes[name] = {
							$type: 'dimension',
							$value: parsed,
							$extensions: extensions,
						}
					}
				}
			}
			return font_sizes
		})(),
		font_family: (() => {
			let families = Object.create(null) as Record<TokenID, FontFamilyToken | UnparsedToken>
			let unique = get_unique(analysis.values.fontFamilies)

			for (let font_family in unique) {
				let parsed = destructure_font_family(font_family)
				let name = `fontFamily-${hash(font_family)}`
				let extensions = {
					[EXTENSION_AUTHORED_AS]: font_family,
					[EXTENSION_USAGE_COUNT]: get_count(unique[font_family]!),
				}

				if (parsed === undefined) {
					families[name] = {
						$value: font_family,
						$extensions: extensions,
					}
				} else {
					families[name] = {
						$type: 'fontFamily',
						$value: parsed,
						$extensions: extensions,
					}
				}
			}
			return families
		})(),
		line_height: (() => {
			let line_heights = Object.create(null) as Record<TokenID, UnparsedToken | DimensionToken | NumberToken>
			let unique = get_unique(analysis.values.lineHeights)

			for (let line_height in unique) {
				let parsed = destructure_line_height(line_height)
				let extensions = {
					[EXTENSION_AUTHORED_AS]: line_height,
					[EXTENSION_USAGE_COUNT]: get_count(unique[line_height]!),
				}

				if (parsed === null) {
					let name = `lineHeight-${hash(line_height)}`
					line_heights[name] = {
						$value: line_height,
						$extensions: extensions,
					}
				} else if (typeof parsed === 'number') {
					let name = `lineHeight-${hash(parsed)}`
					if (line_heights[name]) {
						line_heights[name].$extensions[EXTENSION_USAGE_COUNT] += extensions[EXTENSION_USAGE_COUNT]
					} else {
						line_heights[name] = {
							$type: 'number',
							$value: parsed,
							$extensions: extensions,
						}
					}
				} else if (typeof parsed === 'object') {
					if (parsed.unit === 'px' || parsed.unit === 'rem') {
						let name = `lineHeight-${hash(parsed.value.toString() + parsed.unit)}`
						if (line_heights[name]) {
							line_heights[name].$extensions[EXTENSION_USAGE_COUNT] += extensions[EXTENSION_USAGE_COUNT]
						} else {
							line_heights[name] = {
								$type: 'dimension',
								$value: parsed,
								$extensions: extensions,
							}
						}
					} else {
						let name = `lineHeight-${hash(line_height)}`
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
				let extensions = {
					[EXTENSION_AUTHORED_AS]: duration,
					[EXTENSION_USAGE_COUNT]: get_count(unique[duration]!),
				}

				if (is_valid) {
					let name = `duration-${hash(parsed.toString())}`
					if (durations[name]) {
						durations[name].$extensions[EXTENSION_USAGE_COUNT] += extensions[EXTENSION_USAGE_COUNT]
					} else {
						durations[name] = {
							$type: 'duration',
							$value: {
								value: parsed,
								unit: 'ms',
							},
							$extensions: extensions,
						}
					}
				} else {
					let name = `duration-${hash('invalid' + parsed.toString())}`
					durations[name] = {
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
