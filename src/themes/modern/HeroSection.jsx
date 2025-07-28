import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

function HeroSection({
  // Change these lines:
  title,
  subtitle,
  
  // To match the prop names from your data:
  headline,
  subheadline,
  
  description,
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
  
  // Color mapping
  const colorClasses = {
    pink: {
      gradient: 'from-pink-500 to-rose-400',
      button: 'bg-gradient-to-r from-pink-500 to-rose-400',
      text: 'text-pink-500'
    },
    purple: {
      gradient: 'from-purple-500 to-indigo-400',
      button: 'bg-gradient-to-r from-purple-500 to-indigo-400',
      text: 'text-purple-500'
    },
    blue: {
      gradient: 'from-blue-500 to-cyan-400',
      button: 'bg-gradient-to-r from-blue-500 to-cyan-400',
      text: 'text-blue-500'
    },
    green: {
      gradient: 'from-green-500 to-emerald-400',
      button: 'bg-gradient-to-r from-green-500 to-emerald-400',
      text: 'text-green-500'
    },
    red: {
      gradient: 'from-red-500 to-rose-400',
      button: 'bg-gradient-to-r from-red-500 to-rose-400',
      text: 'text-red-500'
    },
    yellow: {
      gradient: 'from-yellow-400 to-amber-400',
      button: 'bg-gradient-to-r from-yellow-400 to-amber-400',
      text: 'text-yellow-500'
    }
  }[primaryColor] || colorClasses.blue;

  return (
    <section id="hero" className={`relative min-h-screen flex items-center text-white ${animations ? 'overflow-hidden' : ''}`}>
      {/* Background with blur effect */}
      <div className="absolute inset-0 bg-gray-900 opacity-80 z-0"></div>
      
      {/* Background pattern */}
      <div className="absolute inset-0 z-0 opacity-20" 
        style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}}
      ></div>
      
      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl">
          <motion.h1 
            initial={animations ? { opacity: 0, y: 20 } : false}
            animate={animations ? { opacity: 1, y: 0 } : false}
            transition={{ duration: 0.8 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6"
          >
            {headline /* Change from title to headline */}
          </motion.h1>
          
          <p className="text-xl text-gray-300 mb-10">
            {subheadline /* Change from subtitle to subheadline */}
          </p>
          
          <div className="flex flex-wrap gap-4 mt-8">
            {/* Primary CTA - Change to Link if showAppointments is true */}
            {showAppointments ? (
              <Link 
                to="/book-appointment"
                className={`px-8 py-3 rounded-lg font-medium bg-gradient-to-r ${colorClasses.gradient} text-white hover:opacity-90 transition-opacity`}
              >
                Book Now
              </Link>
            ) : (
              <a 
                href={ctaUrl || "#contact"} 
                className={`px-8 py-3 rounded-lg font-medium bg-gradient-to-r ${colorClasses.gradient} text-white hover:opacity-90 transition-opacity`}
              >
                {ctaText || "Contact Us"}
              </a>
            )}
            
            {/* Secondary CTA */}
            <a 
              href={secondaryCtaUrl || "#about"} 
              className="px-8 py-3 rounded-lg font-medium bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
            >
              {secondaryCtaText || "Learn More"}
            </a>
          </div>
        </div>
      </div>
      
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent"></div>
    </section>
  );
}

export default HeroSection;