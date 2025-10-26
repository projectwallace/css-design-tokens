import { colorKeywords as color_keywords, cssKeywords as css_keywords } from '@projectwallace/css-analyzer'
import { type ColorValue, type ColorSpace as tColorSpace } from './types.js'
import {
	tryColor,
	ColorSpace,
	XYZ_D65,
	XYZ_D50,
	XYZ_ABS_D65,
	Lab_D65,
	Lab,
	LCH,
	sRGB_Linear,
	sRGB,
	HSL,
	HWB,
	HSV,
	P3_Linear,
	P3,
	A98RGB_Linear,
	A98RGB,
	ProPhoto_Linear,
	ProPhoto,
	REC_2020_Linear,
	REC_2020,
	OKLab,
	OKLCH,
	OKLrab,
} from 'colorjs.io/fn'

// Register color spaces for parsing and converting
ColorSpace.register(sRGB) // Parses keywords and hex colors
ColorSpace.register(XYZ_D65)
ColorSpace.register(XYZ_D50)
ColorSpace.register(XYZ_ABS_D65)
ColorSpace.register(Lab_D65)
ColorSpace.register(Lab)
ColorSpace.register(LCH)
ColorSpace.register(sRGB_Linear)
ColorSpace.register(HSL)
ColorSpace.register(HWB)
ColorSpace.register(HSV)
ColorSpace.register(P3_Linear)
ColorSpace.register(P3)
ColorSpace.register(A98RGB_Linear)
ColorSpace.register(A98RGB)
ColorSpace.register(ProPhoto_Linear)
ColorSpace.register(ProPhoto)
ColorSpace.register(REC_2020_Linear)
ColorSpace.register(REC_2020)
ColorSpace.register(OKLab)
ColorSpace.register(OKLCH)
ColorSpace.register(OKLrab)

export function color_to_token(color: string): ColorValue | null {
	let lowercased = color.toLowerCase()

	// The keyword "transparent" specifies a transparent black.
	// > https://drafts.csswg.org/css-color-4/#transparent-color
	if (lowercased === 'transparent') {
		return {
			colorSpace: 'srgb',
			components: [0, 0, 0],
			alpha: 0,
		}
	}

	if (css_keywords.has(lowercased) || color_keywords.has(lowercased)) {
		return null
	}

	if (lowercased.includes('var(')) {
		return null
	}

	let parsed_color = tryColor(color)

	if (parsed_color === null) return null
	let [component_a, component_b, component_c] = parsed_color.coords

	return {
		colorSpace: parsed_color.space.id as tColorSpace,
		components: [component_a ?? 'none', component_b ?? 'none', component_c ?? 'none'],
		alpha: parsed_color.alpha ?? 1,
	}
}
