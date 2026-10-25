import { m } from '~/paraglide/messages.js'

/** «48 мин», «1 ч 12 мин», «35 с»: length of a recording (export dialog header, sidebar meta). */
export function durationLabel(totalSeconds: number) {
	const seconds = Math.max(0, Math.round(totalSeconds))
	if (seconds < 60) return m.durationSeconds({ seconds: String(seconds) })
	const totalMinutes = Math.round(seconds / 60)
	const hours = Math.floor(totalMinutes / 60)
	const minutes = totalMinutes % 60
	if (hours === 0) return m.durationMinutes({ minutes: String(minutes) })
	if (minutes === 0) return m.durationHours({ hours: String(hours) })
	return m.durationHoursMinutes({ hours: String(hours), minutes: String(minutes) })
}
