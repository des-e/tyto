import { useEffect, useState } from 'react'
import { readTranscript } from '~/lib/transcripts-store'

/**
 * Length of a saved recording for the sidebar meta («10:02 · 48 мин»). The list itself is built from
 * folder names only, so the record is read lazily by the row that shows it: the list is virtualized,
 * which keeps it to the rows on screen, and each record is read once per session.
 */
const cache = new Map<string, Promise<number | null>>()

function load(path: string) {
	let pending = cache.get(path)
	if (!pending) {
		pending = readTranscript(path).then(
			(record) => {
				const last = record?.segments[record.segments.length - 1]
				// Segment times are in centiseconds.
				return last ? last.stop / 100 : null
			},
			() => null,
		)
		// An unreadable record (still being written, say) is tried again the next time its row mounts.
		void pending.then((value) => {
			if (value === null) cache.delete(path)
		})
		cache.set(path, pending)
	}
	return pending
}

export function useRecordDuration(path: string): number | null {
	const [seconds, setSeconds] = useState<number | null>(null)
	useEffect(() => {
		let alive = true
		setSeconds(null)
		void load(path).then((value) => {
			if (alive) setSeconds(value)
		})
		return () => {
			alive = false
		}
	}, [path])
	return seconds
}
