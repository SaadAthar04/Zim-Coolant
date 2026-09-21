'use client'

import { useState } from 'react'

/**
 * The scrolling announcement strip from the client's reference design.
 *
 * The messages are duplicated and the track slides by exactly half its width,
 * so the second copy arrives where the first began and the loop is seamless.
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

export default function AnnouncementBar() {
  const [paused, setPaused] = useState(false)

  const group = (
    <div className="announcement-group">
      {MESSAGES.map((message) => (
        <span key={message}>{message}</span>
      ))}
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
          {group}
          {group}
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
