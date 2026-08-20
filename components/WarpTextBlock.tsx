'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import WarpText, { type Props as WarpTextProps } from './WarpText';

export interface WarpTextBlockProps extends Omit<WarpTextProps, 'text' | 'style'> {
  /** The headline as it reads on a single line. */
  text: string;
  /**
   * Swapped in while `stackQuery` matches. WarpText rasterizes to a canvas, so
   * a line break has to be a real `\n` in the string — CSS can't wrap it.
   */
  stackedText?: string;
  /** Media query that decides which of the two strings is used. */
  stackQuery?: string;
  /**
   * Height of the box WarpText fills. The glyphs are fit into ~78% of the
   * container, so this is what actually sets the type size — give it less and
   * the fit pass shrinks the text instead of cropping it.
   */
  height?: string;
  stackedHeight?: string;
  /** Classes for the sizing wrapper, not the canvas. */
  className?: string;
  style?: CSSProperties;
}

/**
 * Sizing wrapper around WarpText: owns the box, and swaps the headline for its
 * pre-broken variant on narrow screens.
 */
export default function WarpTextBlock({
  text,
  stackedText,
  stackQuery = '(max-width: 1023px)',
  height = 'clamp(1rem, 13vh, 9rem)',
  stackedHeight = 'clamp(3rem, 13.7vw, 16.7rem)',
  className = 'flex w-full max-w-6xl',
  style,
  ...warpProps
}: WarpTextBlockProps) {
  // Starts false so SSR and the first client render agree.
  const [stacked, setStacked] = useState(false);

  useEffect(() => {
    if (!stackedText) return;

    const query = window.matchMedia(stackQuery);
    const sync = () => setStacked(query.matches);

    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, [stackQuery, stackedText]);

  const isStacked = stacked && Boolean(stackedText);

  return (
    <div className={className} style={{ height: isStacked ? stackedHeight : height, ...style }}>
      <WarpText
        {...warpProps}
        text={isStacked ? (stackedText as string) : text}
        style={{ minHeight: 0, height: '100%' }}
      />
    </div>
  );
}
