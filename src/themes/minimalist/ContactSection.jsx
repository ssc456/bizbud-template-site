import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Send, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

function ContactSection({ title, description, email, phone, address, primaryColor, clientData }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Minimalist color mapping
  const colorClasses = {
    pink: {
      accent: 'bg-rose-500',
      text: 'text-rose-500',
      hover: 'hover:bg-rose-600',
      border: 'border-rose-500',
      light: 'bg-rose-50'
    },
    purple: {
      accent: 'bg-purple-500',
      text: 'text-purple-500',
      hover: 'hover:bg-purple-600',
      border: 'border-purple-500',
      light: 'bg-purple-50'
    },
    blue: {
      accent: 'bg-blue-500',
      text: 'text-blue-500',
      hover: 'hover:bg-blue-600',
      border: 'border-blue-500',
      light: 'bg-blue-50'
    },
    green: {
      accent: 'bg-emerald-500',
      text: 'text-emerald-500',
      hover: 'hover:bg-emerald-600',
      border: 'border-emerald-500',
      light: 'bg-emerald-50'
    },
    red: {
      accent: 'bg-red-500',
      text: 'text-red-500',
      hover: 'hover:bg-red-600',
      border: 'border-red-500',
      light: 'bg-red-50'
    },
    yellow: {
      accent: 'bg-amber-500',
      text: 'text-amber-500',
      hover: 'hover:bg-amber-600',
      border: 'border-amber-500',
      light: 'bg-amber-50'
    }
  }[primaryColor] || {
    accent: 'bg-gray-900',
    text: 'text-gray-900',
    hover: 'hover:bg-gray-800',
    border: 'border-gray-900',
    light: 'bg-gray-50'
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (!formData.message.trim()) {
      toast.error('Please enter your message');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Get the site ID from the URL (e.g., example.entrynets.com -> example)
      const hostname = window.location.hostname;
      let siteId = hostname.split('.')[0];
      
      // If on localhost, use a default or from env
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        siteId = import.meta.env.VITE_SITE_ID || 'demo';
      }
      
      const response = await fetch(`/api/contact?siteId=${siteId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Message sent successfully!');
        setFormData({ name: '', email: '', message: '' });
      } else {
        toast.error('Failed to send message. Please try again.');
      }
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <section id="contact" className="py-32 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {/* Section indicator */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className={`w-12 h-0.5 ${colorClasses.accent}`} />
              <span className="text-sm font-medium text-gray-500 tracking-wider uppercase">Contact</span>
              <div className={`w-12 h-0.5 ${colorClasses.accent}`} />
            </div>
            
            <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-6 leading-tight">
              {title}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">
              {description}
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            {/* Contact Information */}
            <motion.div 
              className="space-y-12"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              {/* Contact methods */}
              <div className="space-y-8">
                {email && (
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 ${colorClasses.light} flex items-center justify-center flex-shrink-0`}>
                      <Mail size={20} className={colorClasses.text} strokeWidth={1.5} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Email</h4>
                      <a 
                        href={`mailto:${email}`}
                        className={`${colorClasses.text} hover:opacity-70 transition-opacity font-light`}
                      >
                        {email}
                      </a>
                    </div>
                  </div>
                )}
                
                {phone && (
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 ${colorClasses.light} flex items-center justify-center flex-shrink-0`}>
                      <Phone size={20} className={colorClasses.text} strokeWidth={1.5} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Phone</h4>
                      <a 
                        href={`tel:${phone}`}
                        className={`${colorClasses.text} hover:opacity-70 transition-opacity font-light`}
                      >
                        {phone}
                      </a>
                    </div>
                  </div>
                )}
                
                {address && (
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 ${colorClasses.light} flex items-center justify-center flex-shrink-0`}>
                      <MapPin size={20} className={colorClasses.text} strokeWidth={1.5} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Address</h4>
                      <p className="text-gray-600 font-light leading-relaxed">
                        {address}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Appointment booking link if enabled */}
              {clientData?.config?.showAppointments && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="pt-8 border-t border-gray-200"
                >
                  <Link 
                    to="/book-appointment"
                    className={`group inline-flex items-center gap-3 ${colorClasses.text} text-sm font-medium tracking-wide uppercase hover:opacity-70 transition-all duration-300`}
                  >
                    <span>Book an Appointment</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
              )}
            </motion.div>
            
            {/* Contact Form */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your Name"
                    required
                    className="w-full px-0 py-4 border-0 border-b border-gray-300 bg-transparent focus:border-gray-900 focus:ring-0 text-gray-900 placeholder-gray-500 font-light transition-colors"
                  />
                </div>
                
                <div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Your Email"
                    required
                    className="w-full px-0 py-4 border-0 border-b border-gray-300 bg-transparent focus:border-gray-900 focus:ring-0 text-gray-900 placeholder-gray-500 font-light transition-colors"
                  />
                </div>
                
                <div>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Your Message"
                    rows={4}
                    required
                    className="w-full px-0 py-4 border-0 border-b border-gray-300 bg-transparent focus:border-gray-900 focus:ring-0 text-gray-900 placeholder-gray-500 font-light resize-none transition-colors"
                  />
                </div>
                
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ x: 5 }}
                  className={`group inline-flex items-center gap-3 ${colorClasses.accent} text-white px-8 py-4 ${colorClasses.hover} transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105`}
                >
                  <span className="font-medium">
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </span>
                  <Send size={16} className="group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactSection;
