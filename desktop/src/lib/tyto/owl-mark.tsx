import { useId, type SVGProps } from 'react'

/**
 * The Tyto owl (concept D, design/tyto/icon.svg) as an inline mark. The body is `currentColor` and
 * the eyes and beak are cut out of it, so whatever is behind shows through: dark owl in the light
 * theme, light owl in the dark theme, no per-theme artwork.
 */
export function OwlMark({ title, ...props }: SVGProps<SVGSVGElement> & { title?: string }) {
	const mask = `tyto-owl-${useId().replace(/:/g, '')}`
	return (
		<svg
			viewBox="262 200 500 680"
			fill="currentColor"
			role={title ? 'img' : undefined}
			aria-hidden={title ? undefined : true}
			aria-label={title}
			data-testid="owl-mark"
			{...props}>
			<defs>
				<mask id={mask} maskUnits="userSpaceOnUse" x="262" y="200" width="500" height="680">
					<rect x="262" y="200" width="500" height="680" fill="#fff" />
					<circle cx="414" cy="448" r="92" fill="#000" />
					<circle cx="610" cy="448" r="92" fill="#000" />
					<path d="M480 556 L544 556 L512 612 Z" fill="#000" />
				</mask>
			</defs>
			<path
				mask={`url(#${mask})`}
				d="M276 214 L396 296 Q512 336 628 296 L748 214 L748 620 C748 750 640 830 512 830 C384 830 276 750 276 620 Z"
			/>
			<circle cx="414" cy="448" r="44" />
			<circle cx="610" cy="448" r="44" />
			<rect x="412" y="812" width="56" height="52" rx="18" />
			<rect x="556" y="812" width="56" height="52" rx="18" />
		</svg>
	)
}
