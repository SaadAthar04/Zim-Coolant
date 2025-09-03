import Link from 'next/link'
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container-custom section-padding">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 lg:gap-24">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-secondary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">Z</span>
              </div>
              <span className="text-lg font-bold">Zim Coolant</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Premium quality engine oils and coolants for optimal vehicle performance. 
              Professional-grade products for automotive excellence.
            </p>
            <div className="flex space-x-4">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4 flex flex-col items-center justify-center">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-center">
              {[
                { name: 'Home', href: '/' },
                { name: 'About Us', href: '/about' },
                { name: 'Products', href: '/products' },
                { name: 'Contact', href: '/contact' }
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-primary-400 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4 flex flex-col items-center md:items-end">
            <h3 className="text-lg font-semibold">Contact Info</h3>
            <div className="space-y-3 text-center md:text-right">
              <div className="flex items-center space-x-3 md:justify-end">
                <MapPin className="w-5 h-5 text-primary-400" />
                <span className="text-gray-300 text-sm">123 Business Ave, Harare, Zimbabwe</span>
              </div>
              <div className="flex items-center space-x-3 md:justify-end">
                <Phone className="w-5 h-5 text-primary-400" />
                <span className="text-gray-300 text-sm">+263 123 456 789</span>
              </div>
              <div className="flex items-center space-x-3 md:justify-end">
                <Mail className="w-5 h-5 text-primary-400" />
                <span className="text-gray-300 text-sm">info@zimcoolant.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © 2024 Zim Coolant. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <Link href="/privacy" className="text-gray-400 hover:text-primary-400 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-primary-400 transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
