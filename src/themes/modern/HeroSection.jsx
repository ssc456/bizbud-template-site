import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

function HeroSection({
  headline,
  subheadline,
  ctaText,
  ctaLink,
  primaryColor,
  secondaryColor,
  backgroundImage
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
    }
  }[primaryColor] || colorClasses.blue;

  return (
    <section id="hero" className="relative min-h-screen flex items-center">
      {/* Background with blur effect */}
      <div className="absolute inset-0 bg-gray-900 opacity-80 z-0"></div>
      
      {/* Background pattern */}
      <div className="absolute inset-0 z-0 opacity-20" 
        style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}}
      ></div>
      
      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left column with text content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-white"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100px" }}
              transition={{ duration: 1, delay: 0.2 }}
              className={`h-1 bg-gradient-to-r ${colorClasses.gradient} mb-8`}
            ></motion.div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              {headline}
            </h1>
            
            <p className="text-xl text-gray-300 mb-10">
              {subheadline}
            </p>
            
            <div className="flex flex-wrap gap-4">
              <motion.button
                onClick={() => {
                  if (ctaLink.startsWith('#')) {
                    const element = document.querySelector(ctaLink);
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  } else if (ctaLink === '/create') {
                    navigate('/create');
                  }
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className={`${colorClasses.button} px-8 py-4 rounded-lg font-medium flex items-center space-x-2`}
              >
                <span>{ctaText || "Get Started"}</span>
                <ChevronRight size={20} />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 text-white px-8 py-4 rounded-lg font-medium hover:bg-opacity-20 transition-all"
              >
                Learn More
              </motion.button>
            </div>
          </motion.div>
          
          {/* Right column with floating elements */}
          <div className="hidden lg:block relative">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative z-10"
            >
              <div className="relative">
                {/* Main shape */}
                <div className="w-full h-80 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-black opacity-50"></div>
                  
                  {/* Decorative elements */}
                  <div className={`absolute -top-10 -right-10 w-40 h-40 ${colorClasses.text} bg-opacity-10 rounded-full blur-2xl`}></div>
                  <div className={`absolute -bottom-10 -left-10 w-40 h-40 ${colorClasses.text} bg-opacity-10 rounded-full blur-2xl`}></div>
                  
                  {/* Content inside shape */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className={`${colorClasses.text} text-5xl font-bold mb-2 opacity-80`}>
                        <span className="sr-only">Icon</span>
                        ★
                      </div>
                      <h3 className="text-xl font-semibold">Premium Quality</h3>
                      <p className="text-sm text-gray-400 mt-2 max-w-xs mx-auto">
                        Our services are crafted with attention to detail and excellence
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Floating element 1 */}
                <motion.div
                  initial={{ x: -30, y: -30, opacity: 0 }}
                  animate={{ x: -60, y: -60, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  className={`absolute w-40 h-40 ${colorClasses.button} rounded-xl shadow-xl`}
                >
                  <div className="h-full flex items-center justify-center text-white">
                    <div className="text-center">
                      <div className="text-3xl font-bold">100%</div>
                      <div className="text-sm mt-1">Satisfaction</div>
                    </div>
                  </div>
                </motion.div>
                
                {/* Floating element 2 */}
                <motion.div
                  initial={{ x: 30, y: 30, opacity: 0 }}
                  animate={{ x: 60, y: 140, opacity: 1 }}
                  transition={{ delay: 0.9, duration: 0.8 }}
                  className="absolute w-40 h-40 bg-white rounded-xl shadow-xl"
                >
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className={`${colorClasses.text} text-3xl font-bold`}>24/7</div>
                      <div className="text-gray-600 text-sm mt-1">Support Available</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent"></div>
    </section>
  );
}

export default HeroSection;