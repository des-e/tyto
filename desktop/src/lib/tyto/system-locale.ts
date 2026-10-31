import * as osExt from '@tauri-apps/plugin-os'
import { baseLocale, isLocale, locales, localStorageKey, setLocale } from '~/paraglide/runtime.js'

function normalize(tag: string) {
	return tag.trim().replace('_', '-').toLowerCase()
}

/**
 * Maps system locale tags to a supported one: the first tag that matches exactly (`ru-RU`), else by
 * language part (`ru` or `de-AT` -> the first supported `ru-*` / `de-*`). Nothing matches: `fallback`.
 */
export function pickSupportedLocale(candidates: readonly string[], supported: readonly string[] = locales, fallback: string = baseLocale) {
	for (const tag of candidates) {
		if (!tag) continue
		const wanted = normalize(tag)
		const exact = supported.find((code) => normalize(code) === wanted)
		if (exact) return exact
		const language = wanted.split('-')[0]
		const byLanguage = supported.find((code) => normalize(code).split('-')[0] === language)
		if (byLanguage) return byLanguage
	}
	return fallback
}

async function systemLocaleTags(): Promise<string[]> {
	const tags: string[] = []
	try {
		// The OS locale, not navigator.language: on macOS the webview reports the app bundle's
		// localizations and can say en-US on a Russian system.
		const os = await osExt.locale()
		if (os) tags.push(os)
	} catch {
		// Browser/test mode or a missing plugin: navigator below.
	}
	if (typeof navigator !== 'undefined') tags.push(...(navigator.languages ?? [navigator.language]))
	return tags
}

/**
 * First run: no language saved yet, so take it from the system and save it like an explicit choice
 * (a later pick in Settings simply overwrites it, and a saved value is never re-detected).
 * Call after the upstream migrations, so a language migrated from old Vibe preferences wins.
 */
export async function applySystemLocale() {
	try {
		const saved = localStorage.getItem(localStorageKey)
		if (saved !== null && isLocale(saved)) return
		const locale = pickSupportedLocale(await systemLocaleTags())
		setLocale(locale as typeof baseLocale, { reload: false })
	} catch (error) {
		console.error('tyto: system language detection skipped', error)
	}
}
