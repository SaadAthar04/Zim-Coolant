import Link from 'next/link'
import Image from 'next/image'
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container-custom section-padding">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 lg:gap-24">
          {/* Company Info - Left */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-13 h-12 rounded-xl overflow-hidden shadow-glow ring-2 ring-brand-bright/30 hover:ring-brand-bright/50 transition-all duration-300 hover:scale-105 bg-gradient-to-br from-brand-bright to-brand-dark p-1">
                <Image
                  src="/logo.png"
                  alt="Zim Coolant Logo"
                  width={48}
                  height={48}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xl font-bold navbar-brand">Zim Coolant</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Premium quality engine oils and coolants for optimal vehicle performance. 
              Professional-grade products for automotive excellence.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-brand-bright transition-colors hover:scale-110 transform duration-200">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-brand-bright transition-colors hover:scale-110 transform duration-200">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-brand-bright transition-colors hover:scale-110 transform duration-200">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-brand-bright transition-colors hover:scale-110 transform duration-200">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links - Center */}
          <div className="space-y-4 flex flex-col items-center justify-center">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-center">
              <li>
                <Link href="/" className="text-gray-300 hover:text-brand-bright transition-colors text-sm hover:scale-105 transform duration-200">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-brand-bright transition-colors text-sm hover:scale-105 transform duration-200">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-gray-300 hover:text-brand-bright transition-colors text-sm hover:scale-105 transform duration-200">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-brand-bright transition-colors text-sm hover:scale-105 transform duration-200">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info - Right */}
          <div className="space-y-4 flex flex-col items-center md:items-end">
            <h3 className="text-lg font-semibold">Contact Info</h3>
            <div className="space-y-3 text-center md:text-right">
              <div className="flex items-center space-x-3 md:justify-end">
                <MapPin className="w-5 h-5 text-brand-bright" />
                <span className="text-gray-300 text-sm">Faisalabad, Pakistan</span>
              </div>
              <div className="flex items-center space-x-3 md:justify-end">
                <Phone className="w-5 h-5 text-brand-bright" />
                <span className="text-gray-300 text-sm">+92 326-8871985</span>
              </div>
              <div className="flex items-center space-x-3 md:justify-end">
                <Mail className="w-5 h-5 text-brand-bright" />
                <span className="text-gray-300 text-sm">info@zimcoolant.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © 2025 Zim Coolant. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
                             <Link href="/privacy" className="text-gray-400 hover:text-brand-bright transition-colors">
                 Privacy Policy
               </Link>
               <Link href="/terms" className="text-gray-400 hover:text-brand-bright transition-colors">
                 Terms of Service
               </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
