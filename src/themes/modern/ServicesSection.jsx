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
  // Color mapping
  const colorClasses = {
    pink: {
      accent: 'text-pink-500',
      gradient: 'from-pink-500 to-rose-400',
      bg: 'bg-pink-500'
    },
    purple: {
      accent: 'text-purple-500',
      gradient: 'from-purple-500 to-indigo-400',
      bg: 'bg-purple-500'
    },
    blue: {
      accent: 'text-blue-500',
      gradient: 'from-blue-500 to-cyan-400',
      bg: 'bg-blue-500'
    },
    green: {
      accent: 'text-green-500',
      gradient: 'from-green-500 to-emerald-400',
      bg: 'bg-green-500'
    },
    red: {
      accent: 'text-red-500',
      gradient: 'from-red-500 to-rose-400',
      bg: 'bg-red-500'
    },
    yellow: {
      accent: 'text-yellow-500',
      gradient: 'from-yellow-400 to-amber-400',
      bg: 'bg-yellow-500'
    }
  }[primaryColor] || colorClasses.blue;

  return (
    <section id="services" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-block">
            <div className={`h-1 w-20 ${colorClasses.bg} mb-4 mx-auto rounded`}></div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">{title}</h2>
          <p className="text-gray-600 text-lg">{description}</p>
        </div>
        
        {/* Display services in a grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items?.map((service, index) => {
            // Dynamic icon rendering from Lucide icon library
            const IconComponent = service.iconName && LucideIcons[service.iconName] 
              ? LucideIcons[service.iconName] 
              : LucideIcons.CircleDashed;
              
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
              >
                <div className={`${colorClasses.bg} h-12 w-12 rounded-lg flex items-center justify-center text-white mb-4`}>
                  <IconComponent size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                
                {service.details?.length > 0 && (
                  <ul className="space-y-2 mb-4">
                    {service.details.map((detail, i) => (
                      <li key={i} className="flex items-center">
                        <LucideIcons.CheckCircle className={`${colorClasses.accent} mr-2`} size={16} />
                        <span className="text-gray-700">{detail}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default ServicesSection;