/**
 * Shared visual textures for the paper world.
 */

/**
 * Static film grain — a painted feTurbulence texture (URL-encoded SVG), no
 * animation, so blur + grain stages cost one painted layer, not a live effect.
 * Used by the loading stage and the assistant window's backdrop.
 */
export const GRAIN =
	"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";
