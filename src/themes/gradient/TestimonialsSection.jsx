import { motion } from 'framer-motion';
import { useState } from 'react';

export default function TestimonialsSection({ title = "What Our Clients Say", quotes = [], primaryColor = 'blue' }) {
  const [activeQuote, setActiveQuote] = useState(0);

  if (!quotes || quotes.length === 0) {
    return null;
  }

  const colorClasses = {
    red: {
      gradient: 'from-red-500 to-red-700',
      text: 'text-red-600',
      bg: 'bg-red-500',
      border: 'border-red-500',
      hover: 'hover:bg-red-600'
    },
    blue: {
      gradient: 'from-blue-500 to-blue-700',
      text: 'text-blue-600',
      bg: 'bg-blue-500',
      border: 'border-blue-500',
      hover: 'hover:bg-blue-600'
    },
    green: {
      gradient: 'from-green-500 to-green-700',
      text: 'text-green-600',
      bg: 'bg-green-500',
      border: 'border-green-500',
      hover: 'hover:bg-green-600'
    },
    purple: {
      gradient: 'from-purple-500 to-purple-700',
      text: 'text-purple-600',
      bg: 'bg-purple-500',
      border: 'border-purple-500',
      hover: 'hover:bg-purple-600'
    },
    orange: {
      gradient: 'from-orange-500 to-orange-700',
      text: 'text-orange-600',
      bg: 'bg-orange-500',
      border: 'border-orange-500',
      hover: 'hover:bg-orange-600'
    },
    yellow: {
      gradient: 'from-yellow-500 to-yellow-700',
      text: 'text-yellow-600',
      bg: 'bg-yellow-500',
      border: 'border-yellow-500',
      hover: 'hover:bg-yellow-600'
    }
  };

  const colors = colorClasses[primaryColor] || colorClasses.blue;

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className={`text-4xl md:text-5xl font-bold bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent mb-4`}>
            {title}
          </h2>
          <div className={`w-24 h-1 bg-gradient-to-r ${colors.gradient} mx-auto rounded-full`}></div>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <motion.div
            key={activeQuote}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 relative overflow-hidden">
              {/* Gradient background overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-5`}></div>
              
              {/* Quote content */}
              <div className="relative z-10">
                <div className={`text-6xl ${colors.text} opacity-30 mb-6`}>
                  "
                </div>
                
                <blockquote className="text-xl md:text-2xl text-gray-700 font-medium leading-relaxed mb-8 italic">
                  {quotes[activeQuote].quote}
                </blockquote>

                <div className="flex items-center justify-center space-x-4">
                  {quotes[activeQuote].image && (
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${colors.gradient} p-0.5`}>
                      <img
                        src={quotes[activeQuote].image}
                        alt={quotes[activeQuote].name}
                        className="w-full h-full rounded-full object-cover bg-white"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                      />
                      <div 
                        className={`w-full h-full rounded-full bg-gradient-to-r ${colors.gradient} items-center justify-center text-white font-bold text-xl hidden`}
                      >
                        {quotes[activeQuote].name?.charAt(0) || '?'}
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-gray-900 text-lg">
                      {quotes[activeQuote].name}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Navigation dots */}
          {quotes.length > 1 && (
            <div className="flex justify-center mt-8 space-x-3">
              {quotes.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveQuote(index)}
                  className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    index === activeQuote
                      ? `bg-gradient-to-r ${colors.gradient} shadow-lg`
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`View testimonial ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Navigation arrows for larger screens */}
          {quotes.length > 1 && (
            <div className="hidden md:block">
              <button
                onClick={() => setActiveQuote(activeQuote === 0 ? quotes.length - 1 : activeQuote - 1)}
                className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-lg border ${colors.border} ${colors.hover} transition-colors duration-300 flex items-center justify-center text-white`}
                aria-label="Previous testimonial"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button
                onClick={() => setActiveQuote(activeQuote === quotes.length - 1 ? 0 : activeQuote + 1)}
                className={`absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-lg border ${colors.border} ${colors.hover} transition-colors duration-300 flex items-center justify-center text-white`}
                aria-label="Next testimonial"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
