// Shared shell for the legal pages (/privacy, /terms).
//
// Both are plain prose under the same hero, so the layout lives here once and
// each page supplies only its title, intro, and sections.

import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export type LegalSection = {
  heading: string
  /** Each entry is one paragraph. */
  body?: string[]
  /** Rendered as a bulleted list under the paragraphs. */
  bullets?: string[]
}

type LegalPageProps = {
  /** Shown in the hero; the second half is greyed, matching the other heroes. */
  title: string
  titleAccent: string
  intro: string
  /** Human-readable date, e.g. '22 September 2026'. */
  lastUpdated: string
  sections: LegalSection[]
}

export default function LegalPage({
  title,
  titleAccent,
  intro,
  lastUpdated,
  sections,
}: LegalPageProps) {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative w-full text-center text-white pt-10 sm:pt-12 md:pt-14 pb-20 sm:pb-24 md:pb-28 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/about-bg.jpg"
            alt=""
            fill
            priority
            quality={90}
            className="object-cover object-center scale-105 brightness-[0.5] blur-[4px]"
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        <div className="relative z-10 container-custom">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6">
              {title} <span className="text-white/70">{titleAccent}</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-100 leading-relaxed px-2 sm:px-0">
              {intro}
            </p>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs sm:text-sm text-gray-500 mb-8 sm:mb-10">
              Last updated: {lastUpdated}
            </p>

            <div className="space-y-8 sm:space-y-10">
              {sections.map((section) => (
                <div key={section.heading} className="space-y-3 sm:space-y-4">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                    {section.heading}
                  </h2>

                  {section.body?.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="text-sm sm:text-base text-gray-600 leading-relaxed"
                    >
                      {paragraph}
                    </p>
                  ))}

                  {section.bullets && (
                    <ul className="list-disc pl-5 space-y-2">
                      {section.bullets.map((bullet) => (
                        <li
                          key={bullet}
                          className="text-sm sm:text-base text-gray-600 leading-relaxed"
                        >
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
