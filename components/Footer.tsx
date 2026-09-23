import Link from 'next/link'
import Image from 'next/image'
import { Mail, Phone, MapPin, Facebook, Instagram } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#f4f5f5] border-t border-[#e4e6e6] text-[#171c1e]">
      <div className="container-custom pt-3 sm:pt-4 pb-4 px-4 sm:px-6 md:px-8 lg:px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="flex flex-col sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-center sm:justify-start space-x-3 -mt-6">
              <Image
                src="/logo.png"
                alt="Zim Coolant Logo"
                width={400}
                height={400}
                sizes="(max-width: 640px) 150px, (max-width: 768px) 190px, 250px"
                className="invert w-[100px] h-[100px] sm:w-[125px] sm:h-[125px] md:w-[150px] md:h-[150px] lg:w-[190px] lg:h-[190px] xl:w-[220px] xl:h-[220px] object-contain"
              />
            </div>
            <p className="text-[#72787a] text-xs sm:text-sm leading-relaxed text-center sm:text-left -mt-6">
              Premium Automotive Products, Ensuring optimal performance, longevity and protection, for all kinds of vehicles.
            </p>
            <div className="flex justify-center sm:justify-start space-x-4 mt-2">
              {/* Canonical page URLs, not the share links the client sent:
                  those carry a per-share tracking token that would follow every
                  visitor who clicked through from the site. */}
              <a
                href="https://www.facebook.com/ZimPakistan"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Zim Chemicals on Facebook"
                className="text-[#171c1e] hover:opacity-60 transition-opacity hover:scale-110 transform duration-200"
              >
                <Facebook className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a
                href="https://www.instagram.com/zimpakistan"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Zim Chemicals on Instagram"
                className="text-[#171c1e] hover:opacity-60 transition-opacity hover:scale-110 transform duration-200"
              >
                <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3 flex flex-col items-center sm:items-start lg:items-center lg:mt-10">
            <h3 className="text-base sm:text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-center sm:text-left lg:text-center">
              <li>
                <Link href="/" className="text-[#171c1e] hover:opacity-60 transition-opacity text-xs sm:text-sm hover:scale-105 transform duration-200">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-[#171c1e] hover:opacity-60 transition-opacity text-xs sm:text-sm hover:scale-105 transform duration-200">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-[#171c1e] hover:opacity-60 transition-opacity text-xs sm:text-sm hover:scale-105 transform duration-200">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-[#171c1e] hover:opacity-60 transition-opacity text-xs sm:text-sm hover:scale-105 transform duration-200">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-3 flex flex-col items-center sm:items-start lg:items-end lg:mt-10">
            <h3 className="text-base sm:text-lg font-semibold">Contact Info</h3>
            <div className="space-y-3 text-center sm:text-left lg:text-right">
              <div className="flex items-center justify-center sm:justify-start lg:justify-end space-x-3">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#72787a]" />
                <span className="text-[#72787a] text-xs sm:text-sm">Faisalabad, Pakistan</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start lg:justify-end space-x-3">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-[#72787a]" />
                <span className="text-[#72787a] text-xs sm:text-sm">+92 333-1632138</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start lg:justify-end space-x-3">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-[#72787a]" />
                <span className="text-[#72787a] text-xs sm:text-sm">contact@zimchemicals.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-4 sm:mt-6">
          <div className="h-px bg-[#e4e6e6]"></div>
          <div className="pt-4 sm:pt-6 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
            <p className="text-[#72787a] text-xs sm:text-sm text-center sm:text-left">
              © 2026 Zim Chemicals. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-x-4 sm:gap-x-6 gap-y-2 text-xs sm:text-sm">
              <Link href="/privacy" className="text-[#72787a] hover:text-[#171c1e] transition-colors">
                Privacy Policy
              </Link>
              <Link href="/shipping" className="text-[#72787a] hover:text-[#171c1e] transition-colors">
                Shipping Policy
              </Link>
              <Link href="/terms" className="text-[#72787a] hover:text-[#171c1e] transition-colors">
                Terms &amp; Conditions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
