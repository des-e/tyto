import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const here = dirname(fileURLToPath(import.meta.url))
const srcDir = resolve(here, '../..')
const read = (path: string) => readFileSync(resolve(srcDir, path), 'utf-8')

/** Top-level `selector { --token: value; ... }` block of the Tyto theme file, as a map. */
function tokens(css: string, selector: string): Record<string, string> {
	const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
	const match = css.match(new RegExp(`(?:^|\\n)${escaped}\\s*\\{([^}]*)\\}`))
	if (!match) throw new Error(`no ${selector} block in theme.css`)
	const result: Record<string, string> = {}
	for (const [, name, value] of match[1].matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) {
		result[name] = value.trim().toLowerCase()
	}
	return result
}

/** WCAG 2 relative luminance contrast ratio of two #rrggbb colours. */
function contrast(a: string, b: string) {
	const luminance = (hex: string) => {
		const [r, g, bl] = [1, 3, 5].map((i) => {
			const v = parseInt(hex.slice(i, i + 2), 16) / 255
			return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
		})
		return 0.2126 * r + 0.7152 * g + 0.0722 * bl
	}
	const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
	return (hi + 0.05) / (lo + 0.05)
}

/** `rgb(r g b / a)` composited over an opaque #rrggbb, as #rrggbb. */
function blend(rgba: string, under: string) {
	const match = rgba.match(/rgb\(\s*(\d+)\s+(\d+)\s+(\d+)\s*\/\s*([\d.]+)\s*\)/)
	if (!match) throw new Error(`not an rgb() colour: ${rgba}`)
	const alpha = Number(match[4])
	return (
		'#' +
		[1, 2, 3]
			.map((i) => {
				const base = parseInt(under.slice(2 * i - 1, 2 * i + 1), 16)
				const value = Math.round(Number(match[i]) * alpha + base * (1 - alpha))
				return value.toString(16).padStart(2, '0')
			})
			.join('')
	)
}

/** Declarations of the first rule whose selector list contains `selector`. */
function rule(css: string, selector: string) {
	const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
	const match = css.match(new RegExp(`(?:^|\\n|,)\\s*${escaped}\\s*(?:,[^{]*)?\\{([^}]*)\\}`))
	if (!match) throw new Error(`no ${selector} rule in theme.css`)
	return match[1]
}

const VIBE_BLUES =['#2563eb', '#60a5fa', '#3b82f6', '#339cff', '37 99 235', '51 156 255', '#5b8def']

describe('tyto theme tokens', () => {
	const css = read('lib/tyto/theme.css')
	const light = tokens(css, ':root')
	const dark = tokens(css, '.dark')

	it('light theme: near-black on white', () => {
		expect(light).toMatchObject({
			background: '#ffffff',
			foreground: '#0a0a0a',
			sidebar: '#fafafa',
			border: '#e5e5e5',
			'sidebar-border': '#ededed',
			'muted-foreground': '#737373',
		})
	})

	it('muted text keeps WCAG AA contrast (>= 4.5:1) on the page and the sidebar', () => {
		for (const theme of [light, dark]) {
			expect(contrast(theme['muted-foreground'], theme.background)).toBeGreaterThanOrEqual(4.5)
			expect(contrast(theme['muted-foreground'], theme.sidebar)).toBeGreaterThanOrEqual(4.5)
		}
	})

	it('dark theme: light grey on near-black', () => {
		expect(dark).toMatchObject({
			background: '#0b0b0c',
			foreground: '#ededed',
			sidebar: '#111113',
			border: '#1f1f22',
			input: '#2a2a2f',
			'muted-foreground': '#808088',
		})
	})

	it('the only accent is the foreground colour', () => {
		for (const theme of [light, dark]) {
			expect(theme.primary).toBe(theme.foreground)
			expect(theme['sidebar-primary']).toBe(theme.foreground)
			expect(theme['primary-foreground']).toBe(theme.background)
		}
	})

	it('overrides the same tokens in both themes, so the light block never leaks into dark', () => {
		expect(Object.keys(dark).sort()).toEqual(Object.keys(light).sort())
	})

	it('contains no Vibe blue', () => {
		for (const blue of VIBE_BLUES) expect(css.toLowerCase()).not.toContain(blue)
	})

	it('selected state is a solid foreground plate with inverted text', () => {
		const rule = css.match(/\.tyto-selected[^{]*\{([^}]*)\}/)
		expect(rule?.[1]).toContain('background-color: var(--foreground)')
		expect(rule?.[1]).toContain('color: var(--background)')
	})

	it('selected text keeps WCAG AA contrast (>= 4.5:1) on the selected plate in both themes', () => {
		for (const theme of [light, dark]) {
			// Selected plate = foreground, selected text = background, secondary text = translucent background.
			expect(contrast(theme.background, theme.foreground)).toBeGreaterThanOrEqual(4.5)
			const muted = blend(theme['tyto-selected-muted'], theme.foreground)
			expect(contrast(muted, theme.foreground)).toBeGreaterThanOrEqual(4.5)
		}
	})

	it('disabled buttons keep readable text on their grey fill in both themes', () => {
		for (const theme of [light, dark]) {
			expect(contrast(theme['tyto-disabled-fg'], theme.muted)).toBeGreaterThanOrEqual(4.5)
			expect(contrast('#ffffff', theme['tyto-danger'])).toBeGreaterThanOrEqual(4.5)
		}
	})

	it('is loaded after the upstream globals so its tokens win', () => {
		const bootstrap = read('bootstrap.tsx')
		const globals = bootstrap.indexOf("import './globals.css'")
		const theme = bootstrap.indexOf("import './lib/tyto/theme.css'")
		expect(globals).toBeGreaterThanOrEqual(0)
		expect(theme).toBeGreaterThan(globals)
	})
})

