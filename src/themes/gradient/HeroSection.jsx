import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Zap } from 'lucide-react';
import { useRef } from 'react';

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
  const containerRef = useRef(null);
  
  // Scroll-based animations
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  
  const yTransform = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  
  // Bold gradient color mapping for dramatic effects
  const colorClasses = {
    pink: {
      primary: 'from-pink-400 via-rose-400 to-red-400',
      secondary: 'from-pink-600 via-rose-600 to-red-600',
      accent: 'bg-gradient-to-r from-pink-500 to-rose-500',
      text: 'text-pink-400',
      glow: 'shadow-pink-500/50',
      border: 'border-pink-400/30'
    },
    purple: {
      primary: 'from-purple-400 via-violet-400 to-indigo-400',
      secondary: 'from-purple-600 via-violet-600 to-indigo-600',
      accent: 'bg-gradient-to-r from-purple-500 to-violet-500',
      text: 'text-purple-400',
      glow: 'shadow-purple-500/50',
      border: 'border-purple-400/30'
    },
    blue: {
      primary: 'from-blue-400 via-cyan-400 to-teal-400',
      secondary: 'from-blue-600 via-cyan-600 to-teal-600',
      accent: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      text: 'text-blue-400',
      glow: 'shadow-blue-500/50',
      border: 'border-blue-400/30'
    },
    green: {
      primary: 'from-green-400 via-emerald-400 to-teal-400',
      secondary: 'from-green-600 via-emerald-600 to-teal-600',
      accent: 'bg-gradient-to-r from-green-500 to-emerald-500',
      text: 'text-green-400',
      glow: 'shadow-green-500/50',
      border: 'border-green-400/30'
    },
    red: {
      primary: 'from-red-400 via-rose-400 to-pink-400',
      secondary: 'from-red-600 via-rose-600 to-pink-600',
      accent: 'bg-gradient-to-r from-red-500 to-rose-500',
      text: 'text-red-400',
      glow: 'shadow-red-500/50',
      border: 'border-red-400/30'
    },
    yellow: {
      primary: 'from-yellow-400 via-amber-400 to-orange-400',
      secondary: 'from-yellow-600 via-amber-600 to-orange-600',
      accent: 'bg-gradient-to-r from-yellow-500 to-amber-500',
      text: 'text-yellow-400',
      glow: 'shadow-yellow-500/50',
      border: 'border-yellow-400/30'
    }
  }[primaryColor] || {
    primary: 'from-gray-400 via-slate-400 to-zinc-400',
    secondary: 'from-gray-600 via-slate-600 to-zinc-600',
    accent: 'bg-gradient-to-r from-gray-500 to-slate-500',
    text: 'text-gray-400',
    glow: 'shadow-gray-500/50',
    border: 'border-gray-400/30'
  };

  return (
    <section 
      ref={containerRef}
      id="hero" 
      className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-slate-900 to-black"
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0">
        <motion.div 
          className={`absolute inset-0 bg-gradient-to-br ${colorClasses.primary} opacity-20`}
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className={`absolute inset-0 bg-gradient-to-tl ${colorClasses.secondary} opacity-15`}
          animate={{
            scale: [1.1, 1, 1.1],
            rotate: [5, 0, 5],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Floating geometric shapes */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-32 h-32 bg-gradient-to-br ${colorClasses.primary} opacity-10 blur-xl`}
            style={{
              borderRadius: i % 2 === 0 ? '50%' : '20%',
              left: `${(i * 20) % 100}%`,
              top: `${(i * 30) % 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 20, 0],
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 15 + i * 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 2,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <motion.div 
        className="relative z-10 flex items-center justify-center min-h-screen px-6"
        style={{ y: yTransform, opacity: opacityTransform }}
      >
        <div className="max-w-6xl mx-auto text-center">
          {/* Glassmorphism container */}
          <motion.div
            initial={animations ? { opacity: 0, y: 50, scale: 0.9 } : false}
            animate={animations ? { opacity: 1, y: 0, scale: 1 } : false}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-12 md:p-16 shadow-2xl"
          >
            {/* Sparkle decorations */}
            <div className="absolute -top-4 -right-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className={`w-8 h-8 ${colorClasses.text}`} />
              </motion.div>
            </div>
            
            <div className="absolute -bottom-4 -left-4">
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              >
                <Zap className={`w-6 h-6 ${colorClasses.text}`} />
              </motion.div>
            </div>

            {/* Headline with gradient text */}
            <motion.h1
              initial={animations ? { opacity: 0, y: 30 } : false}
              animate={animations ? { opacity: 1, y: 0 } : false}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight"
            >
              <span className={`bg-gradient-to-r ${colorClasses.primary} bg-clip-text text-transparent`}>
                {headline?.split(' ').map((word, index) => (
                  <motion.span
                    key={index}
                    initial={animations ? { opacity: 0, y: 20 } : false}
                    animate={animations ? { opacity: 1, y: 0 } : false}
                    transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                    className="inline-block mr-4"
                  >
                    {word}
                  </motion.span>
                ))}
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={animations ? { opacity: 0, y: 20 } : false}
              animate={animations ? { opacity: 1, y: 0 } : false}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-xl md:text-2xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              {subheadline}
            </motion.p>

            {/* CTA Buttons with glassmorphism */}
            <motion.div
              initial={animations ? { opacity: 0, y: 20 } : false}
              animate={animations ? { opacity: 1, y: 0 } : false}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            >
              {/* Primary CTA */}
              {showAppointments ? (
                <Link 
                  to="/book-appointment"
                  className={`group relative px-10 py-4 ${colorClasses.accent} text-white font-semibold rounded-2xl ${colorClasses.glow} shadow-2xl transition-all duration-300 transform hover:scale-110 hover:shadow-3xl overflow-hidden`}
                >
                  <span className="relative z-10 flex items-center gap-3">
                    Book Now
                    <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ) : (
                <a 
                  href="#contact"
                  className={`group relative px-10 py-4 ${colorClasses.accent} text-white font-semibold rounded-2xl ${colorClasses.glow} shadow-2xl transition-all duration-300 transform hover:scale-110 hover:shadow-3xl overflow-hidden`}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <span className="relative z-10 flex items-center gap-3">
                    {ctaText || "Get Started"}
                    <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              )}

              {/* Secondary CTA */}
              <a 
                href={secondaryCtaUrl || "#about"}
                className={`group px-10 py-4 backdrop-blur-md bg-white/10 border-2 ${colorClasses.border} text-white font-semibold rounded-2xl hover:bg-white/20 transition-all duration-300 transform hover:scale-105`}
              >
                <span className="flex items-center gap-3">
                  {secondaryCtaText || "Learn More"}
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </a>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Animated scroll indicator */}
      <motion.div
        initial={animations ? { opacity: 0, y: 20 } : false}
        animate={animations ? { opacity: 1, y: 0 } : false}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div 
          className="flex flex-col items-center gap-3"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className={`w-6 h-10 border-2 ${colorClasses.border} rounded-full flex justify-center`}>
            <motion.div 
              className={`w-1 h-3 ${colorClasses.accent} rounded-full mt-2`}
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          <span className="text-white/60 text-xs font-medium tracking-wider uppercase">Scroll</span>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default HeroSection;
