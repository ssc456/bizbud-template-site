import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

function ServicesSection({ title, description, items, primaryColor }) {
  // Bold gradient color mapping
  const colorClasses = {
    pink: {
      primary: 'from-pink-400 via-rose-400 to-red-400',
      secondary: 'from-pink-500 to-rose-500',
      accent: 'bg-gradient-to-r from-pink-500 to-rose-500',
      text: 'text-pink-400',
      glow: 'shadow-pink-500/50',
      border: 'border-pink-400/30'
    },
    purple: {
      primary: 'from-purple-400 via-violet-400 to-indigo-400',
      secondary: 'from-purple-500 to-violet-500',
      accent: 'bg-gradient-to-r from-purple-500 to-violet-500',
      text: 'text-purple-400',
      glow: 'shadow-purple-500/50',
      border: 'border-purple-400/30'
    },
    blue: {
      primary: 'from-blue-400 via-cyan-400 to-teal-400',
      secondary: 'from-blue-500 to-cyan-500',
      accent: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      text: 'text-blue-400',
      glow: 'shadow-blue-500/50',
      border: 'border-blue-400/30'
    },
    green: {
      primary: 'from-green-400 via-emerald-400 to-teal-400',
      secondary: 'from-green-500 to-emerald-500',
      accent: 'bg-gradient-to-r from-green-500 to-emerald-500',
      text: 'text-green-400',
      glow: 'shadow-green-500/50',
      border: 'border-green-400/30'
    },
    red: {
      primary: 'from-red-400 via-rose-400 to-pink-400',
      secondary: 'from-red-500 to-rose-500',
      accent: 'bg-gradient-to-r from-red-500 to-rose-500',
      text: 'text-red-400',
      glow: 'shadow-red-500/50',
      border: 'border-red-400/30'
    },
    yellow: {
      primary: 'from-yellow-400 via-amber-400 to-orange-400',
      secondary: 'from-yellow-500 to-amber-500',
      accent: 'bg-gradient-to-r from-yellow-500 to-amber-500',
      text: 'text-yellow-400',
      glow: 'shadow-yellow-500/50',
      border: 'border-yellow-400/30'
    }
  }[primaryColor] || {
    primary: 'from-gray-400 via-slate-400 to-zinc-400',
    secondary: 'from-gray-500 to-slate-500',
    accent: 'bg-gradient-to-r from-gray-500 to-slate-500',
    text: 'text-gray-400',
    glow: 'shadow-gray-500/50',
    border: 'border-gray-400/30'
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 60,
      rotateX: -15
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        type: "spring",
        bounce: 0.4,
        duration: 0.8
      }
    }
  };

  return (
    <section id="services" className="py-32 relative overflow-hidden bg-gradient-to-br from-black via-gray-900 to-slate-900">
      {/* Dynamic background patterns */}
      <div className="absolute inset-0">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-72 h-72 bg-gradient-to-br ${colorClasses.primary} opacity-10 blur-3xl rounded-full`}
            style={{
              left: `${(i * 20) % 100}%`,
              top: `${(i * 30) % 100}%`,
            }}
            animate={{
              scale: [1, 1.5, 1],
              rotate: [0, 180, 360],
              x: [0, 100, 0],
            }}
            transition={{
              duration: 25 + i * 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 2,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <motion.h2 
              className="text-5xl md:text-6xl font-bold mb-8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <span className={`bg-gradient-to-r ${colorClasses.primary} bg-clip-text text-transparent`}>
                {title}
              </span>
            </motion.h2>
            
            <motion.p 
              className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {description}
            </motion.p>
          </motion.div>

          {/* Services Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {items?.map((service, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                className="group relative"
                whileHover={{ y: -10, scale: 1.02 }}
                transition={{ type: "spring", bounce: 0.4 }}
              >
                {/* Glow effect */}
                <div className={`absolute -inset-1 bg-gradient-to-r ${colorClasses.secondary} opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-500 rounded-3xl`} />
                
                <div className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 h-full hover:bg-white/15 transition-all duration-500">
                  
                  {/* Floating sparkles */}
                  <motion.div
                    className="absolute top-4 right-4"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className={`w-6 h-6 ${colorClasses.text} opacity-60`} />
                  </motion.div>

                  {/* Service Icon */}
                  <motion.div
                    className={`w-20 h-20 ${colorClasses.accent} rounded-2xl flex items-center justify-center mb-6 ${colorClasses.glow} shadow-xl group-hover:scale-110 transition-transform`}
                    whileHover={{ rotate: 5 }}
                  >
                    {service.icon && (
                      <div className="w-10 h-10 text-white">
                        {typeof service.icon === 'string' ? (
                          <div className="text-2xl">{service.icon}</div>
                        ) : (
                          service.icon
                        )}
                      </div>
                    )}
                  </motion.div>

                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-white group-hover:text-white/90 transition-colors">
                      {service.title || service.name}
                    </h3>
                    
                    <p className="text-white/70 leading-relaxed">
                      {service.description}
                    </p>

                    {service.price && (
                      <motion.div
                        className="pt-4"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <div className={`text-3xl font-bold bg-gradient-to-r ${colorClasses.primary} bg-clip-text text-transparent`}>
                          {service.price}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  );
}

export default ServicesSection;
