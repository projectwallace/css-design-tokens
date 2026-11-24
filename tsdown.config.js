import { defineConfig } from 'tsdown'

export default defineConfig({
	entry: {
		index: 'src/index.ts',
		color: 'src/color.ts',
		'color-group': 'src/color-group.ts',
		'box-shadow': 'src/destructure-box-shadow.ts',
		easing: 'src/destructure-easing.ts',
		'font-family': 'src/destructure-font-family.ts',
		'line-height': 'src/destructure-line-height.ts',
		hash: 'src/hash.ts',
		duration: 'src/parse-duration.ts',
		length: 'src/parse-length.ts',
	},
	platform: 'neutral',
	dts: true,
	publint: true,
})
