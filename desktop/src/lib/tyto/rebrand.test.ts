import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { getIssueUrl } from '../app'
import * as config from '../config'

const i18nDir = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../i18n/desktop')
const readMessages = (locale: string): Record<string, string> => JSON.parse(readFileSync(resolve(i18nDir, `${locale}.json`), 'utf-8'))

describe('tyto links', () => {
	it('points project URLs at des-e/tyto', () => {
		expect(config.aboutURL).toContain('des-e/tyto')
		expect(config.repoURL).toBe('https://github.com/des-e/tyto')
		expect(config.changelogURL()).toBe('https://github.com/des-e/tyto/releases')
		expect(config.changelogURL('0.1.0')).toBe('https://github.com/des-e/tyto/releases/tag/v0.1.0')
		expect(config.privacyPolicyURL).toBe('https://github.com/des-e/tyto/blob/main/PRIVACY.md')
	})

	it('drops upstream community links and keeps the upstream credit', () => {
		expect(config).not.toHaveProperty('discordURL')
		expect(config).not.toHaveProperty('supportVibeURL')
		expect(config.upstreamURL).toBe('https://github.com/thewh1teagle/vibe')
	})

	it('files issues in the Tyto repo', async () => {
		expect(await getIssueUrl('boom')).toMatch(/^https:\/\/github\.com\/des-e\/tyto\/issues\/new\?/)
	})
})

describe('tyto texts', () => {
	for (const locale of ['ru-RU', 'en-US']) {
		it(`${locale} never says Vibe except in the credit line`, () => {
			const messages = readMessages(locale)
			for (const [key, value] of Object.entries(messages)) {
				if (key !== 'basedOnVibe') expect(value, key).not.toMatch(/\bVibe\b/)
			}
			expect(messages.basedOnVibe).toMatch(/Vibe/)
		})
	}
})
