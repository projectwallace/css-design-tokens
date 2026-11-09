import { test, expect, describe } from 'vitest'
import {
	analysis_to_tokens,
	css_to_tokens,
	EXTENSION_AUTHORED_AS,
	EXTENSION_CSS_PROPERTIES,
	EXTENSION_USAGE_COUNT,
} from './index.ts'
import { analyze } from '@projectwallace/css-analyzer'
import {
	border_radiuses,
	box_shadows,
	colors,
	durations,
	font_families,
	font_sizes,
	gradients,
	line_heights,
	timing_functions,
} from '@projectwallace/css-analyzer/collectors'

function create_collectors(options?: { locations?: boolean }) {
	let { locations } = options ?? {}
	return {
		colors: colors({ contexts: true, locations }),
		font_sizes: font_sizes({ locations }),
		font_families: font_families({ locations }),
		line_heights: line_heights({ locations }),
		gradients: gradients({ locations }),
		box_shadows: box_shadows({ locations }),
		border_radiuses: border_radiuses({ locations }),
		durations: durations({ locations }),
		timing_functions: timing_functions({ locations }),
	}
}

describe('analysis_to_tokens', () => {
	test('exports a function', () => {
		expect(typeof analysis_to_tokens).toBe('function')
	})

	let css = `
		.my-design-system {
			color: green;
			font-size: 16px;
		}
	`

	let expected = {
		color: {
			'green-8aff77af': {
				$type: 'color',
				$value: {
					colorSpace: 'srgb',
					components: [0, 0.5019607843137255, 0],
					alpha: 1,
				},
				$extensions: {
					[EXTENSION_AUTHORED_AS]: 'green',
					[EXTENSION_USAGE_COUNT]: 1,
					[EXTENSION_CSS_PROPERTIES]: ['color'],
				},
			},
		},
		font_size: {
			'fontSize-171eed': {
				$type: 'dimension',
				$value: {
					value: 16,
					unit: 'px',
				},
				$extensions: {
					[EXTENSION_AUTHORED_AS]: '16px',
					[EXTENSION_USAGE_COUNT]: 1,
				},
			},
		},
		font_family: {},
		line_height: {},
		gradient: {},
		box_shadow: {},
		radius: {},
		duration: {},
		easing: {},
	}

	test('allows analysis without locations', () => {
		let analysis = analyze(css, create_collectors())
		let actual = analysis_to_tokens(analysis)
		expect(actual).toEqual(expected)
	})

	test('allows analysis with locations', () => {
		let analysis = analyze(css, create_collectors({ locations: true }))
		let actual = analysis_to_tokens(analysis)
		expect(actual).toEqual(expected)
	})
})

