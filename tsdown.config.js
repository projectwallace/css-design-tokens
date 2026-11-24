import { defineConfig } from 'tsdown'

export default defineConfig({
	entry: {
		index: 'src/index.ts',
		color: 'src/colors.ts',
		'box-shadow': 'src/destructure-box-shadow.ts',
		easing: 'src/destructure-easing.ts',
		'font-family': 'src/destructure-font-family.ts',
		'line-height': 'src/destructure-line-height.ts',
		duration: 'src/parse-duration.ts',
	},
	platform: 'neutral',
	dts: true,
	publint: true,
})
