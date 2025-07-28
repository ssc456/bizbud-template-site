import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';

function FeaturesSection({ title, items, primaryColor }) {
  // Minimalist color mapping
  const colorClasses = {
    pink: {
      accent: 'bg-rose-500',
      text: 'text-rose-500',
      light: 'bg-rose-50',
      border: 'border-rose-500'
    },
    purple: {
      accent: 'bg-purple-500',
      text: 'text-purple-500',
      light: 'bg-purple-50',
      border: 'border-purple-500'
    },
    blue: {
      accent: 'bg-blue-500',
      text: 'text-blue-500',
      light: 'bg-blue-50',
      border: 'border-blue-500'
    },
    green: {
      accent: 'bg-emerald-500',
      text: 'text-emerald-500',
      light: 'bg-emerald-50',
      border: 'border-emerald-500'
    },
    red: {
      accent: 'bg-red-500',
      text: 'text-red-500',
      light: 'bg-red-50',
      border: 'border-red-500'
    },
    yellow: {
      accent: 'bg-amber-500',
      text: 'text-amber-500',
      light: 'bg-amber-50',
      border: 'border-amber-500'
    }
  }[primaryColor] || {
    accent: 'bg-gray-900',
    text: 'text-gray-900',
    light: 'bg-gray-50',
    border: 'border-gray-900'
  };

  return (
    <section id="features" className="py-16 bg-gray-50">
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
              <span className="text-sm font-medium text-gray-500 tracking-wider uppercase">Features</span>
              <div className={`w-12 h-0.5 ${colorClasses.accent}`} />
            </div>
            
            <h2 className="text-4xl md:text-5xl font-light text-gray-900 leading-tight">
              {title}
            </h2>
          </motion.div>
          
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {items?.map((feature, index) => {
              const IconComponent = feature.iconName && LucideIcons[feature.iconName] 
                ? LucideIcons[feature.iconName] 
                : LucideIcons.Circle;
                
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group text-center"
                >
                  {/* Icon container */}
                  <div className="mb-8 flex justify-center">
                    <div className={`w-16 h-16 ${colorClasses.light} flex items-center justify-center group-hover:${colorClasses.accent.replace('bg-', 'bg-')} transition-all duration-300`}>
                      <IconComponent 
                        size={24} 
                        strokeWidth={1.5}
                        className={`${colorClasses.text} group-hover:text-white transition-colors duration-300`}
                      />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-xl font-medium text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed font-light">
                    {feature.description}
                  </p>
                  
                  {/* Decorative underline */}
                  <div className={`w-8 h-0.5 ${colorClasses.accent} mx-auto mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                </motion.div>
              );
            })}
          </div>
          
          {/* Bottom decorative element */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.6 }}
            className="flex justify-center mt-20"
          >
            <div className="flex items-center gap-4">
              <div className={`w-20 h-0.5 ${colorClasses.accent}`} />
              <div className={`w-2 h-2 ${colorClasses.accent} rounded-full`} />
              <div className={`w-20 h-0.5 ${colorClasses.accent}`} />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;
