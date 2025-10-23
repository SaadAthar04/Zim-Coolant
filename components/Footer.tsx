import Link from 'next/link'
import Image from 'next/image'
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-primary-800 to-primary-900 text-white">
      <div className="container-custom pt-6 sm:pt-8 pb-4 px-4 sm:px-6 md:px-8 lg:px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="space-y-3 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-center sm:justify-start space-x-3">
              <Image
                src="/logo.png"
                alt="Zim Coolant Logo"
                width={300}
                height={300}
                sizes="(max-width: 640px) 100px, (max-width: 768px) 120px, 150px"
                className="w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] md:w-[120px] md:h-[120px] lg:w-[150px] lg:h-[150px] object-contain"
              />
            </div>
            <p className="text-white text-xs sm:text-sm leading-relaxed text-center sm:text-left">
              Premium quality engine oils and coolants for optimal vehicle performance.
              Professional-grade products for automotive excellence.
            </p>
            <div className="flex justify-center sm:justify-start space-x-4">
              <a href="#" className="text-white hover:text-primary-400 transition-colors hover:scale-110 transform duration-200">
                <Facebook className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a href="#" className="text-white hover:text-primary-400 transition-colors hover:scale-110 transform duration-200">
                <Twitter className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a href="#" className="text-white hover:text-primary-400 transition-colors hover:scale-110 transform duration-200">
                <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a href="#" className="text-white hover:text-primary-400 transition-colors hover:scale-110 transform duration-200">
                <Linkedin className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3 flex flex-col items-center sm:items-start lg:items-center lg:mt-10">
            <h3 className="text-base sm:text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-center sm:text-left lg:text-center">
              <li>
                <Link href="/" className="text-white hover:text-primary-400 transition-colors text-xs sm:text-sm hover:scale-105 transform duration-200">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-white hover:text-primary-400 transition-colors text-xs sm:text-sm hover:scale-105 transform duration-200">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-white hover:text-primary-400 transition-colors text-xs sm:text-sm hover:scale-105 transform duration-200">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-white hover:text-primary-400 transition-colors text-xs sm:text-sm hover:scale-105 transform duration-200">
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
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary-400" />
                <span className="text-white text-xs sm:text-sm">Faisalabad, Pakistan</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start lg:justify-end space-x-3">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-primary-400" />
                <span className="text-white text-xs sm:text-sm">+92 326-8871985</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start lg:justify-end space-x-3">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-primary-400" />
                <span className="text-white text-xs sm:text-sm">info@zimcoolant.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-4 sm:mt-6">
          <div className="h-[1px] sm:h-[2px] bg-gradient-to-r from-gray-700 via-gray-800 to-black rounded-full opacity-90"></div>
          <div className="pt-4 sm:pt-6 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
            <p className="text-white text-xs sm:text-sm text-center sm:text-left">
              © 2025 Zim. All rights reserved.
            </p>
            <div className="flex space-x-4 sm:space-x-6 text-xs sm:text-sm">
              <Link href="/privacy" className="text-white hover:text-primary-400 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-white hover:text-primary-400 transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
