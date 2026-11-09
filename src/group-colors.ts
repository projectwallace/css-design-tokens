import { convert } from '@projectwallace/color-sorter'

type ColorGroup =
	| 'white'
	| 'black'
	| 'grey'
	| 'red'
	| 'orange'
	| 'yellow'
	| 'green'
	| 'cyan'
	| 'blue'
	| 'magenta'
	| 'pink'
	| 'unknown'

type AuthoredColor = string

export function group_colors(colors: Iterable<AuthoredColor>): [ColorGroup, AuthoredColor[]][] {
	let color_groups = new Map<ColorGroup, AuthoredColor[]>()

	for (let color of colors) {
		let group: ColorGroup = 'unknown'

		if (!color.includes('var(') && !color.includes('calc(')) {
			let converted = convert(color)
			let { hue, saturation, lightness } = converted

			if (saturation < 10 && lightness === 100) {
				group = 'white'
			} else if (saturation < 10 && lightness === 0) {
				group = 'black'
			} else if (saturation < 5) {
				group = 'grey'
			} else {
				if (hue < 22) {
					group = 'red'
				} else if (hue < 50) {
					group = 'orange'
				} else if (hue < 72) {
					group = 'yellow'
				} else if (hue < 144) {
					group = 'green'
				} else if (hue < 180) {
					group = 'cyan'
				} else if (hue < 250) {
					group = 'blue'
				} else if (hue < 300) {
					group = 'magenta'
				} else if (hue < 350) {
					group = 'pink'
				} else {
					group = 'red'
				}
			}
		}

		if (color_groups.has(group)) {
			color_groups.get(group)!.push(color)
		} else {
			color_groups.set(group, [color])
		}
	}

	// Largest groups first, `unknown` always last
	return Array.from(color_groups).sort((a, b) => {
		if (a[0] === 'unknown') {
			return b[0] === 'unknown' ? 0 : 1
		}
		if (b[0] === 'unknown') {
			return -1
		}
		return b[1].length - a[1].length
	})
}
