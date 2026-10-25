import { CONFIG_KEYS } from '~/lib/config-keys'
import { readConfig, writeConfig } from '~/lib/config-store'

/** Set once the check below has run, so it never touches the language again. */
export const LANG_AUTO_MIGRATED_KEY = 'tyto.langAutoMigrated'

/**
 * Tyto 0.1.x stored English as the transcription language without the user ever choosing it.
 * Since auto-detection became the default, such an install switches to it once. An English
 * picked from the list (it is then in the recent languages) is kept. Runs at startup after the
 * upstream migrations; its own flag keeps it out of upstream's version numbering.
 */
export function migrateLangToAuto() {
	if (readConfig(LANG_AUTO_MIGRATED_KEY, false)) return
	const options = readConfig<{ lang?: string } | null>(CONFIG_KEYS.modelOptions, null)
	const recent = readConfig<{ code: string }[]>(CONFIG_KEYS.recentLanguages, [])
	if (options?.lang === 'en' && !recent.some((entry) => entry.code === 'en')) {
		writeConfig(CONFIG_KEYS.modelOptions, { ...options, lang: 'auto' })
	}
	writeConfig(LANG_AUTO_MIGRATED_KEY, true)
}
