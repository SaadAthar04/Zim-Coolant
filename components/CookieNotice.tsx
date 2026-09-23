'use client'

// Cookie notice, and the switch that actually controls Google Analytics.
//
// The notice is not decorative: Analytics is only loaded once a visitor has
// accepted, and declining keeps it off for good. A banner that says "we use
// cookies" while the tracker has already run would be the thing the Privacy
// Policy promises we do not do.
//
// The choice lives in localStorage, so it is per-browser and never leaves the
// visitor's device. Until a choice is made, nothing is loaded.

import { useEffect, useState } from 'react'
import Script from 'next/script'
import Link from 'next/link'
import { X } from 'lucide-react'

const STORAGE_KEY = 'zim_cookie_consent'

const GA_MEASUREMENT_ID = 'G-C6HWTCS8SX'

type Consent = 'accepted' | 'declined' | null

/** Reading localStorage throws in some privacy modes, so never let it bubble. */
function readConsent(): Consent {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored === 'accepted' || stored === 'declined' ? stored : null
  } catch {
    return null
  }
}

function writeConsent(value: Exclude<Consent, null>) {
  try {
    window.localStorage.setItem(STORAGE_KEY, value)
  } catch {
    // A visitor who blocks storage simply gets asked again next visit.
  }
}

export default function CookieNotice() {
  // Undefined until the browser has been read: rendering the banner during
  // hydration would flash it at visitors who decided months ago.
  const [consent, setConsent] = useState<Consent | undefined>(undefined)

  useEffect(() => {
    setConsent(readConsent())
  }, [])

  const choose = (value: Exclude<Consent, null>) => {
    writeConsent(value)
    setConsent(value)
  }

  return (
    <>
      {/* Analytics loads only on an explicit yes. */}
      {consent === 'accepted' && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}');
            `}
          </Script>
        </>
      )}

      {consent === null && (
        <div
          role="dialog"
          aria-label="Cookie notice"
          className="fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-sm z-50 rounded-xl border border-gray-200 bg-white shadow-lg p-4"
        >
          <button
            onClick={() => choose('declined')}
            aria-label="Decline and close"
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>

          <p className="text-sm text-gray-700 leading-relaxed pr-5">
            We use cookies to keep your cart working, and — with your permission —
            Google Analytics to see how the site is used.{' '}
            <Link href="/privacy" className="text-primary-600 hover:text-primary-700 underline">
              Privacy Policy
            </Link>
          </p>

          <div className="flex gap-2 mt-3">
            <button
              onClick={() => choose('accepted')}
              className="flex-1 px-3 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg"
            >
              Accept
            </button>
            <button
              onClick={() => choose('declined')}
              className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg"
            >
              Decline
            </button>
          </div>
        </div>
      )}
    </>
  )
}
