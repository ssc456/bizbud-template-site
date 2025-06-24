import { motion } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

function FAQSection({ title, items, primaryColor }) {
  const [openIndex, setOpenIndex] = useState(0);
  
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
    <section id="faq" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block">
              <div className={`h-1 w-20 ${colorClasses.bg} mb-4 mx-auto rounded`}></div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">{title}</h2>
          </div>
          
          <div className="space-y-4">
            {items?.map((faq, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className={`w-full flex justify-between items-center p-5 text-left font-medium ${
                    openIndex === index ? `${colorClasses.light} ${colorClasses.accent}` : 'hover:bg-gray-50'
                  }`}
                >
                  <span>{faq.question}</span>
                  {openIndex === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                
                <div className={`overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-96' : 'max-h-0'}`}>
                  <div className="p-5 bg-gray-50 border-t border-gray-200">
                    <p className="text-gray-700">{faq.answer}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default FAQSection;