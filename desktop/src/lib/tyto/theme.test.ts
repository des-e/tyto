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

const VIBE_BLUES = ['#2563eb', '#60a5fa', '#3b82f6', '#339cff', '37 99 235', '51 156 255', '#5b8def']

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
			'muted-foreground': '#a3a3a3',
		})
	})

	it('dark theme: light grey on near-black', () => {
		expect(dark).toMatchObject({
			background: '#0b0b0c',
			foreground: '#ededed',
			sidebar: '#111113',
			border: '#1f1f22',
			input: '#2a2a2f',
			'muted-foreground': '#6b6b72',
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

	it('is loaded after the upstream globals so its tokens win', () => {
		const bootstrap = read('bootstrap.tsx')
		const globals = bootstrap.indexOf("import './globals.css'")
		const theme = bootstrap.indexOf("import './lib/tyto/theme.css'")
		expect(globals).toBeGreaterThanOrEqual(0)
		expect(theme).toBeGreaterThan(globals)
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
