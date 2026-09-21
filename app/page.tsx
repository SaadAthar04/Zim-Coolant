'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useMemo } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { productsApi, Product } from '@/lib/api-client'
import { formatPrice } from '@/lib/store-config'

/**
 * Home page, following the client's reference design: banner, then the range
 * groups under their own headings.
 *
 * One card is one buyable variant rather than one product record, so a coolant
 * sold in red and green appears twice. Each card opens the product page with
 * that colour already selected, which is how the reference behaves and saves
 * the customer a step.
 */
interface VariantCard {
  key: string
  href: string
  image: string
  alt: string
  category: string
  colour: '' | 'green' | 'red'
  title: string
  price: number
}

/** Group order and headings, from the reference design. */
const RANGE_GROUPS = [
  { key: 'zim', ranges: ['zim'], heading: 'ZIM Anti-Rust Coolant', style: 'range' as const },
  { key: 'zimx', ranges: ['zimx'], heading: 'ZIMX Anti-Freeze & Anti-Boil', style: 'range' as const },
  { key: 'fluids', ranges: ['gear', 'atf'], heading: 'Gear & Transmission Care.', style: 'feature' as const },
]

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    productsApi.getAll().then(({ data }) => {
      if (!active) return
      setProducts(data || [])
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [])

  const groups = useMemo(() => {
    const cardsFor = (product: Product): VariantCard[] => {
      const base = {
        category: product.category.toUpperCase(),
        title: product.name,
        price: product.price,
      }

      if (product.red_image_url) {
        return [
          {
            ...base,
            key: `${product.id}-green`,
            href: `/products/${product.slug}?colour=green`,
            image: product.image_url,
            alt: `${product.name}, green`,
            colour: 'green' as const,
          },
          {
            ...base,
            key: `${product.id}-red`,
            href: `/products/${product.slug}?colour=red`,
            image: product.red_image_url,
            alt: `${product.name}, red`,
            colour: 'red' as const,
          },
        ]
      }

      return [
        {
          ...base,
          key: product.id,
          href: `/products/${product.slug}`,
          image: product.image_url,
          alt: product.name,
          colour: '' as const,
        },
      ]
    }

    return RANGE_GROUPS.map((group) => ({
      ...group,
      cards: products
        .filter((p) => group.ranges.includes(p.range_key))
        .sort((a, b) => a.sort_order - b.sort_order)
        .flatMap(cardsFor),
    })).filter((group) => group.cards.length > 0)
  }, [products])

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />

      {/* Banner */}
      <section className="w-full bg-[#080a09]" aria-label="ZIM Automotive Care">
        <h1 className="sr-only">ZIM. Performance You Can Trust.</h1>
        <Image
          src="/products/banner-main.webp"
          alt="ZIM Automotive Care: coolants, automatic transmission fluid and gear oil. Performance you can trust."
          width={1784}
          height={882}
          priority
          quality={88}
          sizes="100vw"
          className="block w-full h-auto"
        />
      </section>

      {/* Products, grouped by range */}
      <section
        id="products"
        className="mx-auto max-w-[1480px] px-[6%] py-10 sm:py-14 lg:px-[5%] lg:py-[72px] scroll-mt-6"
      >
        <div className="mb-7 lg:mb-[34px]">
          <h2 className="text-[30px] lg:text-[38px] font-normal leading-[1.15] tracking-[-1px] lg:tracking-[-1.4px] text-[#171c1e]">
            Meet Your Next Coolant.
          </h2>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading products...</p>
        ) : groups.length === 0 ? (
          <p className="text-gray-500">No products found.</p>
        ) : (
          groups.map((group, index) => (
            <section
              key={group.key}
              className={index > 0 ? 'mt-[38px] lg:mt-[55px]' : ''}
              aria-labelledby={`${group.key}-range`}
            >
              {group.style === 'range' ? (
                <h3
                  id={`${group.key}-range`}
                  className="text-[20px] lg:text-[22px] font-medium tracking-[-0.5px] pb-4 border-b border-[#e4e6e6] mb-5 lg:mb-6 text-[#171c1e]"
                >
                  {group.heading}
                </h3>
              ) : (
                <h2
                  id={`${group.key}-range`}
                  className="text-[28px] lg:text-[34px] font-normal leading-[1.2] tracking-[-1px] mb-6 lg:mb-7 text-[#171c1e]"
                >
                  {group.heading}
                </h2>
              )}

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-[30px] gap-x-[14px] lg:gap-[22px]">
                {group.cards.map((card) => (
                  <Link key={card.key} href={card.href} className="group block min-w-0">
                    {/* 10:11 frame, no padding, cropped at the sides only */}
                    <div className="relative overflow-hidden bg-[#f1f2f2] aspect-[10/11]">
                      <Image
                        src={card.image}
                        alt={card.alt}
                        fill
                        sizes="(max-width: 1024px) 50vw, 25vw"
                        quality={85}
                        className="object-cover object-center transition-transform duration-[250ms] lg:group-hover:scale-[1.035]"
                      />
                      <span
                        aria-hidden="true"
                        className="absolute bottom-2 right-2 lg:bottom-3 lg:right-3 grid place-items-center w-[27px] h-[27px] lg:w-[34px] lg:h-[34px] rounded-full bg-white text-[17px] lg:text-[20px] leading-none text-[#171c1e]"
                      >
                        ↗
                      </span>
                    </div>

                    <div className="flex flex-wrap justify-between items-center mt-3 lg:mt-[19px] gap-x-[7px] gap-y-1 text-[9px] lg:text-[10px] tracking-[0.5px] lg:tracking-[1px] text-[#737b77]">
                      <span>{card.category}</span>
                      {card.colour && (
                        <span className="flex items-center gap-1.5 text-[11px] lg:text-[12px] tracking-normal capitalize">
                          <i
                            className="block w-[9px] h-[9px] rounded-full"
                            style={{ backgroundColor: card.colour === 'green' ? '#22c55e' : '#ef4444' }}
                          />
                          {card.colour}
                        </span>
                      )}
                    </div>

                    <h3 className="text-[15px] lg:text-[17px] font-medium leading-[1.5] tracking-[-0.3px] mt-2 mb-3 lg:mt-[9px] lg:mb-[15px] text-[#171c1e]">
                      {card.title}
                    </h3>

                    <div className="border-t border-[#e4e6e6] pt-[13px] flex flex-wrap items-center justify-between gap-x-[14px] gap-y-2.5">
                      <span className="text-[1.125rem] lg:text-[1.25rem] font-medium leading-[1.3] tracking-[-0.2px] text-[#171c1e] tabular-nums whitespace-nowrap">
                        {formatPrice(card.price)}
                      </span>
                      <span className="text-[0.8125rem] lg:text-[0.875rem] font-medium text-[#171c1e]">
                        View Product ↗
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))
        )}
      </section>

      {/* CTA */}
      <section className="relative section-padding bg-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/cta-bg.jpg"
            alt="Zim Coolant car driving performance background"
            fill
            className="object-cover object-center brightness-[0.45] blur-[1px]"
          />
        </div>

        <div className="relative z-10 container-custom text-center text-white">
          <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6 px-4">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-3xl xl:text-4xl font-bold text-white">
              Performance You Can Feel, Protection You Can Trust.
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-100">
              Join thousands of satisfied customers who trust Zim for their vehicle needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link
                href="/products"
                className="bg-white text-brand-dark font-semibold text-sm sm:text-base py-3 px-6 rounded-md shadow-md hover:bg-gray-100 transition"
              >
                Shop Now
              </Link>
              <Link
                href="/contact"
                className="border border-white text-white font-semibold text-sm sm:text-base py-3 px-6 rounded-md hover:bg-white hover:text-brand-dark transition"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
