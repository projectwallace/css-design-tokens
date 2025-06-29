import { convert, type NormalizedColorWithAuthored } from 'color-sorter'
import type { CssAnalysis } from './types.js'

const white = 0
const black = 1
const grey = 2
const red = 3
const orange = 4
const yellow = 5
const green = 6
const cyan = 7
const blue = 8
const magenta = 9
const pink = 10
const unknown = 11

export const color_dict = new Map<number, string>([
	[white, 'white'],
	[black, 'black'],
	[grey, 'grey'],
	[red, 'red'],
	[orange, 'orange'],
	[yellow, 'yellow'],
	[green, 'green'],
	[cyan, 'cyan'],
	[blue, 'blue'],
	[magenta, 'magenta'],
	[pink, 'pink'],
	[unknown, 'unknown']
])

export function group_colors(colors: Record<string, unknown>) {
	let color_groups = new Map<number, NormalizedColorWithAuthored[]>()

	for (let color in colors) {
		if (color.includes('var(') || color.includes('calc(')) {
			continue
		}

		let converted = convert(color)
		let group = unknown
		let { hue, saturation, lightness } = converted

		if (saturation < 10 && lightness === 100) {
			group = white
		} else if (saturation < 10 && lightness === 0) {
			group = black
		} else if (saturation < 5) {
			group = grey
		} else {
			if (hue < 22) {
				group = red
			} else if (hue < 50) {
				group = orange
			} else if (hue < 72) {
				group = yellow
			} else if (hue < 144) {
				group = green
			} else if (hue < 180) {
				group = cyan
			} else if (hue < 250) {
				group = blue
			} else if (hue < 300) {
				group = magenta
			} else if (hue < 350) {
				group = pink
			} else {
				group = red
			}
		}

		if (color_groups.has(group)) {
			color_groups.get(group)!.push(converted)
		} else {
			color_groups.set(group, [converted])
		}
	}

	// Sort the colors in each group by lightness
	for (let group of color_groups.values()) {
		group.sort((a, b) => a.lightness - b.lightness)
	}

	return Array.from(color_groups).sort((a, b) =>
		a[0] === unknown || b[0] === unknown ? -1 : b[1].length - a[1].length
	)
}