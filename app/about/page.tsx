'use client'

import { motion } from 'framer-motion'
import { Users, Target, Award, Globe, CheckCircle } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const stats = [
  { number: '15+', label: 'Years Experience' },
  { number: '1000+', label: 'Happy Customers' },
  { number: '50+', label: 'Product Variants' },
  { number: '24/7', label: 'Support Available' }
]

const values = [
  {
    icon: CheckCircle,
    title: 'Quality Assurance',
    description: 'Every product undergoes rigorous testing to meet international standards.'
  },
  {
    icon: Users,
    title: 'Customer First',
    description: 'We prioritize customer satisfaction and build long-term relationships.'
  },
  {
    icon: Target,
    title: 'Innovation',
    description: 'Continuously improving our products with the latest technology.'
  },
  {
    icon: Globe,
    title: 'Sustainability',
    description: 'Committed to environmental responsibility in all our operations.'
  }
]

const team = [
  {
    name: 'John Moyo',
    position: 'CEO & Founder',
    image: '/api/placeholder/200/200',
    description: '15+ years in automotive industry with expertise in lubricant technology.'
  },
  {
    name: 'Sarah Ndlovu',
    position: 'Technical Director',
    image: '/api/placeholder/200/200',
    description: 'Chemical engineer specializing in automotive fluid formulations.'
  },
  {
    name: 'David Chikomba',
    position: 'Sales Manager',
    image: '/api/placeholder/200/200',
    description: 'Expert in customer relations and market development strategies.'
  }
]

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-primary pt-32 pb-16">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              About <span className="text-gradient">Zim Coolant</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              We are a leading manufacturer and distributor of premium quality engine oils and coolants, 
              serving the automotive industry with excellence since 2009.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-primary-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-secondary-500 rounded-2xl flex items-center justify-center">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                To provide the highest quality engine oils and coolants that enhance vehicle performance, 
                extend engine life, and contribute to environmental sustainability. We strive to be the 
                trusted partner for automotive professionals and vehicle owners across Zimbabwe and beyond.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-secondary-500 to-accent-500 rounded-2xl flex items-center justify-center">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Our Vision</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                To become the leading provider of automotive fluids in Southern Africa, recognized for 
                innovation, quality, and customer service. We envision a future where every vehicle 
                runs optimally with our products, contributing to safer roads and a cleaner environment.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These principles guide everything we do and shape our company culture.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <value.icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experienced professionals dedicated to delivering excellence in every product and service.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card text-center"
              >
                <div className="p-6">
                  <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">Photo</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {member.name}
                  </h3>
                  <p className="text-primary-600 font-medium mb-3">
                    {member.position}
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    {member.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-4xl font-bold text-gray-900">
                Our Story
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Founded in 2009, Zim Coolant began as a small family business with a big vision: 
                  to provide Zimbabwe with the highest quality automotive fluids available anywhere in the world.
                </p>
                <p>
                  What started as a local operation has grown into a trusted name in the automotive industry, 
                  serving customers across the country with premium engine oils and coolants.
                </p>
                <p>
                  Today, we continue to innovate and expand our product range while maintaining the same 
                  commitment to quality and customer service that has been our foundation from day one.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-primary-100 to-secondary-100 rounded-2xl p-8">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-secondary-500 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">Z</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">15 Years of Excellence</h3>
                  <p className="text-gray-600">
                    From humble beginnings to industry leadership, our journey continues with every product we create.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
