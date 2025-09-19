import { test, expect, describe } from 'vitest'
import { analysis_to_tokens, css_to_tokens } from './index.js'
import { EXTENSION_AUTHORED_AS, EXTENSION_CSS_PROPERTIES, EXTENSION_USAGE_COUNT } from './types.js'
import { analyze } from '@projectwallace/css-analyzer'

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
			'green-5e0cf03': {
				$type: 'color',
				$value: {
					colorSpace: 'srgb',
					components: [0, 0.5019607843137255, 0],
					alpha: 1,
				},
				$extensions: {
					[EXTENSION_AUTHORED_AS]: 'green',
					[EXTENSION_USAGE_COUNT]: 1,
					[EXTENSION_CSS_PROPERTIES]: ['color']
				}
			},
		},
		font_size: {
			'fontSize-171eed': {
				$type: 'dimension',
				$value: {
					value: 16,
					unit: 'px'
				},
				$extensions: {
					[EXTENSION_AUTHORED_AS]: '16px',
					[EXTENSION_USAGE_COUNT]: 1,
				}
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
		let analysis = analyze(css, {
			useLocations: false,
		})
		let actual = analysis_to_tokens(analysis)
		expect(actual).toEqual(expected)
	})

	test('allows analysis with locations', () => {
		let analysis = analyze(css, {
			useLocations: true,
		})
		let actual = analysis_to_tokens(analysis)
		expect(actual).toEqual(expected)
	})
})

