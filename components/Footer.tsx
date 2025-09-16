import Link from 'next/link'
import Image from 'next/image'
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-primary-800 to-primary-900 text-white">
      <div className="container-custom pt-8 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {/* Company Info - Left */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3 ml-6">
              <Image
                src="/logo.png"
                alt="Zim Coolant Logo"
                width={300}
                height={300}
                sizes="(max-width: 768px) 120px, 150px"
                className="w-[120px] h-[120px] md:w-[150px] md:h-[150px] object-contain"
              />
            </div>
            <p className="text-white text-sm leading-relaxed -mt-2">
              Premium quality engine oils and coolants for optimal vehicle performance.
              Professional-grade products for automotive excellence.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-white hover:text-primary-400 transition-colors hover:scale-110 transform duration-200">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-white hover:text-primary-400 transition-colors hover:scale-110 transform duration-200">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-white hover:text-primary-400 transition-colors hover:scale-110 transform duration-200">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-white hover:text-primary-400 transition-colors hover:scale-110 transform duration-200">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links - Center */}
          <div className="space-y-3 flex flex-col items-center justify-center">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-center">
              <li>
                <Link href="/" className="text-white hover:text-primary-400 transition-colors text-sm hover:scale-105 transform duration-200">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-white hover:text-primary-400 transition-colors text-sm hover:scale-105 transform duration-200">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-white hover:text-primary-400 transition-colors text-sm hover:scale-105 transform duration-200">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-white hover:text-primary-400 transition-colors text-sm hover:scale-105 transform duration-200">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info - Right */}
          <div className="space-y-3 flex flex-col justify-center items-center md:items-end md:-mt-6">
            <h3 className="text-lg font-semibold">Contact Info</h3>
            <div className="space-y-3 text-center md:text-right">
              <div className="flex items-center space-x-3 md:justify-end">
                <MapPin className="w-5 h-5 text-primary-400" />
                <span className="text-white text-sm">Faisalabad, Pakistan</span>
              </div>
              <div className="flex items-center space-x-3 md:justify-end">
                <Phone className="w-5 h-5 text-primary-400" />
                <span className="text-white text-sm">+92 326-8871985</span>
              </div>
              <div className="flex items-center space-x-3 md:justify-end">
                <Mail className="w-5 h-5 text-primary-400" />
                <span className="text-white text-sm">info@zimcoolant.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-4">
          <div className="h-[2px] bg-gradient-to-r from-gray-700 via-gray-800 to-black rounded-full opacity-90"></div>
          <div className="pt-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-white text-sm">
              © 2025 Zim. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
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
