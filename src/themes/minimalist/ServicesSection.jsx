import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';

function ServicesSection({ 
  title, 
  description,
  items, 
  primaryColor,
  ctaText,
  ctaLink,
  layoutStyle = 'cards'
}) {
  // Minimalist color mapping
  const colorClasses = {
    pink: {
      accent: 'bg-rose-500',
      text: 'text-rose-500',
      hover: 'hover:bg-rose-50',
      border: 'border-rose-500'
    },
    purple: {
      accent: 'bg-purple-500',
      text: 'text-purple-500',
      hover: 'hover:bg-purple-50',
      border: 'border-purple-500'
    },
    blue: {
      accent: 'bg-blue-500',
      text: 'text-blue-500',
      hover: 'hover:bg-blue-50',
      border: 'border-blue-500'
    },
    green: {
      accent: 'bg-emerald-500',
      text: 'text-emerald-500',
      hover: 'hover:bg-emerald-50',
      border: 'border-emerald-500'
    },
    red: {
      accent: 'bg-red-500',
      text: 'text-red-500',
      hover: 'hover:bg-red-50',
      border: 'border-red-500'
    },
    yellow: {
      accent: 'bg-amber-500',
      text: 'text-amber-500',
      hover: 'hover:bg-amber-50',
      border: 'border-amber-500'
    }
  }[primaryColor] || {
    accent: 'bg-gray-900',
    text: 'text-gray-900',
    hover: 'hover:bg-gray-50',
    border: 'border-gray-900'
  };

  return (
    <section id="services" className="py-16 bg-white">
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
              <span className="text-sm font-medium text-gray-500 tracking-wider uppercase">Services</span>
              <div className={`w-12 h-0.5 ${colorClasses.accent}`} />
            </div>
            
            <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-6 leading-tight">
              {title}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">
              {description}
            </p>
          </motion.div>
          
          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items?.map((service, index) => {
              const IconComponent = service.iconName && LucideIcons[service.iconName] 
                ? LucideIcons[service.iconName] 
                : LucideIcons.Circle;
                
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`group p-8 bg-white border border-gray-200 ${colorClasses.hover} transition-all duration-300 hover:shadow-sm`}
                >
                  {/* Icon */}
                  <div className="mb-6">
                    <div className={`w-12 h-12 ${colorClasses.text} flex items-center justify-center`}>
                      <IconComponent size={24} strokeWidth={1.5} />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-xl font-medium text-gray-900 mb-4 group-hover:${colorClasses.text.replace('text-', '')} transition-colors">
                    {service.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed mb-6 font-light">
                    {service.description}
                  </p>
                  
                  {/* Price if available */}
                  {service.price && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 uppercase tracking-wide">Starting at</span>
                      <span className={`text-lg font-medium ${colorClasses.text}`}>
                        {service.price}
                      </span>
                    </div>
                  )}
                  
                  {/* Service details if available */}
                  {service.details && service.details.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <ul className="space-y-2">
                        {service.details.slice(0, 3).map((detail, detailIndex) => (
                          <li key={detailIndex} className="text-sm text-gray-600 flex items-center gap-2">
                            <div className={`w-1 h-1 ${colorClasses.accent} rounded-full`} />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
          
          {/* CTA if provided */}
          {ctaText && ctaLink && (
            <motion.div 
              className="text-center mt-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <a 
                href={ctaLink}
                className={`inline-flex items-center gap-3 px-8 py-4 ${colorClasses.accent} text-white hover:opacity-90 transition-all duration-300 transform hover:scale-105`}
              >
                <span className="font-medium">{ctaText}</span>
                <LucideIcons.ArrowRight size={16} />
              </a>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}

export default ServicesSection;