describe('css_to_tokens', () => {
	test('css_to_tokens', () => {
		expect(typeof css_to_tokens).toBe('function')
	})

	describe('colors', () => {
		test('output a colors section', () => {
			let actual = css_to_tokens(`
			.my-design-system {
				color: green;
				background-color: rgb(100 100 100 / 20%);
				border-color: green;
			}
		`)
			expect(actual.color).toEqual({
				'green-5e0cf03': {
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
					}
				},
				'grey-8139d9b': {
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
				}
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
				'black-991c5d52': {
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
					}
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
			let properties = actual.color['green-5e0cf03']!['$extensions'][EXTENSION_CSS_PROPERTIES]
			expect(properties).toEqual(['color'])
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
						unit: 'px'
					},
					$extensions: {
						[EXTENSION_AUTHORED_AS]: '16px',
						[EXTENSION_USAGE_COUNT]: 1,
					}
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
						unit: 'px'
					},
					$extensions: {
						[EXTENSION_AUTHORED_AS]: '0',
						[EXTENSION_USAGE_COUNT]: 1,
					}
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
					}
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
					}
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
					}
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
						unit: 'px'
					},
					$extensions: {
						[EXTENSION_AUTHORED_AS]: '16.0PX',
						// Count is still 1 because we look at the last dicovered value
						[EXTENSION_USAGE_COUNT]: 1,
					}
				},
				'fontSize-548aa743': {
					$type: 'dimension',
					$value: {
						unit: 'rem',
						value: 0.5,
					},
					$extensions: {
						[EXTENSION_AUTHORED_AS]: '.5rem',
						[EXTENSION_USAGE_COUNT]: 1,
					},
				},
				'fontSize-c238': {
					$type: 'dimension',
					$value: {
						unit: 'px',
						value: 0,
					},
					$extensions: {
						[EXTENSION_AUTHORED_AS]: '0rem',
						[EXTENSION_USAGE_COUNT]: 1,
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
				'fontFamily-3375cf09': {
					$type: 'fontFamily',
					$value: ['Inter', 'sans-serif'],
					$extensions: {
						[EXTENSION_AUTHORED_AS]: "'Inter', sans-serif",
						[EXTENSION_USAGE_COUNT]: 1,
					}
				},
			})
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
						unit: 'rem'
					},
					$extensions: {
						[EXTENSION_AUTHORED_AS]: '1.5rem',
						[EXTENSION_USAGE_COUNT]: 1,
					}
				}
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
						[EXTENSION_AUTHORED_AS]: '1.0',
						[EXTENSION_USAGE_COUNT]: 1,
					}
				},
				'lineHeight-17fec9': {
					$type: 'dimension',
					$value: {
						value: 1,
						unit: 'rem'
					},
					$extensions: {
						[EXTENSION_AUTHORED_AS]: '1.0rem',
						[EXTENSION_USAGE_COUNT]: 1,
					}
				},
				'lineHeight-c5f9': {
					$type: 'dimension',
					$value: {
						value: 1,
						unit: 'px'
					},
					$extensions: {
						[EXTENSION_AUTHORED_AS]: '1.0px',
						[EXTENSION_USAGE_COUNT]: 1,
					}
				},
				'lineHeight-30': {
					$type: 'number',
					$value: 0,
					$extensions: {
						[EXTENSION_AUTHORED_AS]: '0.0',
						[EXTENSION_USAGE_COUNT]: 1,
					}
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
					}
				}
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
					}
				}
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
					}
				},
			})
		})
	})

	describe('box shadows', () => {
		test('outputs a single box shadow token when 1 shadow is used', () => {
			let actual = css_to_tokens(`
			.my-design-system {
				box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.5);
			}
		`)
			expect(actual.box_shadow).toEqual({
				'boxShadow-6f90da6b': {
					$type: 'shadow',
					$value: {
						offsetX: {
							value: 0,
							unit: 'px'
						},
						offsetY: {
							value: 0,
							unit: 'px'
						},
						blur: {
							value: 10,
							unit: 'px'
						},
						spread: {
							value: 0,
							unit: 'px'
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
					}
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
				'boxShadow-be2751ac': {
					$type: 'shadow',
					$value: [
						{
							offsetX: {
								value: 0,
								unit: 'px'
							},
							offsetY: {
								value: 0,
								unit: 'px'
							},
							blur: {
								value: 10,
								unit: 'px'
							},
							spread: {
								value: 0,
								unit: 'px'
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
								unit: 'px'
							},
							offsetY: {
								value: 0,
								unit: 'px'
							},
							blur: {
								value: 10,
								unit: 'px'
							},
							spread: {
								value: 0,
								unit: 'px'
							},
							inset: false,
							color: {
								colorSpace: 'srgb',
								components: [0, 0, 0],
								alpha: 0.5,
							},
						}
					],
					$extensions: {
						[EXTENSION_AUTHORED_AS]: '0 0 10px 0 rgba(0, 0, 0, 0.5), 0 0 10px 0 rgba(0, 0, 0, 0.5)',
						[EXTENSION_USAGE_COUNT]: 1,
					}
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
					}
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
						unit: 'ms'
					},
					$extensions: {
						[EXTENSION_AUTHORED_AS]: '1s',
						[EXTENSION_USAGE_COUNT]: 1,
					}
				},
			})
		})

		test('outputs an unparsed token when using an invalid duration', () => {
			let actual = css_to_tokens(`
			.my-design-system {
				animation-duration: var(--test);
			}
		`)
			expect(actual.duration).toEqual({
				'duration-452f2b3b': {
					$value: 'var(--test)',
					$extensions: {
						[EXTENSION_AUTHORED_AS]: 'var(--test)',
						[EXTENSION_USAGE_COUNT]: 1,
					}
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
				'easing-ea6c7565': {
					$type: 'cubicBezier',
					$value: [
						0.42,
						0,
						0.58,
						1
					],
					$extensions: {
						[EXTENSION_AUTHORED_AS]: 'ease-in-out',
						[EXTENSION_USAGE_COUNT]: 1,
					}
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
				'easing-90111eba': {
					$type: 'cubicBezier',
					$value: [
						0,
						0,
						0.5,
						0.8
					],
					$extensions: {
						[EXTENSION_AUTHORED_AS]: 'cubic-bezier(0, 0, 0.5, .8)',
						[EXTENSION_USAGE_COUNT]: 1,
					}
				},
			})
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
					}
				},
			})
		})
	})
})