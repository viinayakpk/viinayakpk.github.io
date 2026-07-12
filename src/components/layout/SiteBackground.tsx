/**
 * Fixed, decorative, pointer-events-none page background. Three layers, back to front:
 *   1. Aurora — slow-drifting blurred warm blobs (ember / peach) with faint cool accents
 *      that echo the agent-graph node colors, so the page reads as one system.
 *   2. Dot grid — a technical texture, masked to fade out toward the middle/bottom.
 *   3. Grain — an SVG feTurbulence noise overlay for a premium, tactile finish.
 * All motion collapses under prefers-reduced-motion (handled in index.css).
 */
export default function SiteBackground() {
  return (
    <div className="site-bg" aria-hidden="true">
      <div className="site-bg__aurora">
        <span className="site-bg__blob site-bg__blob--1" />
        <span className="site-bg__blob site-bg__blob--2" />
        <span className="site-bg__blob site-bg__blob--3" />
        <span className="site-bg__blob site-bg__blob--4" />
      </div>
      <div className="site-bg__grid" />
      <div className="site-bg__grain" />
    </div>
  );
}
