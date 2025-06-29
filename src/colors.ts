import { KeywordSet } from './keyword-set.js'
import { EXTENSION_AUTHORED_AS, type ColorToken } from './types.js'
import {
	parse,
	ColorSpace,
	sRGB,
	P3,
	LCH,
	HSL,
	OKLCH,
} from "colorjs.io/fn"

// Register color spaces for parsing and converting
ColorSpace.register(sRGB) // Parses keywords and hex colors
ColorSpace.register(P3)
ColorSpace.register(HSL)
ColorSpace.register(LCH)
ColorSpace.register(OKLCH)

export const named_colors = new KeywordSet([
	// CSS Named Colors
	// Spec: https://drafts.csswg.org/css-color/#named-colors

	// Heuristic: popular names first for quick finding in set.has()
	// See: https://docs.google.com/spreadsheets/d/1OU8ahxC5oYU8VRryQs9BzHToaXcOntVlh6KUHjm15G4/edit#gid=2096495459
	'white',
	'black',
	'red',
	'gray',
	'silver',
	'grey',
	'green',
	'orange',
	'blue',
	'dimgray',
	'whitesmoke',
	'lightgray',
	'lightgrey',
	'yellow',
	'gold',
	'pink',
	'gainsboro',
	'magenta',
	'purple',
	'darkgray',
	'navy',
	'darkred',
	'teal',
	'maroon',
	'darkgrey',
	'tomato',
	'darkorange',
	'brown',
	'crimson',
	'lightyellow',
	'slategray',
	'salmon',
	'lightgreen',
	'lightblue',
	'orangered',
	'aliceblue',
	'dodgerblue',
	'lime',
	'darkblue',
	'darkgoldenrod',
	'skyblue',
	'royalblue',
	'darkgreen',
	'ivory',
	'olive',
	'aqua',
	'turquoise',
	'cyan',
	'khaki',
	'beige',
	'snow',
	'ghostwhite',
	'limegreen',
	'coral',
	'dimgrey',
	'hotpink',
	'midnightblue',
	'firebrick',
	'indigo',
	'wheat',
	'mediumblue',
	'lightpink',
	'plum',
	'azure',
	'violet',
	'lavender',
	'deepskyblue',
	'darkslategrey',
	'goldenrod',
	'cornflowerblue',
	'lightskyblue',
	'indianred',
	'yellowgreen',
	'saddlebrown',
	'palegreen',
	'bisque',
	'tan',
	'antiquewhite',
	'steelblue',
	'forestgreen',
	'fuchsia',
	'mediumaquamarine',
	'seagreen',
	'sienna',
	'deeppink',
	'mediumseagreen',
	'peru',
	'greenyellow',
	'lightgoldenrodyellow',
	'orchid',
	'cadetblue',
	'navajowhite',
	'lightsteelblue',
	'slategrey',
	'linen',
	'lightseagreen',
	'darkcyan',
	'lightcoral',
	'aquamarine',
	'blueviolet',
	'cornsilk',
	'lightsalmon',
	'chocolate',
	'lightslategray',
	'floralwhite',
	'darkturquoise',
	'darkslategray',
	'rebeccapurple',
	'burlywood',
	'chartreuse',
	'lightcyan',
	'lemonchiffon',
	'palevioletred',
	'darkslateblue',
	'mediumpurple',
	'lawngreen',
	'slateblue',
	'darkseagreen',
	'blanchedalmond',
	'mistyrose',
	'darkolivegreen',
	'seashell',
	'olivedrab',
	'peachpuff',
	'darkviolet',
	'powderblue',
	'darkmagenta',
	'lightslategrey',
	'honeydew',
	'palegoldenrod',
	'darkkhaki',
	'oldlace',
	'mintcream',
	'sandybrown',
	'mediumturquoise',
	'papayawhip',
	'paleturquoise',
	'mediumvioletred',
	'thistle',
	'springgreen',
	'moccasin',
	'rosybrown',
	'lavenderblush',
	'mediumslateblue',
	'darkorchid',
	'mediumorchid',
	'darksalmon',
	'mediumspringgreen',
])

export const system_colors = new KeywordSet([
	// CSS System Colors
	// Spec: https://drafts.csswg.org/css-color/#css-system-colors
	'accentcolor',
	'accentcolortext',
	'activetext',
	'buttonborder',
	'buttonface',
	'buttontext',
	'canvas',
	'canvastext',
	'field',
	'fieldtext',
	'graytext',
	'highlight',
	'highlighttext',
	'linktext',
	'mark',
	'marktext',
	'selecteditem',
	'selecteditemtext',
	'visitedtext',
])

export const color_functions = new KeywordSet([
	'rgba',
	'rgb',
	'hsla',
	'hsl',
	'oklch',
	'color',
	'hwb',
	'lch',
	'lab',
	'oklab',
])

// List of CSS keywords that we will treat as full black colors.
const color_keywords = new KeywordSet([
	'currentcolor',
	'inherit',
	'initial',
	'unset',
	'revert',
	'revert-layer',
])

export function color_to_token(color: string): ColorToken {
	let lowercased = color.toLowerCase()

	// The keyword "transparent" specifies a transparent black.
	// > https://drafts.csswg.org/css-color-4/#transparent-color
	if (lowercased === 'transparent') {
		return {
			$type: 'color',
			$value: {
				colorSpace: 'srgb',
				components: [0, 0, 0],
				alpha: 0,
			},
			$extensions: {
				[EXTENSION_AUTHORED_AS]: color
			}
		}
	}

	if (color_keywords.has(lowercased)) {
		return {
			$type: 'color',
			$value: {
				colorSpace: 'srgb',
				components: [0, 0, 0],
				alpha: 1,
			},
			$extensions: {
				[EXTENSION_AUTHORED_AS]: color
			}
		}
	}

	let parsed_color = parse(color)
	let [component_a, component_b, component_c] = parsed_color.coords

	return {
		$type: 'color',
		$value: {
			colorSpace: parsed_color.spaceId,
			components: [
				component_a ?? 'none',
				component_b ?? 'none',
				component_c ?? 'none',
			],
			alpha: parsed_color.alpha ?? 0,
		},
		$extensions: {
			[EXTENSION_AUTHORED_AS]: color
		}
	}
}
