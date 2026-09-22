'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const contactInfo = [
  { icon: MapPin, title: 'Visit Us', details: 'Faisalabad, Pakistan', description: 'Our Factory and Office' },
  { icon: Phone, title: 'Call Us', details: '+92 333-1632138', description: 'Mon-Sun: 9AM-8PM' },
  { icon: Mail, title: 'Email Us', details: 'contact@zimchemicals.com', description: 'We respond within 24 hours' },
]

const faqs = [
  {
    question: "What types of products do you offer?",
    answer: "We specialize in high-quality coolants, automatic transmission fluids (ATF), and gear oils designed to protect your vehicle’s systems, improve performance, and extend component life."
  },
  {
    question: "How do I know which fluid is right for my vehicle?",
    answer: "Every vehicle has specific requirements. You can check your owner’s manual or contact our support team — we’ll help you choose the right coolant, ATF, or gear oil based on your vehicle’s make and model."
  },
  {
    question: "Are your products suitable for all vehicle types?",
    answer: "Yes. Our fluids are formulated for both passenger and commercial vehicles, meeting international quality standards to ensure reliable performance across various driving conditions."
  },
  {
    question: "Do you offer bulk products?",
    answer: "Yes, we offer bulk quantities of coolants, ATF, and gear oils for workshops, retailers, and fleet operators. Get in touch with us through our website to discuss your requirements and pricing options."
  }
]

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', subject: '', message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    // Clear the error as soon as the customer starts fixing the field.
    if (fieldErrors[e.target.name]) {
      setFieldErrors((errors) => {
        const next = { ...errors }
        delete next[e.target.name]
        return next
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFieldErrors({})

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const payload = await response.json()

      if (!response.ok) {
        setFieldErrors(payload.fieldErrors || {})
        toast.error(payload.error || 'We could not send your message. Please try again.')
        return
      }

      setIsSubmitted(true)
      toast.success(payload.message || 'Thank you! Your message has been sent.')
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
      setTimeout(() => setIsSubmitted(false), 5000)
    } catch {
      toast.error(
        'We could not reach the server. Please call us on +92 333-1632138.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative w-full text-center text-white pt-10 sm:pt-12 md:pt-14 pb-20 sm:pb-24 md:pb-28 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/contact-bg.jpg"
            alt="Contact Zim Background"
            fill
            priority
            quality={90}
            className="object-cover object-center scale-105 brightness-[0.6] blur-[4px]"
          />
          <div className="absolute inset-0 bg-black/30"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 container-custom">
          <div
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-6">
              Get in <span className="text-white/70">Touch</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-100 leading-relaxed">
              Have questions about our products or need technical support? 
              We're here to help you find the perfect solution for your vehicle.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info & Form */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div
              className="space-y-8"
            >
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-6">Contact Information</h2>
                <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed mb-8">
                  Reach out to us through any of these channels. We're always happy to help!
                </p>
              </div>

              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <div
                    key={info.title}
                    className="flex items-start space-x-4"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <info.icon className="w-6 h-6 text-primary-700" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{info.title}</h3>
                      <p className="text-gray-600 font-medium">{info.details}</p>
                      <p className="text-gray-500 text-sm">{info.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Map */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Our Location</h3>
                <div className="w-full h-64 rounded-lg overflow-hidden shadow-lg">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3454.1234567890123!2d73.12345678901234!3d31.12345678901234!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39191a1234567890%3A0x1234567890abcdef!2sFaisalabad%2C%20Pakistan!5e0!3m2!1sen!2sus!4v1618876956475!5m2!1sen!2sus"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Zim Coolant Location - Faisalabad, Pakistan"
                  ></iframe>
                </div>
                <p className="text-gray-500 text-sm mt-2 text-center">📍 Faisalabad, Punjab, Pakistan</p>
              </div>
            </div>

            {/* Contact Form */}
            <div
              className="card p-8"
            >
              {isSubmitted ? (
                <div
                  className="text-center py-12"
                >
                  <CheckCircle className="w-16 h-16 text-white/70 mx-auto mb-4" />
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2">Message Sent Successfully!</h3>
                  <p className="text-gray-600 mb-6">
                    Thank you for contacting us. We'll get back to you within 24 hours.
                  </p>
                  <button onClick={() => setIsSubmitted(false)} className="btn-primary">
                    Send Another Message
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-6">Send us a Message</h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all ${fieldErrors.name ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                          placeholder="Your full name"
                        />
                        {fieldErrors.name && (
                          <p className="mt-1.5 text-sm text-red-600">{fieldErrors.name}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all ${fieldErrors.email ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                          placeholder="your.email@example.com"
                        />
                        {fieldErrors.email && (
                          <p className="mt-1.5 text-sm text-red-600">{fieldErrors.email}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
                          placeholder="+92 123-4567890"
                        />
                      </div>
                      <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                        <select
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
                        >
                          <option value="">Select a subject</option>
                          <option value="product-inquiry">Product Inquiry</option>
                          <option value="technical-support">Technical Support</option>
                          <option value="order-status">Order Status</option>
                          <option value="partnership">Partnership</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        rows={6}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all resize-none ${fieldErrors.message ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                        placeholder="Tell us how we can help you..."
                      />
                      {fieldErrors.message && (
                        <p className="mt-1.5 text-sm text-red-600">{fieldErrors.message}</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full btn-primary flex items-center justify-center space-x-2 min-h-[48px]"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          <span>Send Message</span>
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div
            className="text-center mb-16"
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
              Find answers to common questions about our products and services.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="card p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
