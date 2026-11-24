import { defineConfig } from 'tsdown'

export default defineConfig({
	entry: {
		index: 'src/index.ts',
		color: 'src/exports/color.ts',
		'box-shadow': 'src/exports/box-shadow.ts',
		easing: 'src/exports/easing.ts',
		'font-family': 'src/exports/font-family.ts',
		'line-height': 'src/exports/line-height.ts',
		duration: 'src/exports/duration.ts',
	},
	platform: 'neutral',
	dts: true,
	publint: true,
})