describe('tyto shape tokens and type', () => {
	const css = read('lib/tyto/theme.css')
	const shape = tokens(css, 'html')

	it('radii are 4/6/8/12 and shadcn --radius is 0.5rem in both themes', () => {
		expect(shape).toMatchObject({ 'tyto-r-xs': '4px', 'tyto-r-sm': '6px', 'tyto-r-md': '8px', 'tyto-r-lg': '12px' })
		expect(tokens(css, ':root').radius).toBe('0.5rem')
		expect(tokens(css, '.dark').radius).toBe('0.5rem')
	})

	it('bottom bars share one height token of 56px', () => {
		expect(shape['tyto-bar-h']).toBe('56px')
	})

	it('spacing scale is the 4px grid from the spec', () => {
		for (const step of [2, 4, 8, 12, 16, 24, 32, 48]) expect(shape[`tyto-sp-${step}`]).toBe(`${step}px`)
	})

	it('type scale: titles 600 with tight tracking, meeting text 15/1.65', () => {
		expect(rule(css, '.tyto-title-screen')).toMatch(/font-size: 28px/)
		expect(rule(css, '.tyto-title-screen')).toMatch(/letter-spacing: -0\.03em/)
		expect(rule(css, '.tyto-title-doc')).toMatch(/font-size: 26px/)
		expect(rule(css, '.tyto-title-settings')).toMatch(/font-size: 22px/)
		expect(rule(css, '.tyto-title-dialog')).toMatch(/font-size: 17px/)
		const meeting = rule(css, '.tyto-text-meeting')
		expect(meeting).toMatch(/font-size: 15px/)
		expect(meeting).toMatch(/line-height: 1\.65/)
	})

	it('eyebrow labels are 12px, weight 500, muted, in normal case', () => {
		const eyebrow = rule(css, '.tyto-eyebrow')
		expect(eyebrow).not.toMatch(/text-transform:\s*uppercase/)
		expect(eyebrow).toMatch(/text-transform: none/)
		expect(eyebrow).toMatch(/font-size: 12px/)
		expect(eyebrow).toMatch(/font-weight: 500/)
		expect(eyebrow).toMatch(/letter-spacing: 0/)
		expect(css).not.toMatch(/text-transform:\s*uppercase/)
		// Upstream's `.eyebrow` and its inline 11px caps labels are covered by the same rule.
		expect(css).toMatch(/\.eyebrow\s*,/)
	})

	it('lucide icons use a 1.5 stroke', () => {
		expect(rule(css, 'svg.lucide')).toMatch(/stroke-width: 1\.5/)
	})

	it('toasts sit above the player bar, centred over the main area', () => {
		const toaster = read('components/ui/sonner.tsx')
		expect(toaster).toContain("position = 'bottom-center'")
		expect(toaster).toContain('calc(var(--tyto-bar-h) + 12px)')
		expect(read('app.tsx')).not.toContain('position="bottom-right"')
		expect(css).toMatch(/\[data-sonner-toaster\]\[data-x-position='center'\][^{]*\{[^}]*var\(--tyto-main-x/)
	})
})

describe('owl branding in secondary windows', () => {
	it('the window title is Tyto', () => {
		expect(read('../index.html')).toContain('<title>Tyto</title>')
	})

	it('meeting prompt and dictation indicator show the owl, not the Vibe logo', () => {
		for (const file of ['windows/meeting-prompt-window.tsx', 'windows/dictation-indicator-window.tsx']) {
			const source = read(file)
			expect(source, file).not.toContain('design/logo.svg')
			expect(source, file).toContain('<OwlMark')
		}
	})
})

describe('export palettes', () => {
	it('HTML and PDF exports carry no Vibe blue', () => {
		for (const file of ['lib/transcript-export.ts', 'lib/pdf/transcript-document.tsx']) {
			const source = read(file).toLowerCase()
			for (const blue of VIBE_BLUES) expect(source, `${file} contains ${blue}`).not.toContain(blue)
		}
	})

	it('the PDF title uses the ink colour', () => {
		const source = read('lib/pdf/transcript-document.tsx')
		expect(source).toMatch(/dark: \{[^}]*ink: '#ececec'[^}]*accent: '#ececec'/)
		expect(source).toMatch(/light: \{[^}]*ink: '#0a0a0a'[^}]*accent: '#0a0a0a'/)
	})
})
