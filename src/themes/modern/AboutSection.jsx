import { motion } from 'framer-motion';

function AboutSection({ title, description, image, primaryColor, logoUrl }) {
  // Color mapping
  const colorClasses = {
    pink: {
      accent: 'text-pink-500',
      gradient: 'from-pink-500 to-rose-400',
      light: 'bg-pink-50',
      border: 'border-pink-200'
    },
    purple: {
      accent: 'text-purple-500',
      gradient: 'from-purple-500 to-indigo-400',
      light: 'bg-purple-50',
      border: 'border-purple-200'
    },
    blue: {
      accent: 'text-blue-500',
      gradient: 'from-blue-500 to-cyan-400',
      light: 'bg-blue-50',
      border: 'border-blue-200'
    },
    green: {
      accent: 'text-green-500',
      gradient: 'from-green-500 to-emerald-400',
      light: 'bg-green-50',
      border: 'border-green-200'
    }
  }[primaryColor] || colorClasses.blue;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <section id="about" className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Image Section */}
          <motion.div 
            className="w-full lg:w-1/2 order-2 lg:order-1"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative">
              {/* Background decoration */}
              <div className={`absolute -top-6 -left-6 w-full h-full ${colorClasses.light} rounded-3xl -z-10 transform -rotate-3`}></div>
              <div className={`absolute -bottom-6 -right-6 w-full h-full border-2 ${colorClasses.border} rounded-3xl -z-10 transform rotate-3`}></div>
              
              {/* Main image */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                {logoUrl ? (
                  <img 
                    src={logoUrl} 
                    alt={title} 
                    className="w-full h-auto object-cover rounded-2xl" 
                  />
                ) : (
                  <div className={`w-full h-80 bg-gradient-to-br ${colorClasses.gradient}`}>
                    <div className="flex items-center justify-center h-full text-white text-opacity-20 text-9xl font-bold">
                      ABOUT
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
          
          {/* Content Section */}
          <motion.div 
            className="w-full lg:w-1/2 order-1 lg:order-2"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <motion.div variants={item}>
              <div className={`h-1 w-20 bg-gradient-to-r ${colorClasses.gradient} mb-6`}></div>
            </motion.div>
            
            <motion.h2 
              variants={item}
              className="text-4xl font-bold mb-6 text-gray-900"
            >
              {title}
            </motion.h2>
            
            <motion.div 
              variants={item}
              className="prose prose-lg text-gray-600 max-w-none"
              dangerouslySetInnerHTML={{ __html: description?.replace(/\n/g, '<br>') || '' }}
            />
            
            <motion.div variants={item} className="mt-10">
              <button className={`px-6 py-3 rounded-lg font-medium bg-gradient-to-r ${colorClasses.gradient} text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all`}>
                Learn More
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;