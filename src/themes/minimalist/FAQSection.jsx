import { motion } from 'framer-motion';
import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

function FAQSection({ title, items, primaryColor }) {
  const [openIndex, setOpenIndex] = useState(0);

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

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (!items || items.length === 0) {
    return (
      <section id="faq" className="py-32 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className={`w-16 h-16 ${colorClasses.light} rounded-full flex items-center justify-center mx-auto mb-6`}>
              <div className={`w-8 h-8 ${colorClasses.accent} rounded-full`} />
            </div>
            <p className="text-gray-500 font-light">No FAQ items available</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="faq" className="py-32 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          
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
              <span className="text-sm font-medium text-gray-500 tracking-wider uppercase">FAQ</span>
              <div className={`w-12 h-0.5 ${colorClasses.accent}`} />
            </div>
            
            <h2 className="text-4xl md:text-5xl font-light text-gray-900 leading-tight">
              {title}
            </h2>
          </motion.div>
          
          {/* FAQ Items */}
          <div className="space-y-6">
            {items.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="border-b border-gray-200 last:border-b-0"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full py-6 flex items-center justify-between text-left group"
                >
                  <h3 className="text-lg md:text-xl font-medium text-gray-900 pr-8 group-hover:text-gray-600 transition-colors">
                    {item.question}
                  </h3>
                  
                  <div className={`w-8 h-8 ${colorClasses.light} flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                    openIndex === index ? colorClasses.accent.replace('bg-', 'bg-') : ''
                  }`}>
                    {openIndex === index ? (
                      <Minus 
                        size={16} 
                        className={openIndex === index ? 'text-white' : colorClasses.text}
                      />
                    ) : (
                      <Plus 
                        size={16} 
                        className={colorClasses.text}
                      />
                    )}
                  </div>
                </button>
                
                <motion.div
                  initial={false}
                  animate={{
                    height: openIndex === index ? 'auto' : 0,
                    opacity: openIndex === index ? 1 : 0
                  }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="pb-6 pr-12">
                    <p className="text-gray-600 leading-relaxed font-light">
                      {item.answer}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            ))}
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

export default FAQSection;
