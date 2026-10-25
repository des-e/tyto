// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, it } from 'vitest'
import { OwlMark } from './owl-mark'

afterEach(cleanup)

const css = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), 'theme.css'), 'utf-8')

describe('OwlMark blink', () => {
	it('has no eyelids by default', () => {
		render(<OwlMark />)
		expect(screen.getByTestId('owl-mark').querySelectorAll('.tyto-owl-lid')).toHaveLength(0)
	})

	it('blinks once when asked: one lid per eye', () => {
		render(<OwlMark blink />)
		expect(screen.getByTestId('owl-mark').querySelectorAll('.tyto-owl-lid')).toHaveLength(2)
	})

	it('the blink animates transform only, runs once, and is static with reduced motion', () => {
		const keyframes = css.match(/@keyframes tyto-owl-blink\s*\{([\s\S]*?)\n\}/)?.[1] ?? ''
		expect(keyframes).toContain('transform')
		expect(keyframes).not.toMatch(/\b(height|width|top|left|opacity)\s*:/)
		expect(css).toMatch(/\.tyto-owl-lid\s*\{[^}]*animation: tyto-owl-blink [^;]* 1 /)
		expect(css).toMatch(/prefers-reduced-motion: reduce\)\s*\{[\s\S]*?\.tyto-owl-lid[^{]*\{[^}]*animation: none/)
	})
})
