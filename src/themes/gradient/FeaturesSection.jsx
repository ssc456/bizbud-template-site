import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Zap, Shield, Star, Rocket } from 'lucide-react';

function FeaturesSection({ title, description, items, primaryColor }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 360]);

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

  const getIcon = (index) => {
    const icons = [Zap, Shield, Star, Rocket];
    const IconComponent = icons[index % icons.length];
    return <IconComponent className="w-8 h-8 text-white" />;
  };

  return (
    <section ref={ref} className="py-32 relative overflow-hidden bg-gradient-to-br from-slate-900 via-black to-gray-900">
      {/* Parallax background elements */}
      <div className="absolute inset-0">
        <motion.div
          style={{ y }}
          className={`absolute top-20 left-10 w-64 h-64 bg-gradient-to-br ${colorClasses.primary} opacity-20 blur-3xl rounded-full`}
        />
        <motion.div
          style={{ y: useTransform(scrollYProgress, [0, 1], [-50, 50]), rotate }}
          className={`absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br ${colorClasses.primary} opacity-15 blur-3xl rounded-full`}
        />
        <motion.div
          style={{ y: useTransform(scrollYProgress, [0, 1], [50, -50]) }}
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br ${colorClasses.primary} opacity-10 blur-3xl rounded-full`}
        />
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

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-12">
            {items?.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.8, 
                  delay: index * 0.2,
                  type: "spring",
                  bounce: 0.4
                }}
                className="group relative"
              >
                {/* Hover glow effect */}
                <div className={`absolute -inset-2 bg-gradient-to-r ${colorClasses.secondary} opacity-0 group-hover:opacity-30 blur-2xl transition-opacity duration-700 rounded-3xl`} />
                
                <motion.div 
                  className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-10 h-full hover:bg-white/15 transition-all duration-500"
                  whileHover={{ 
                    scale: 1.02,
                    rotateY: 5,
                    rotateX: 5
                  }}
                  style={{ perspective: 1000 }}
                >
                  
                  {/* Floating geometric shape */}
                  <motion.div
                    className="absolute -top-4 -right-4 w-20 h-20 opacity-20"
                    animate={{ 
                      rotate: 360,
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ 
                      rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                      scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                    }}
                  >
                    <div className={`w-full h-full bg-gradient-to-br ${colorClasses.primary} blur-sm rounded-2xl`} />
                  </motion.div>

                  <div className="flex items-start gap-6">
                    {/* Icon */}
                    <motion.div
                      className={`w-20 h-20 ${colorClasses.accent} rounded-2xl flex items-center justify-center ${colorClasses.glow} shadow-xl flex-shrink-0 group-hover:scale-110 transition-transform`}
                      whileHover={{ rotate: 15 }}
                    >
                      {feature.icon ? (
                        typeof feature.icon === 'string' ? (
                          <div className="text-2xl text-white">{feature.icon}</div>
                        ) : (
                          feature.icon
                        )
                      ) : (
                        getIcon(index)
                      )}
                    </motion.div>

                    <div className="flex-1 space-y-4">
                      <h3 className="text-2xl font-bold text-white group-hover:text-white/90 transition-colors">
                        {feature.title || feature.name}
                      </h3>
                      
                      <p className="text-white/70 leading-relaxed text-lg">
                        {feature.description}
                      </p>

                      {/* Progress indicator or additional detail */}
                      <motion.div
                        className="pt-4"
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                      >
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full bg-gradient-to-r ${colorClasses.secondary} rounded-full`}
                            initial={{ width: 0 }}
                            whileInView={{ width: '100%' }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.7 + index * 0.1, duration: 1 }}
                          />
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;
