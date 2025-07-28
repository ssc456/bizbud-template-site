import { motion } from 'framer-motion';
import { useState } from 'react';

function TestimonialsSection({ title, quotes, primaryColor }) {
  const [activeQuote, setActiveQuote] = useState(0);
  
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
    },
    red: {
      accent: 'text-red-500',
      bg: 'bg-red-500',
      gradient: 'from-red-500 to-rose-400',
    },
    yellow: {
      accent: 'text-yellow-500',
      bg: 'bg-yellow-500',
      gradient: 'from-yellow-400 to-amber-400',
    }
  }[primaryColor] || colorClasses.blue;

  if (!quotes?.length) {
    return null;
  }

  return (
    <section id="testimonials" className="py-20 bg-gray-900 text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-block">
            <div className={`h-1 w-20 ${colorClasses.bg} mb-4 mx-auto rounded`}></div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">{title}</h2>
        </div>
        
        <div className="max-w-4xl mx-auto">
          {quotes.map((quote, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: activeQuote === index ? 1 : 0 }}
              className={`${activeQuote === index ? 'block' : 'hidden'} text-center`}
            >
              <div className="relative mb-8">
                <div className={`text-6xl leading-none ${colorClasses.accent} opacity-25 absolute -top-8 -left-4`}>"</div>
                <p className="text-xl md:text-2xl italic relative z-10 mb-6">{quote.quote}</p>
                <div className={`text-6xl leading-none ${colorClasses.accent} opacity-25 absolute -bottom-8 -right-4`}>"</div>
              </div>
              
              <div className="flex flex-col items-center">
                {quote.image ? (
                  <img 
                    src={quote.image} 
                    alt={quote.name} 
                    className="w-16 h-16 rounded-full object-cover mb-3 border-2 border-white"
                  />
                ) : (
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${colorClasses.gradient} flex items-center justify-center mb-3`}>
                    <span className="text-xl font-bold">{quote.name.charAt(0)}</span>
                  </div>
                )}
                <p className="font-medium text-lg">{quote.name}</p>
              </div>
            </motion.div>
          ))}
          
          {quotes.length > 1 && (
            <div className="flex justify-center mt-8 space-x-2">
              {quotes.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveQuote(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    activeQuote === index ? `${colorClasses.bg}` : 'bg-gray-600'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;