import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

function AboutSection({ title, description, image, primaryColor, logoUrl }) {
  // Minimalist color mapping
  const colorClasses = {
    pink: {
      accent: 'bg-rose-500',
      text: 'text-rose-500',
      light: 'bg-rose-50',
      border: 'border-rose-200'
    },
    purple: {
      accent: 'bg-purple-500',
      text: 'text-purple-500',
      light: 'bg-purple-50',
      border: 'border-purple-200'
    },
    blue: {
      accent: 'bg-blue-500',
      text: 'text-blue-500',
      light: 'bg-blue-50',
      border: 'border-blue-200'
    },
    green: {
      accent: 'bg-emerald-500',
      text: 'text-emerald-500',
      light: 'bg-emerald-50',
      border: 'border-emerald-200'
    },
    red: {
      accent: 'bg-red-500',
      text: 'text-red-500',
      light: 'bg-red-50',
      border: 'border-red-200'
    },
    yellow: {
      accent: 'bg-amber-500',
      text: 'text-amber-500',
      light: 'bg-amber-50',
      border: 'border-amber-200'
    }
  }[primaryColor] || {
    accent: 'bg-gray-900',
    text: 'text-gray-900',
    light: 'bg-gray-50',
    border: 'border-gray-200'
  };

  return (
    <section id="about" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            
            {/* Content Section */}
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              {/* Section indicator */}
              <div className="flex items-center gap-4">
                <div className={`w-12 h-0.5 ${colorClasses.accent}`} />
                <span className="text-sm font-medium text-gray-500 tracking-wider uppercase">About</span>
              </div>
              
              {/* Title */}
              <h2 className="text-4xl md:text-5xl font-light text-gray-900 leading-tight">
                {title?.split(' ').map((word, index) => (
                  <span key={index} className={index === 0 ? 'font-medium' : ''}>
                    {word}{' '}
                  </span>
                ))}
              </h2>
              
              {/* Description */}
              <div className="space-y-6">
                <p className="text-lg text-gray-600 leading-relaxed font-light">
                  {description}
                </p>
              </div>
              
              {/* CTA */}
              <motion.button
                onClick={() => {
                  const servicesSection = document.querySelector('#services');
                  if (servicesSection) {
                    const headerHeight = 80;
                    const elementPosition = servicesSection.offsetTop - headerHeight;
                    window.scrollTo({
                      top: elementPosition,
                      behavior: 'smooth'
                    });
                  }
                }}
                whileHover={{ x: 5 }}
                className={`group inline-flex items-center gap-3 ${colorClasses.text} text-sm font-medium tracking-wide uppercase transition-all duration-300`}
              >
                <span>Discover Our Services</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </motion.div>
            
            {/* Image Section */}
            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {/* Main image container */}
              <div className="relative">
                {logoUrl ? (
                  <div className="aspect-square bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
                    <img 
                      src={logoUrl} 
                      alt={title} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                ) : (
                  <div className="aspect-square bg-white rounded-lg flex items-center justify-center border border-gray-200">
                    <div className="text-center">
                      <div className={`w-16 h-0.5 ${colorClasses.accent} mx-auto mb-4`} />
                      <h3 className="text-2xl font-light text-gray-400 uppercase tracking-wider">
                        About
                      </h3>
                      <div className={`w-8 h-0.5 ${colorClasses.accent} mx-auto mt-4`} />
                    </div>
                  </div>
                )}
                
                {/* Minimalist decorative elements */}
                <div className="absolute -top-6 -left-6 w-24 h-24 border border-gray-300 -z-10" />
                <div className={`absolute -bottom-4 -right-4 w-16 h-16 ${colorClasses.light} -z-10`} />
              </div>
              
              {/* Stats or additional info (optional) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mt-12 grid grid-cols-2 gap-8"
              >
                <div className="text-center">
                  <div className={`text-2xl font-light ${colorClasses.text} mb-2`}>100%</div>
                  <div className="text-sm text-gray-500 uppercase tracking-wide">Quality</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-light ${colorClasses.text} mb-2`}>24/7</div>
                  <div className="text-sm text-gray-500 uppercase tracking-wide">Support</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
