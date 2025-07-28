import { motion } from 'framer-motion';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

function TestimonialsSection({ title, quotes, primaryColor }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Minimalist color mapping
  const colorClasses = {
    pink: {
      accent: 'bg-rose-500',
      text: 'text-rose-500',
      light: 'bg-rose-50'
    },
    purple: {
      accent: 'bg-purple-500',
      text: 'text-purple-500',
      light: 'bg-purple-50'
    },
    blue: {
      accent: 'bg-blue-500',
      text: 'text-blue-500',
      light: 'bg-blue-50'
    },
    green: {
      accent: 'bg-emerald-500',
      text: 'text-emerald-500',
      light: 'bg-emerald-50'
    },
    red: {
      accent: 'bg-red-500',
      text: 'text-red-500',
      light: 'bg-red-50'
    },
    yellow: {
      accent: 'bg-amber-500',
      text: 'text-amber-500',
      light: 'bg-amber-50'
    }
  }[primaryColor] || {
    accent: 'bg-gray-900',
    text: 'text-gray-900',
    light: 'bg-gray-50'
  };

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % quotes.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + quotes.length) % quotes.length);
  };

  const goToTestimonial = (index) => {
    setCurrentIndex(index);
  };

  if (!quotes || quotes.length === 0) {
    return (
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className={`w-16 h-16 ${colorClasses.light} rounded-full flex items-center justify-center mx-auto mb-6`}>
              <Quote size={24} className={colorClasses.text} />
            </div>
            <p className="text-gray-500 font-light">No testimonials available</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="testimonials" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {/* Section indicator */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className={`w-12 h-0.5 ${colorClasses.accent}`} />
              <span className="text-sm font-medium text-gray-500 tracking-wider uppercase">Testimonials</span>
              <div className={`w-12 h-0.5 ${colorClasses.accent}`} />
            </div>
            
            <h2 className="text-4xl md:text-5xl font-light text-gray-900 leading-tight">
              {title}
            </h2>
          </motion.div>
          
          {/* Testimonial Display */}
          <div className="max-w-4xl mx-auto">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              {/* Quote Icon */}
              <div className={`w-16 h-16 ${colorClasses.light} rounded-full flex items-center justify-center mx-auto mb-8`}>
                <Quote size={24} className={colorClasses.text} />
              </div>
              
              {/* Testimonial Text */}
              <blockquote className="text-2xl md:text-3xl font-light text-gray-800 leading-relaxed mb-12 italic">
                "{quotes[currentIndex].quote}"
              </blockquote>
              
              {/* Author Info */}
              <div className="flex items-center justify-center gap-6">
                {/* Author Image */}
                {quotes[currentIndex].image && (
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200">
                    <img
                      src={quotes[currentIndex].image}
                      alt={quotes[currentIndex].name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                {/* Author Details */}
                <div className="text-left">
                  <h4 className="font-medium text-gray-900 text-lg">
                    {quotes[currentIndex].name || quotes[currentIndex].author}
                  </h4>
                  {(quotes[currentIndex].position || quotes[currentIndex].title || quotes[currentIndex].company) && (
                    <p className="text-gray-600 font-light">
                      {quotes[currentIndex].position || quotes[currentIndex].title}
                      {quotes[currentIndex].company && `, ${quotes[currentIndex].company}`}
                    </p>
                  )}
                  
                  {/* Rating if available */}
                  {quotes[currentIndex].rating && (
                    <div className="flex items-center mt-2">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-sm ${
                            i < quotes[currentIndex].rating 
                              ? colorClasses.text 
                              : 'text-gray-300'
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
            
            {/* Navigation */}
            {quotes.length > 1 && (
              <div className="flex items-center justify-center gap-8 mt-16">
                {/* Previous Button */}
                <button
                  onClick={prevTestimonial}
                  className={`w-12 h-12 ${colorClasses.light} hover:${colorClasses.accent.replace('bg-', 'bg-')} flex items-center justify-center transition-all duration-300 group`}
                >
                  <ChevronLeft 
                    size={20} 
                    className={`${colorClasses.text} group-hover:text-white transition-colors`}
                  />
                </button>
                
                {/* Dots Indicator */}
                <div className="flex items-center gap-3">
                  {quotes.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToTestimonial(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentIndex 
                          ? colorClasses.accent 
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
                
                {/* Next Button */}
                <button
                  onClick={nextTestimonial}
                  className={`w-12 h-12 ${colorClasses.light} hover:${colorClasses.accent.replace('bg-', 'bg-')} flex items-center justify-center transition-all duration-300 group`}
                >
                  <ChevronRight 
                    size={20} 
                    className={`${colorClasses.text} group-hover:text-white transition-colors`}
                  />
                </button>
              </div>
            )}
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

export default TestimonialsSection;
