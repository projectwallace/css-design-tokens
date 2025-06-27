import { convert as convert_duration } from 'css-time-sort'
import { group_colors, color_dict } from './group-colors.js'
import { destructure_box_shadow, type DestructuredShadow } from './destructure-box-shadow.js'
import { destructure_easing } from './destructure-easing.js'
import { destructure_font_family } from './destructure-font-family.js'
import { hash } from './hash.js'
import { destructure_line_height } from './destructure-line-height.js'
import { parse_length } from './parse-length.js'
import type { CssAnalysis } from './types.js'
import {
	EXTENSION_AUTHORED_AS,
	type CubicBezierToken,
	type DimensionToken,
	type DurationToken,
	type FontFamilyToken,
	type NumberToken,
	type BaseToken,
	type UnparsedToken,
} from './types.js'

const TYPE_CUBIC_BEZIER = 'cubicBezier' as const

export function generate_tokens(analysis: CssAnalysis) {
	return {
		Color: (() => {
			let colors = Object.create(null) as Record<string, UnparsedToken>
			let grouped_colors = group_colors(analysis.values.colors.uniqueWithLocations)

			for (let [group, group_colors] of grouped_colors) {
				for (let color of group_colors) {
					colors[`${color_dict.get(group)}-${hash(color.authored)}`] = {
						$value: color.authored
					}
				}
			}
			return colors
		})(),
		FontSizes: (() => {
			let font_sizes = Object.create(null) as Record<string, UnparsedToken | DimensionToken>

			for (let font_size in analysis.values.fontSizes.uniqueWithLocations) {
				let name = `fontSize-${hash(font_size)}`
				let parsed = parse_length(font_size)
				if (parsed === null) {
					font_sizes[name] = {
						$value: font_size,
						$extensions: {
							[EXTENSION_AUTHORED_AS]: font_size
						}
					}
				} else {
					font_sizes[name] = {
						$type: 'dimension',
						$value: parsed,
						$extensions: {
							[EXTENSION_AUTHORED_AS]: font_size
						}
					}
				}
			}
			return font_sizes
		})(),
		FontFamily: (() => {
			let families = Object.create(null) as Record<string, FontFamilyToken>

			for (let fontFamily in analysis.values.fontFamilies.uniqueWithLocations) {
				let parsed = destructure_font_family(fontFamily)
				let name = `fontFamily-${hash(fontFamily)}`
				families[name] = {
					$type: 'fontFamily',
					$value: parsed,
					$extensions: {
						[EXTENSION_AUTHORED_AS]: fontFamily
					}
				}
			}
			return families
		})(),
		LineHeight: (() => {
			let line_heights = Object.create(null) as Record<string, UnparsedToken | DimensionToken | NumberToken>

			for (let line_height in analysis.values.lineHeights.uniqueWithLocations) {
				let name = `lineHeight-${hash(line_height)}`
				let parsed = destructure_line_height(line_height)

				if (parsed === null) {
					line_heights[name] = {
						$value: line_height,
						$extensions: {
							[EXTENSION_AUTHORED_AS]: line_height
						}
					}
				} else if (typeof parsed === 'number') {
					line_heights[name] = {
						$type: 'number',
						$value: parsed,
						$extensions: {
							[EXTENSION_AUTHORED_AS]: line_height
						}
					}
				} else if (typeof parsed === 'object') {
					if (parsed.unit === 'px' || parsed.unit === 'rem') {
						line_heights[name] = {
							$type: 'dimension',
							$value: parsed,
							$extensions: {
								[EXTENSION_AUTHORED_AS]: line_height
							}
						}
					} else {
						line_heights[name] = {
							$value: line_height,
							$extensions: {
								[EXTENSION_AUTHORED_AS]: line_height
							}
						}
					}
				}
			}
			return line_heights
		})(),
		Gradient: (() => {
			let gradients = Object.create(null) as Record<string, UnparsedToken>

			for (let gradient in analysis.values.gradients.uniqueWithLocations) {
				gradients[`gradient-${hash(gradient)}`] = {
					$value: gradient
				}
			}
			return gradients
		})(),
		BoxShadow: (() => {
			type ShadowToken = BaseToken & {
				$type: 'shadow'
				$value: DestructuredShadow | DestructuredShadow[]
			}

			let shadows = Object.create(null) as Record<string, ShadowToken | UnparsedToken>

			for (let box_shadow in analysis.values.boxShadows.uniqueWithLocations) {
				let name = `boxShadow-${hash(box_shadow)}`
				let parsed = destructure_box_shadow(box_shadow)

				if (parsed === null) {
					shadows[name] = {
						$value: box_shadow,
						$extensions: {
							[EXTENSION_AUTHORED_AS]: box_shadow
						}
					} as UnparsedToken
				} else {
					shadows[name] = {
						$type: 'shadow',
						$value: parsed.length === 1 ? parsed[0] : parsed,
						$extensions: {
							[EXTENSION_AUTHORED_AS]: box_shadow
						}
					} as ShadowToken
				}
			}
			return shadows
		})(),
		Radius: (() => {
			let radii = Object.create(null) as Record<string, UnparsedToken>

			for (let radius in analysis.values.borderRadiuses.uniqueWithLocations) {
				let name = `radius-${hash(radius)}`
				radii[name] = {
					$value: radius
				}
			}
			return radii
		})(),
		Duration: (() => {
			let durations = Object.create(null) as Record<string, DurationToken | UnparsedToken>

			for (let duration in analysis.values.animations.durations.uniqueWithLocations) {
				let parsed = convert_duration(duration)
				let is_valid = parsed < Number.MAX_SAFE_INTEGER - 1
				let name = hash(parsed.toString())
				if (is_valid) {
					durations[`duration-${name}`] = {
						$type: 'duration',
						$value: {
							value: parsed,
							unit: 'ms'
						},
						$extensions: {
							[EXTENSION_AUTHORED_AS]: duration
						}
					}
				} else {
					durations[`duration-${name}`] = {
						$value: duration,
						$extensions: {
							[EXTENSION_AUTHORED_AS]: duration
						}
					}
				}
			}
			return durations
		})(),
		Easing: (() => {
			let easings = Object.create(null) as Record<string, UnparsedToken | CubicBezierToken>

			for (let easing in analysis.values.animations.timingFunctions.uniqueWithLocations) {
				let name = `easing-${hash(easing)}`
				let value = destructure_easing(easing)
				if (value) {
					easings[name] = {
						$value: value,
						$type: TYPE_CUBIC_BEZIER,
						$extensions: {
							[EXTENSION_AUTHORED_AS]: easing
						}
					}
				} else {
					easings[name] = {
						$value: easing,
						$extensions: {
							[EXTENSION_AUTHORED_AS]: easing
						}
					}
				}
			}
			return easings
		})(),
	}
}