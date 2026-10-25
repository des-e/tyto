/** Three tones tell speakers apart without colour and survive printing; after three they repeat with a digit. */
const TONES = ['filled', 'outline', 'grey'] as const

export type SpeakerTone = (typeof TONES)[number]

export function speakerTone(speaker: number): { tone: SpeakerTone; cycle: number } {
	const index = Math.max(0, speaker)
	return { tone: TONES[index % TONES.length], cycle: Math.floor(index / TONES.length) + 1 }
}

/** First letter (or digit) of the name, upper-cased: «Анна» → «А», «Говорящий 2» → «Г». */
function initial(name: string): string {
	const match = name.trim().match(/[\p{L}\p{N}]/u)
	return match ? match[0].toLocaleUpperCase() : '?'
}

/**
 * The 18 px square in front of a speaker's name (theme.css `.tyto-speaker-mark`). Decorative: the
 * name next to it is what assistive tech reads.
 */
export function SpeakerMark({ speaker, name }: { speaker: number; name: string }) {
	const { tone, cycle } = speakerTone(speaker)
	return (
		<span aria-hidden="true" data-tone={tone} className="tyto-speaker-mark">
			{initial(name)}
			{cycle > 1 && cycle}
		</span>
	)
}
