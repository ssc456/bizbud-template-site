import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

function HeroSection({
  headline,
  subheadline,
  ctaText,
  ctaUrl,
  secondaryCtaText,
  secondaryCtaUrl,
  backgroundImage,
  overlayOpacity,
  primaryColor,
  secondaryColor,
  animations,
  showAppointments
}) {
  const navigate = useNavigate();
  
  // Minimalist color mapping with subtle, sophisticated tones
  const colorClasses = {
    pink: {
      accent: 'bg-rose-500',
      text: 'text-rose-500',
      hover: 'hover:bg-rose-600',
      border: 'border-rose-500'
    },
    purple: {
      accent: 'bg-purple-500',
      text: 'text-purple-500',
      hover: 'hover:bg-purple-600',
      border: 'border-purple-500'
    },
    blue: {
      accent: 'bg-blue-500',
      text: 'text-blue-500',
      hover: 'hover:bg-blue-600',
      border: 'border-blue-500'
    },
    green: {
      accent: 'bg-emerald-500',
      text: 'text-emerald-500',
      hover: 'hover:bg-emerald-600',
      border: 'border-emerald-500'
    },
    red: {
      accent: 'bg-red-500',
      text: 'text-red-500',
      hover: 'hover:bg-red-600',
      border: 'border-red-500'
    },
    yellow: {
      accent: 'bg-amber-500',
      text: 'text-amber-500',
      hover: 'hover:bg-amber-600',
      border: 'border-amber-500'
    }
  }[primaryColor] || {
    accent: 'bg-gray-900',
    text: 'text-gray-900',
    hover: 'hover:bg-gray-800',
    border: 'border-gray-900'
  };

  return (
    <section id="hero" className="min-h-screen flex items-center bg-white relative">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)
          `,
          backgroundSize: '40px 40px'
        }}></div>
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main headline */}
          <motion.h1
            initial={animations ? { opacity: 0, y: 30 } : false}
            animate={animations ? { opacity: 1, y: 0 } : false}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-5xl md:text-7xl lg:text-8xl font-light tracking-tight text-gray-900 mb-8 leading-tight"
          >
            {headline?.split(' ').map((word, index) => (
              <span key={index} className={index % 2 === 1 ? 'font-medium' : ''}>
                {word}{' '}
              </span>
            ))}
          </motion.h1>
          
          {/* Subtitle with minimal styling */}
          <motion.p
            initial={animations ? { opacity: 0, y: 20 } : false}
            animate={animations ? { opacity: 1, y: 0 } : false}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl text-gray-600 mb-16 max-w-2xl mx-auto leading-relaxed font-light"
          >
            {subheadline}
          </motion.p>
          
          {/* CTA buttons */}
          <motion.div
            initial={animations ? { opacity: 0, y: 20 } : false}
            animate={animations ? { opacity: 1, y: 0 } : false}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            {/* Primary CTA */}
            {showAppointments ? (
              <Link 
                to="/book-appointment"
                className={`group inline-flex items-center gap-3 px-8 py-4 ${colorClasses.accent} text-white ${colorClasses.hover} transition-all duration-300 transform hover:scale-105`}
              >
                <span className="font-medium">Book Now</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <a 
                href={ctaUrl || "#contact"}
                className={`group inline-flex items-center gap-3 px-8 py-4 ${colorClasses.accent} text-white ${colorClasses.hover} transition-all duration-300 transform hover:scale-105`}
              >
                <span className="font-medium">{ctaText || "Get Started"}</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </a>
            )}
            
            {/* Secondary CTA - minimal design */}
            <a 
              href={secondaryCtaUrl || "#about"}
              className={`group inline-flex items-center gap-3 px-8 py-4 border ${colorClasses.border} ${colorClasses.text} hover:bg-gray-50 transition-all duration-300`}
            >
              <span className="font-medium">{secondaryCtaText || "Learn More"}</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <motion.div
        initial={animations ? { opacity: 0, y: 10 } : false}
        animate={animations ? { opacity: 1, y: 0 } : false}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-gray-500 font-medium tracking-wider uppercase">Scroll</span>
        </div>
      </motion.div>
    </section>
  );
}

export default HeroSection;