describe('css_to_tokens', () => {
	test('css_to_tokens', () => {
		expect(typeof css_to_tokens).toBe('function')
	})

	describe('colors', () => {
		test('does not merge colors whose components only differ in digit grouping', () => {
			// Without a separator, [50, 1, 23] and [50, 12, 3] both hash 'lab501231'
			let actual = css_to_tokens(`
			.my-design-system {
				color: lab(50 1 23);
				background-color: lab(50 12 3);
			}
		`)
			expect(Object.keys(actual.color)).toHaveLength(2)
		})

		test('output a colors section', () => {
			let actual = css_to_tokens(`
			.my-design-system {
				color: green;
				background-color: rgb(100 100 100 / 20%);
				border-color: green;
			}
		`)
			expect(actual.color).toEqual({
				'green-8aff77af': {
					$type: 'color',
					$value: {
						colorSpace: 'srgb',
						components: [0, 0.5019607843137255, 0],
						alpha: 1,
					},
					$extensions: {
						[EXTENSION_AUTHORED_AS]: 'green',
						[EXTENSION_USAGE_COUNT]: 2,
						[EXTENSION_CSS_PROPERTIES]: ['color', 'border-color'],
					},
				},
				'grey-d85b3edc': {
					$type: 'color',
					$value: {
						colorSpace: 'srgb',
						components: [0.39215686274509803, 0.39215686274509803, 0.39215686274509803],
						alpha: 0.2,
					},
					$extensions: {
						[EXTENSION_AUTHORED_AS]: 'rgb(100 100 100 / 20%)',
						[EXTENSION_USAGE_COUNT]: 1,
						[EXTENSION_CSS_PROPERTIES]: ['background-color'],
					},
				},
			})
		})

		test('handles currentColor', () => {
			let actual = css_to_tokens(`
			.my-design-system {
				color: currentColor;
			}
		`)
			expect(actual.color).toEqual({})
		})

		test('handles transparent', () => {
			let actual = css_to_tokens(`
			.my-design-system {
				color: transparent;
			}
		`)
			expect(actual.color).toEqual({
				'black-e211158a': {
					$type: 'color',
					$value: {
						colorSpace: 'srgb',
						components: [0, 0, 0],
						alpha: 0,
					},
					$extensions: {
						[EXTENSION_AUTHORED_AS]: 'transparent',
						[EXTENSION_USAGE_COUNT]: 1,
						[EXTENSION_CSS_PROPERTIES]: ['color'],
					},
				},
			})
		})

		test('handles colors with var()', () => {
			let actual = css_to_tokens(`
			.my-design-system {
				color: var(--my-color);
				color: oklch(var(--my-color) / .4);
			}
		`)
			expect(actual.color).toEqual({})
		})

		test('extensions[css-properties] does not yield a type error', () => {
			let actual = css_to_tokens('a { color: green; }')
			// Not so much interested in the test result, more looking that this isn't giving a type error
			let properties = actual.color['green-8aff77af']!['$extensions'][EXTENSION_CSS_PROPERTIES]
			expect(properties).toEqual(['color'])
		})

		test('deduplicates colors', () => {
			let actual = css_to_tokens(`
				.my-design-system {
					color: green;
					border-color: rgb(0, 128, 0);
					background-color: #008000;
					color: #008000;
				}
				.alpha {
					border-color: rgb(0 128 0 / 0.5);
					border-color: rgb(0 128 0 / .5);
				}
		`)
			expect(actual.color).toEqual({
				'green-8aff77af': {
					$type: 'color',
					$value: {
						colorSpace: 'srgb',
						components: [0, 0.5019607843137255, 0],
						alpha: 1,
					},
					$extensions: {
						[EXTENSION_AUTHORED_AS]: 'green',
						[EXTENSION_USAGE_COUNT]: 4,
						[EXTENSION_CSS_PROPERTIES]: ['color', 'border-color', 'background-color'],
					},
				},
				'green-c90049f5': {
					$type: 'color',
					$value: {
						colorSpace: 'srgb',
						components: [0, 0.5019607843137255, 0],
						alpha: 0.5,
					},
					$extensions: {
						[EXTENSION_AUTHORED_AS]: 'rgb(0 128 0 / 0.5)',
						[EXTENSION_USAGE_COUNT]: 2,
						[EXTENSION_CSS_PROPERTIES]: ['border-color'],
					},
				},
			})
		})
	})

	describe('font sizes', () => {
		test('outputs a dimension type when using rem or px', () => {
			let actual = css_to_tokens(`
			.my-design-system {
				font-size: 16px;
			}
		`)
			expect(actual.font_size).toEqual({
				'fontSize-171eed': {
					$type: 'dimension',
					$value: {
						value: 16,
						unit: 'px',
					},
					$extensions: {
						[EXTENSION_AUTHORED_AS]: '16px',
						[EXTENSION_USAGE_COUNT]: 1,
					},
				},
			})
		})
		test('handles `0`', () => {
			let actual = css_to_tokens(`
			.my-design-system {
				font-size: 0;
			}
		`)
			expect(actual.font_size).toEqual({
				'fontSize-c238': {
					$type: 'dimension',
					$value: {
						value: 0,
						unit: 'px',
					},
					$extensions: {
						[EXTENSION_AUTHORED_AS]: '0',
						[EXTENSION_USAGE_COUNT]: 1,
					},
				},
			})
		})

		test('outputs a value type when not using rem or px', () => {
			let actual = css_to_tokens(`
			.my-design-system {
				font-size: 20vmin;
			}
		`)
			expect(actual.font_size).toEqual({
				'fontSize-582e015a': {
					$value: '20vmin',
					$extensions: {
						[EXTENSION_AUTHORED_AS]: '20vmin',
						[EXTENSION_USAGE_COUNT]: 1,
					},
				},
			})
		})

		test('handles values with var()', () => {
			let actual = css_to_tokens(`
			.my-design-system {
				font-size: var(--font-size);
			}
		`)
			expect(actual.font_size).toEqual({
				'fontSize-f25d5b4b': {
					$value: 'var(--font-size)',
					$extensions: {
						[EXTENSION_AUTHORED_AS]: 'var(--font-size)',
						[EXTENSION_USAGE_COUNT]: 1,
					},
				},
			})
		})

		test('handles values with calc()', () => {
			let actual = css_to_tokens(`
			.my-design-system {
				font-size: calc(16px + 20%);
			}
		`)
			expect(actual.font_size).toEqual({
				'fontSize-804e5477': {
					$value: 'calc(16px + 20%)',
					$extensions: {
						[EXTENSION_AUTHORED_AS]: 'calc(16px + 20%)',
						[EXTENSION_USAGE_COUNT]: 1,
					},
				},
			})
		})

		test('dedupes identical sizes', () => {
			let actual = css_to_tokens(`
			.my-design-system {
				font-size: 16px;
				font-size: 16.0PX;

				font-size: 0.5rem;
				font-size: .5rem;

				font-size: 0;
				font-size: 0px;
				font-size: 0rem;
			}
		`)
			expect(actual.font_size).toEqual({
				'fontSize-171eed': {
					$type: 'dimension',
					$value: {
						value: 16,
						unit: 'px',
					},
					$extensions: {
						[EXTENSION_AUTHORED_AS]: '16px',
						[EXTENSION_USAGE_COUNT]: 2,
					},
				},
				'fontSize-548aa743': {
					$type: 'dimension',
					$value: {
						unit: 'rem',
						value: 0.5,
					},
					$extensions: {
						[EXTENSION_AUTHORED_AS]: '0.5rem',
						[EXTENSION_USAGE_COUNT]: 2,
					},
				},
				'fontSize-c238': {
					$type: 'dimension',
					$value: {
						unit: 'px',
						value: 0,
					},
					$extensions: {
						[EXTENSION_AUTHORED_AS]: '0',
						[EXTENSION_USAGE_COUNT]: 3,
					},
				},
			})
		})
	})

	describe('font families', () => {
		test('outputs a font family token for each font family', () => {
			let actual = css_to_tokens(`
			.my-design-system {
				font-family: 'Inter', sans-serif;
			}
		`)
			expect(actual.font_family).toEqual({
				'fontFamily-9e342b3': {
					$type: 'fontFamily',
					$value: ['Inter', 'sans-serif'],
					$extensions: {
						[EXTENSION_AUTHORED_AS]: "'Inter', sans-serif",
						[EXTENSION_USAGE_COUNT]: 1,
					},
				},
			})
		})

		test('dedupes identical stacks regardless of quoting', () => {
			let actual = css_to_tokens(`
			.my-design-system {
				font-family: 'Inter', sans-serif;
				font-family: "Inter", sans-serif;
			}
		`)
			expect(actual.font_family).toEqual({
				'fontFamily-9e342b3': {
					$type: 'fontFamily',
					$value: ['Inter', 'sans-serif'],
					$extensions: {
						[EXTENSION_AUTHORED_AS]: "'Inter', sans-serif",
						[EXTENSION_USAGE_COUNT]: 2,
					},
				},
			})
		})

		test('does not merge stacks that only share the first family', () => {
			let actual = css_to_tokens(`
			.my-design-system {
				font-family: Arial, serif;
				font-family: Arial, sans-serif;
			}
		`)
			let values = Object.values(actual.font_family).map((token) => token.$value)
			expect(values).toEqual([
				['Arial', 'serif'],
				['Arial', 'sans-serif'],
			])
		})

		test('Always returns an array as value', () => {
			let actual = css_to_tokens(`
			.my-design-system {
				font-family: 'Inter';
			}
		`)
			expect(actual.font_family).toEqual({
				'fontFamily-43874bc': {
					$type: 'fontFamily',
					$value: ['Inter'],
					$extensions: {
						[EXTENSION_AUTHORED_AS]: "'Inter'",
						[EXTENSION_USAGE_COUNT]: 1,
					},
				},
			})
		})

		test('outputs var() font families as unparsed tokens', () => {
			let actual = css_to_tokens(`
			.my-design-system {
				font-family: var(--body-font);
				font-family: Arial, sans-serif, var(--fallback-font);
			}
		`)
			let tokens = Object.values(actual.font_family)
			expect(tokens).toEqual([
				{
					$value: 'var(--body-font)',
					$extensions: {
						[EXTENSION_AUTHORED_AS]: 'var(--body-font)',
						[EXTENSION_USAGE_COUNT]: 1,
					},
				},
				{
					$value: 'Arial, sans-serif, var(--fallback-font)',
					$extensions: {
						[EXTENSION_AUTHORED_AS]: 'Arial, sans-serif, var(--fallback-font)',
						[EXTENSION_USAGE_COUNT]: 1,
					},
				},
			])
		})
	})

	describe('line heights', () => {
		test('outputs a dimension type when using rem or px', () => {
			let actual = css_to_tokens(`
			.my-design-system {
				line-height: 1.5rem;
			}
		`)
			expect(actual.line_height).toEqual({
				'lineHeight-563f7fe2': {
					$type: 'dimension',
					$value: {
						value: 1.5,
						unit: 'rem',
					},
					$extensions: {
						[EXTENSION_AUTHORED_AS]: '1.5rem',
						[EXTENSION_USAGE_COUNT]: 1,
					},
				},
			})
		})

		test('dedupes line heights', () => {
			let actual = css_to_tokens(`
				.my-design-system {
					line-height: 1;
					line-height: 1.0;

					line-height: 1rem;
					line-height: 1.0rem;

					line-height: 1px;
					line-height: 1.0px;

					line-height: 0;
					line-height: 0.0;
				}
			`)
			expect(actual.line_height).toEqual({
				'lineHeight-31': {
					$type: 'number',
					$value: 1,
					$extensions: {
						[EXTENSION_AUTHORED_AS]: '1',
						[EXTENSION_USAGE_COUNT]: 2,
					},
				},
				'lineHeight-17fec9': {
					$type: 'dimension',
					$value: {
						value: 1,
						unit: 'rem',
					},
					$extensions: {
						[EXTENSION_AUTHORED_AS]: '1rem',
						[EXTENSION_USAGE_COUNT]: 2,
					},
				},
				'lineHeight-c5f9': {
					$type: 'dimension',
					$value: {
						value: 1,
						unit: 'px',
					},
					$extensions: {
						[EXTENSION_AUTHORED_AS]: '1px',
						[EXTENSION_USAGE_COUNT]: 2,
					},
				},
				'lineHeight-30': {
					$type: 'number',
					$value: 0,
					$extensions: {
						[EXTENSION_AUTHORED_AS]: '0',
						[EXTENSION_USAGE_COUNT]: 2,
					},
				},
			})
		})

		test('outputs a number type when using a number', () => {
			let actual = css_to_tokens(`
			.my-design-system {
				line-height: 1.5;
			}
		`)
			expect(actual.line_height).toEqual({
				'lineHeight-bdb8': {
					$type: 'number',
					$value: 1.5,
					$extensions: {
						[EXTENSION_AUTHORED_AS]: '1.5',
						[EXTENSION_USAGE_COUNT]: 1,
					},
				},
			})
		})

		test('outputs an unparsed type when using a value that is not a number or rem or px', () => {
			let actual = css_to_tokens(`
			.my-design-system {
				line-height: 20vmin;
			}
		`)
			expect(actual.line_height).toEqual({
				'lineHeight-582e015a': {
					$value: '20vmin',
					$extensions: {
						[EXTENSION_AUTHORED_AS]: '20vmin',
						[EXTENSION_USAGE_COUNT]: 1,
					},
				},
			})
		})
	})

	describe('gradients', () => {
		test('outputs a gradient token for each gradient', () => {
			let actual = css_to_tokens(`
			.my-design-system {
				background: linear-gradient(to right, red, blue);
			}
		`)
			expect(actual.gradient).toEqual({
				'gradient-2aec04e5': {
					$value: 'linear-gradient(to right, red, blue)',
					$extensions: {
						[EXTENSION_AUTHORED_AS]: 'linear-gradient(to right, red, blue)',
						[EXTENSION_USAGE_COUNT]: 1,
					},
				},
			})
		})
	})

	describe('box shadows', () => {
		test('dedupes equivalent notations', () => {
			let actual = css_to_tokens(`
			.my-design-system {
				box-shadow: 0 0 10px #000;
				box-shadow: 0px 0px 10px 0px #000000;
				box-shadow: 0 0 10px black;
			}
		`)
			let tokens = Object.values(actual.box_shadow)
			expect(tokens).toHaveLength(1)
			expect(tokens[0]!.$extensions[EXTENSION_AUTHORED_AS]).toBe('0 0 10px #000')
			expect(tokens[0]!.$extensions[EXTENSION_USAGE_COUNT]).toBe(3)
		})

		test('does not merge different shadows', () => {
			let actual = css_to_tokens(`
			.my-design-system {
				box-shadow: 0 0 10px #000;
				box-shadow: 0 0 10px #000 inset;
				box-shadow: 0 0 11px #000;
			}
		`)
			expect(Object.keys(actual.box_shadow)).toHaveLength(3)
		})

		test('outputs a single box shadow token when 1 shadow is used', () => {
			let actual = css_to_tokens(`
			.my-design-system {
				box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.5);
			}
		`)
			expect(actual.box_shadow).toEqual({
				'boxShadow-9d7bf51b': {
					$type: 'shadow',
					$value: {
						offsetX: {
							value: 0,
							unit: 'px',
						},
						offsetY: {
							value: 0,
							unit: 'px',
						},
						blur: {
							value: 10,
							unit: 'px',
						},
						spread: {
							value: 0,
							unit: 'px',
						},
						inset: false,
						color: {
							colorSpace: 'srgb',
							components: [0, 0, 0],
							alpha: 0.5,
						},
					},
					$extensions: {
						[EXTENSION_AUTHORED_AS]: '0 0 10px 0 rgba(0, 0, 0, 0.5)',
						[EXTENSION_USAGE_COUNT]: 1,
					},
				},
			})
		})

		test('outputs multiple box shadow tokens when multiple shadows are used', () => {
			let actual = css_to_tokens(`
			.my-design-system {
				box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.5), 0 0 10px 0 rgba(0, 0, 0, 0.5);
			}
		`)
			expect(actual.box_shadow).toEqual({
				'boxShadow-3427242a': {
					$type: 'shadow',
					$value: [
						{
							offsetX: {
								value: 0,
								unit: 'px',
							},
							offsetY: {
								value: 0,
								unit: 'px',
							},
							blur: {
								value: 10,
								unit: 'px',
							},
							spread: {
								value: 0,
								unit: 'px',
							},
							inset: false,
							color: {
								colorSpace: 'srgb',
								components: [0, 0, 0],
								alpha: 0.5,
							},
						},
						{
							offsetX: {
								value: 0,
								unit: 'px',
							},
							offsetY: {
								value: 0,
								unit: 'px',
							},
							blur: {
								value: 10,
								unit: 'px',
							},
							spread: {
								value: 0,
								unit: 'px',
							},
							inset: false,
							color: {
								colorSpace: 'srgb',
								components: [0, 0, 0],
								alpha: 0.5,
							},
						},
					],
					$extensions: {
						[EXTENSION_AUTHORED_AS]: '0 0 10px 0 rgba(0, 0, 0, 0.5), 0 0 10px 0 rgba(0, 0, 0, 0.5)',
						[EXTENSION_USAGE_COUNT]: 1,
					},
				},
			})
		})
	})

	describe('border radius', () => {
		test('outputs a radius token for each border radius', () => {
			let actual = css_to_tokens(`
			.my-design-system {
				border-radius: 10px;
			}
		`)
			expect(actual.radius).toEqual({
				'radius-170867': {
					$value: '10px',
					$extensions: {
						[EXTENSION_AUTHORED_AS]: '10px',
						[EXTENSION_USAGE_COUNT]: 1,
					},
				},
			})
		})
	})

	describe('duration', () => {
		test('outputs a token when using a valid duration', () => {
			let actual = css_to_tokens(`
				.my-design-system {
					animation-duration: 1s;
				}
			`)
			expect(actual.duration).toEqual({
				'duration-17005f': {
					$type: 'duration',
					$value: {
						value: 1000,
						unit: 'ms',
					},
					$extensions: {
						[EXTENSION_AUTHORED_AS]: '1s',
						[EXTENSION_USAGE_COUNT]: 1,
					},
				},
			})
		})

		test('outputs an unparsed token when using an invalid duration', () => {
			let actual = css_to_tokens(`
				.my-design-system {
					animation-duration: var(--test);
				}
			`)
			let [token] = Object.values(actual.duration)
			expect(token).toEqual({
				$value: 'var(--test)',
				$extensions: {
					[EXTENSION_AUTHORED_AS]: 'var(--test)',
					[EXTENSION_USAGE_COUNT]: 1,
				},
			})
		})

		test('keeps every distinct invalid duration as its own token', () => {
			let actual = css_to_tokens(`
				.my-design-system {
					animation-duration: var(--a);
					transition-duration: var(--b);
					animation-duration: foo;
					transition-duration: bar;
				}
			`)
			let authored = Object.values(actual.duration).map(
				(token) => token.$extensions[EXTENSION_AUTHORED_AS],
			)
			expect(authored.sort()).toEqual(['bar', 'foo', 'var(--a)', 'var(--b)'])
		})

		test('dedupes values', () => {
			let actual = css_to_tokens(`
				.my-design-system {
					animation-duration: 100ms;
					animation-duration: 0.1s;
					animation-duration: .1s;

					animation-duration: 1S;
					animation-duration: 1000MS;
				}
			`)
			expect(actual.duration).toEqual({
				'duration-bdf1': {
					$type: 'duration',
					$value: {
						value: 100,
						unit: 'ms',
					},
					$extensions: {
						[EXTENSION_AUTHORED_AS]: '100ms',
						[EXTENSION_USAGE_COUNT]: 3,
					},
				},
				'duration-17005f': {
					$type: 'duration',
					$value: {
						value: 1000,
						unit: 'ms',
					},
					$extensions: {
						[EXTENSION_AUTHORED_AS]: '1s',
						[EXTENSION_USAGE_COUNT]: 2,
					},
				},
			})
		})
	})

	describe('easing', () => {
		test('outputs a token when using an easing keyword', () => {
			let actual = css_to_tokens(`
			.my-design-system {
				animation-timing-function: ease-in-out;
			}
		`)
			expect(actual.easing).toEqual({
				'easing-7160ca12': {
					$type: 'cubicBezier',
					$value: [0.42, 0, 0.58, 1],
					$extensions: {
						[EXTENSION_AUTHORED_AS]: 'ease-in-out',
						[EXTENSION_USAGE_COUNT]: 1,
					},
				},
			})
		})

		test('outputs a token when describing a  bezier curve', () => {
			let actual = css_to_tokens(`
			.my-design-system {
				animation-timing-function: cubic-bezier(0, 0, 0.5, .8);
			}
		`)
			expect(actual.easing).toEqual({
				'easing-cbb31ccd': {
					$type: 'cubicBezier',
					$value: [0, 0, 0.5, 0.8],
					$extensions: {
						[EXTENSION_AUTHORED_AS]: 'cubic-bezier(0, 0, 0.5, .8)',
						[EXTENSION_USAGE_COUNT]: 1,
					},
				},
			})
		})

		test('dedupes keywords and their equivalent cubic-bezier()', () => {
			let actual = css_to_tokens(`
			.my-design-system {
				animation-timing-function: ease;
				transition-timing-function: cubic-bezier(0.25, 0.1, 0.25, 1);
				transition-timing-function: cubic-bezier(.25,.1,.25,1);
			}
		`)
			let tokens = Object.values(actual.easing)
			expect(tokens).toHaveLength(1)
			expect(tokens[0]!.$value).toEqual([0.25, 0.1, 0.25, 1])
			expect(tokens[0]!.$extensions[EXTENSION_AUTHORED_AS]).toBe('ease')
			expect(tokens[0]!.$extensions[EXTENSION_USAGE_COUNT]).toBe(3)
		})

		test('outputs an unparsed token when using an invalid easing', () => {
			let actual = css_to_tokens(`
			.my-design-system {
				animation-timing-function: var(--test);
			}
		`)
			expect(actual.easing).toEqual({
				'easing-12bb7f36': {
					$value: 'var(--test)',
					$extensions: {
						[EXTENSION_AUTHORED_AS]: 'var(--test)',
						[EXTENSION_USAGE_COUNT]: 1,
					},
				},
			})
		})
	})
})
