'use client'

// Cookie notice, and the switch that actually controls Google Analytics and
// the Meta Pixel.
//
// The notice is not decorative: neither tracker is loaded until a visitor has
// accepted, and declining keeps them off for good. A banner that says "we use
// cookies" while the tracker has already run would be the thing the Privacy
// Policy promises we do not do.
//
// The choice lives in localStorage, so it is per-browser and never leaves the
// visitor's device. Until a choice is made, nothing is loaded.

import { useEffect, useState } from 'react'
import Script from 'next/script'
import Link from 'next/link'
import { X } from 'lucide-react'

// Versioned because the question changed: visitors who accepted before the
// Meta Pixel was added said yes to Analytics only, so they are asked again.
const STORAGE_KEY = 'zim_cookie_consent_v2'

const GA_MEASUREMENT_ID = 'G-C6HWTCS8SX'

// Supplied by the client for Meta ads. Meta's snippet also carries a <noscript>
// image beacon; it is left out because without JavaScript the notice cannot be
// answered, so that beacon would fire without consent.
const META_PIXEL_ID = '25261326400168756'

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

/** True only once the visitor has accepted Analytics and the Meta Pixel. */
export function hasTrackingConsent(): boolean {
  return readConsent() === 'accepted'
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
      {/* Analytics and the Meta Pixel load only on an explicit yes. The pixel
          follows client-side navigation on its own, so PageView is sent once
          here rather than on every route change. */}
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
          <Script id="meta-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${META_PIXEL_ID}');
              fbq('track', 'PageView');
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
            Google Analytics to see how the site is used and the Meta Pixel to
            measure our Facebook and Instagram ads.{' '}
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
