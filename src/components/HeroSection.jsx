import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";

function HeroSection({
  headline,
  subheadline,
  ctaText,
  ctaLink,
  primaryColor,
  secondaryColor,
  backgroundImage,
  animations = true
}) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);
  
  // Split headline into words for animation
  const words = headline?.split(' ') || ["Welcome"];
  


  // Reveal animation
  useEffect(() => {
    setIsVisible(true);
  }, []);
  
  // Parallax scroll effect
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });
  
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const getColorClasses = (color) => {
    const colors = {
      pink: {
        gradient: 'from-pink-600 via-pink-500 to-rose-500',
        button: 'bg-pink-600 hover:bg-pink-700',
        accent: 'text-pink-300',
        glow: 'shadow-pink-500/30'
      },
      purple: {
        gradient: 'from-purple-600 via-purple-500 to-indigo-500',
        button: 'bg-purple-600 hover:bg-purple-700',
        accent: 'text-purple-300',
        glow: 'shadow-purple-500/30'
      },
      blue: {
        gradient: 'from-blue-600 via-blue-500 to-cyan-500',
        button: 'bg-blue-600 hover:bg-blue-700',
        accent: 'text-blue-300',
        glow: 'shadow-blue-500/30'
      },
      green: {
        gradient: 'from-green-600 via-emerald-500 to-teal-500',
        button: 'bg-green-600 hover:bg-green-700',
        accent: 'text-green-300',
        glow: 'shadow-green-500/30'
      }
    };
    return colors[color] || colors.pink;
  };

  const colorClasses = getColorClasses(primaryColor);
  const secondaryColorClasses = getColorClasses(secondaryColor || primaryColor);

  const handleCTAClick = (e) => {
    e.preventDefault();
    const element = document.querySelector(ctaLink);
    if (element) {
      const headerHeight = 80;
      const elementPosition = element.offsetTop - headerHeight;
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  };

const scrollToNext = () => {
  const nextSection = document.querySelector('#about') || document.querySelector('section:not(#hero)');
  if (nextSection) {
    const headerHeight = 80;
    const elementPosition = nextSection.offsetTop - headerHeight;
    window.scrollTo({
      top: elementPosition,
      behavior: 'smooth' // This uses native smooth scrolling
    });
  }
};

  return (
    <section 
      id="hero" 
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Dynamic background with parallax */}
      <motion.div 
        className="absolute inset-0"
        style={{ y: backgroundY }}
      >
        {backgroundImage ? (
          <>
            <img 
              src={backgroundImage}
              alt="Hero background"
              className="w-full h-full object-cover scale-110"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses.gradient} opacity-80`} />
          </>
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses.gradient}`} />
        )}
        
        {/* Enhanced animated background elements with more organic shapes */}
        <div className="absolute inset-0 opacity-30">
          {/* Animated blob 1 */}
          <div className="absolute top-1/4 left-1/4 w-[30vw] h-[30vw] rounded-[60%_40%_30%_70%/60%_30%_70%_40%] bg-white mix-blend-overlay filter blur-xl animate-blob" />
          
          {/* Animated blob 2 */}
          <div className="absolute top-2/3 right-1/4 w-[35vw] h-[35vw] rounded-[40%_60%_70%_30%/40%_50%_60%_50%] bg-white mix-blend-overlay filter blur-xl animate-blob animation-delay-2000" />
          
          {/* Animated blob 3 */}
          <div className="absolute bottom-1/4 left-1/3 w-[25vw] h-[25vw] rounded-[50%_50%_40%_60%/60%_60%_30%_40%] bg-white mix-blend-overlay filter blur-xl animate-blob animation-delay-4000" />
        </div>
      </motion.div>

      {/* Content with motion effects */}
      <motion.div 
        className="relative z-10 w-full max-w-6xl mx-auto px-6 py-16"
        style={{ y: textY, opacity }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
          {/* Hero content column */}
          <div className="lg:col-span-3">
            <div className={`backdrop-blur-sm bg-black/10 p-8 sm:p-12 rounded-3xl border border-white/10 shadow-2xl`}>
              {/* Animated headline words */}
              <h1 className="mb-6 leading-tight">
                {words.map((word, i) => (
                  <motion.span
                    key={i}
                    className={`inline-block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mr-3 md:mr-5`}
                    initial={{ opacity: 0, y: 30 }}
                    animate={isVisible ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: i * 0.1 + 0.2 }}
                  >
                    {word}
                  </motion.span>
                ))}
              </h1>
              
              {/* Animated accent line */}
              <motion.div 
                className={`h-1 w-24 bg-gradient-to-r ${secondaryColorClasses.gradient} rounded-full mb-8`}
                initial={{ width: 0, opacity: 0 }}
                animate={isVisible ? { width: 96, opacity: 1 } : {}}
                transition={{ duration: 0.8, delay: 0.5 }}
              />
              
              {/* Subheadline with fade in */}
              <motion.p 
                className="text-lg sm:text-xl md:text-2xl text-gray-100 mb-12 max-w-2xl leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                {subheadline || ""}
              </motion.p>
              
              {/* CTA buttons with enhanced effects */}
              <motion.div 
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.9 }}
              >
                <button
                  onClick={handleCTAClick}
                  className={`group px-8 py-4 ${colorClasses.button} text-white font-semibold rounded-full shadow-xl hover:shadow-2xl ${colorClasses.glow} transform hover:scale-105 transition-all duration-300 flex items-center space-x-2`}
                >
                  <motion.span
                    initial={{ x: 0 }}
                    whileHover={{ x: 4 }}
                  >
                    {ctaText || "Get Started"}
                  </motion.span>
                  <ChevronDown size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button
                  onClick={scrollToNext}
                  className="px-8 py-4 backdrop-blur-sm bg-white/20 border border-white/50 text-white font-semibold rounded-full hover:bg-white/30 transition-all duration-300"
                >
                  Learn More
                </button>
              </motion.div>
            </div>
          </div>
          
          {/* Optional decorative column (could be added by config for more layouts) */}
          <div className="hidden lg:block lg:col-span-2">
            <div className="relative">
              {/* Decorative floating elements here if needed */}
              <div className={`w-32 h-32 rounded-full ${colorClasses.button} opacity-20 absolute -top-6 -left-10 animate-float`}></div>
              <div className={`w-24 h-24 rounded-full ${secondaryColorClasses.button} opacity-30 absolute top-40 right-0 animate-float animation-delay-2000`}></div>
              <div className="w-40 h-40 rounded-3xl border border-white/20 backdrop-blur-xl bg-white/5 rotate-12 absolute top-20 left-12 animate-float animation-delay-1000"></div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Enhanced scroll indicator */}
      <motion.div 
        className="absolute bottom-12 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0, y: -20 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 1.2 }}
      >
        <button
          onClick={scrollToNext}
          className="relative p-4 overflow-hidden group"
        >
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <ChevronDown size={32} className="text-white animate-pulse" />
        </button>
      </motion.div>

      {/* Enhanced decorative gradient at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-white via-white/80 to-transparent" />
    </section>
  );
}

export default HeroSection;