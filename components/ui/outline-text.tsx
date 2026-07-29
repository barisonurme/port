'use client';

import { useId } from 'react';

type Props = {
  children: string;
  /** Outline color. */
  color?: string;
  /** Outline thickness — keep it in `em` so it scales with the clamped type. */
  width?: string;
  className?: string;
  style?: React.CSSProperties;
};

/**
 * Outlined display type that works over *any* background.
 *
 * The obvious implementation — `-webkit-text-stroke` with a transparent fill —
 * looks broken on display sizes: the stroke traces every contour of the glyph,
 * and Syne (like most variable fonts) builds letters out of overlapping
 * components. Stroking exposes those interior seams, so a `T` shows the
 * crossbar outlined straight through the stem and an `H` shows its bar
 * crossing both stems. Filling the glyph with the page color hides the seams,
 * but only works where the background is a known solid — not over the
 * homepage's animated gradient.
 *
 * So the outline is masked instead: a dilated copy of the text (fill + stroke)
 * minus a plain copy of it leaves a ring that hugs the *outside* of the glyph
 * silhouette. No interior contours, and the counters stay genuinely
 * transparent, so whatever is behind shows through.
 */
export function OutlineText({
  children,
  color = 'rgba(255,255,255,0.42)',
  width = '0.02em',
  className,
  style,
}: Props) {
  // useId is stable across SSR/hydration; `:` is illegal in a url(#…) ref.
  const maskId = `outline-${useId().replace(/:/g, '')}`;

  return (
    <svg
      aria-hidden
      className={className}
      // No viewBox: 1 user unit = 1px, so the mask region can be plain numbers
      // while the text still inherits the element's CSS font-size/weight.
      width="100%"
      height="1.02em"
      style={{ display: 'block', overflow: 'visible', ...style }}
    >
      <mask id={maskId} maskUnits="userSpaceOnUse" x="-200" y="-400" width="6000" height="1200">
        {/* Dilated silhouette… (stroke-width goes through `style` so the `em`
            unit is resolved as CSS, which is portable across browsers) */}
        <text x="0" y="0.8em" fill="#fff" stroke="#fff" style={{ strokeWidth: width, paintOrder: 'stroke' }}>
          {children}
        </text>
        {/* …minus the glyph itself, which leaves only the outer ring. */}
        <text x="0" y="0.8em" fill="#000">
          {children}
        </text>
      </mask>
      <rect x="-200" y="-400" width="6000" height="1200" fill={color} mask={`url(#${maskId})`} />
    </svg>
  );
}
