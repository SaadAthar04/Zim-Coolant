'use client'

import { useState } from 'react'

/**
 * The scrolling announcement strip from the client's reference design.
 *
 * The three messages are repeated several times to form one half of the track,
 * and that half is duplicated. Sliding the track by exactly 50% therefore lands
 * the second half where the first began, so the loop never shows a seam — and
 * because the messages repeat across the whole width, the spacing between them
 * stays even instead of leaving a long blank after the last one.
 *
 * Spacing comes from a right margin on each message rather than a flex gap, so
 * the two halves measure exactly the same and the 50% slide is exact.
 *
 * It pauses on hover and on keyboard focus, and the button pauses it for good,
 * so nobody is forced to chase moving text in order to read it. Below 680px,
 * and whenever the reader asks for reduced motion, it stops animating and the
 * messages simply wrap.
 */

const MESSAGES = [
  'Free Shipping on Orders Above Rs. 2,000',
  'Advanced Formulas',
  'Serving Automotives Since 1988',
]

/** Enough repeats that one half is wider than any realistic viewport. */
const REPEATS = 4

export default function AnnouncementBar() {
  const [paused, setPaused] = useState(false)

  const half = (halfKey: string) => (
    <div className="announcement-group" key={halfKey}>
      {Array.from({ length: REPEATS }).flatMap((_, repeat) =>
        MESSAGES.map((message) => (
          <span key={`${halfKey}-${repeat}-${message}`}>{message}</span>
        ))
      )}
    </div>
  )

  return (
    <div
      className={`announcement ${paused ? 'is-paused' : ''}`}
      role="region"
      aria-label="Store announcements"
    >
      {/* Screen readers get the messages once, as plain static text. */}
      <span className="sr-only">{MESSAGES.join('. ')}.</span>

      <div className="announcement-window" aria-hidden="true">
        <div className="announcement-track">
          {half('a')}
          {half('b')}
        </div>
      </div>

      <button
        type="button"
        className="announcement-toggle"
        aria-pressed={paused}
        aria-label={paused ? 'Play announcements' : 'Pause announcements'}
        onClick={() => setPaused((p) => !p)}
      >
        {paused ? '▶' : 'Ⅱ'}
      </button>
    </div>
  )
}
