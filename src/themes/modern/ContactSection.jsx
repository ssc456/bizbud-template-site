import { motion } from 'framer-motion';
import { Phone, Mail, MapPin } from 'lucide-react';

function ContactSection({ title, description, email, phone, address, primaryColor }) {
  const colorClasses = {
    pink: {
      accent: 'text-pink-500',
      bg: 'bg-pink-500',
      gradient: 'from-pink-500 to-rose-400',
      light: 'bg-pink-50',
    },
    purple: {
      accent: 'text-purple-500',
      bg: 'bg-purple-500',
      gradient: 'from-purple-500 to-indigo-400',
      light: 'bg-purple-50',
    },
    blue: {
      accent: 'text-blue-500',
      bg: 'bg-blue-500',
      gradient: 'from-blue-500 to-cyan-400',
      light: 'bg-blue-50',
    },
    green: {
      accent: 'text-green-500',
      bg: 'bg-green-500',
      gradient: 'from-green-500 to-emerald-400',
      light: 'bg-green-50',
    }
  }[primaryColor] || colorClasses.blue;

  return (
    <section id="contact" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-2 lg:order-1"
            >
              <div className="mb-8">
                <div className={`h-1 w-20 ${colorClasses.bg} mb-6 rounded`}></div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">{title}</h2>
                <p className="text-gray-600 text-lg mb-6">{description}</p>
              </div>
              
              <div className="space-y-6">
                {address && (
                  <div className="flex items-start">
                    <div className={`${colorClasses.light} p-3 rounded-full mr-4`}>
                      <MapPin size={24} className={colorClasses.accent} />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-1">Our Location</h3>
                      <p className="text-gray-600">{address}</p>
                    </div>
                  </div>
                )}
                
                {email && (
                  <div className="flex items-start">
                    <div className={`${colorClasses.light} p-3 rounded-full mr-4`}>
                      <Mail size={24} className={colorClasses.accent} />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-1">Email Us</h3>
                      <a href={`mailto:${email}`} className={`${colorClasses.accent} hover:underline`}>
                        {email}
                      </a>
                    </div>
                  </div>
                )}
                
                {phone && (
                  <div className="flex items-start">
                    <div className={`${colorClasses.light} p-3 rounded-full mr-4`}>
                      <Phone size={24} className={colorClasses.accent} />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-1">Call Us</h3>
                      <a href={`tel:${phone}`} className={`${colorClasses.accent} hover:underline`}>
                        {phone}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
            
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="order-1 lg:order-2"
            >
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-2xl font-semibold mb-6">Send us a message</h3>
                <form>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Your email"
                      />
                    </div>
                  </div>
                  <div className="mb-6">
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Subject"
                    />
                  </div>
                  <div className="mb-6">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Your message"
                    />
                  </div>
                  <button
                    type="submit"
                    className={`w-full py-3 px-4 bg-gradient-to-r ${colorClasses.gradient} text-white font-medium rounded-lg hover:opacity-90 transition-opacity`}
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactSection;