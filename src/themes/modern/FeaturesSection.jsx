import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';

function FeaturesSection({ title, items, primaryColor }) {
  const colorClasses = {
    pink: {
      accent: 'text-pink-500',
      bg: 'bg-pink-500',
      gradient: 'from-pink-500 to-rose-400',
    },
    purple: {
      accent: 'text-purple-500',
      bg: 'bg-purple-500',
      gradient: 'from-purple-500 to-indigo-400',
    },
    blue: {
      accent: 'text-blue-500',
      bg: 'bg-blue-500',
      gradient: 'from-blue-500 to-cyan-400',
    },
    green: {
      accent: 'text-green-500',
      bg: 'bg-green-500',
      gradient: 'from-green-500 to-emerald-400',
    }
  }[primaryColor] || colorClasses.blue;

  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-block">
            <div className={`h-1 w-20 ${colorClasses.bg} mb-4 mx-auto rounded`}></div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">{title}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items?.map((feature, index) => {
            const IconComponent = feature.iconName && LucideIcons[feature.iconName] 
              ? LucideIcons[feature.iconName] 
              : LucideIcons.CircleDashed;
              
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
              >
                <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${colorClasses.gradient} flex items-center justify-center mb-4`}>
                  <IconComponent size={20} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;