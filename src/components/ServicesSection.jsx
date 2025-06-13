import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as LucideIcons from 'lucide-react';

function ServicesSection({ 
  title, 
  description,
  items, 
  primaryColor,
  ctaText,
  ctaLink,
  layoutStyle = 'cards'
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [selectedService, setSelectedService] = useState(null);

  const palette = {
    pink: { 
      border: 'border-pink-200', 
      gradient: 'from-pink-500 to-rose-500', 
      iconBg: 'bg-pink-100', 
      icon: 'text-pink-600',
      glow: 'shadow-pink-500/20',
      lightBg: 'bg-pink-50',
      darkBg: 'bg-pink-900',
      textActive: 'text-pink-700'
    },
    purple: { 
      border: 'border-purple-200', 
      gradient: 'from-purple-500 to-indigo-500', 
      iconBg: 'bg-purple-100', 
      icon: 'text-purple-600',
      glow: 'shadow-purple-500/20',
      lightBg: 'bg-purple-50',
      darkBg: 'bg-purple-900',
      textActive: 'text-purple-700'
    },
    blue: { 
      border: 'border-blue-200', 
      gradient: 'from-blue-500 to-cyan-500', 
      iconBg: 'bg-blue-100', 
      icon: 'text-blue-600',
      glow: 'shadow-blue-500/20',
      lightBg: 'bg-blue-50',
      darkBg: 'bg-blue-900',
      textActive: 'text-blue-700'
    },
    green: { 
      border: 'border-green-200', 
      gradient: 'from-green-500 to-emerald-500', 
      iconBg: 'bg-green-100', 
      icon: 'text-green-600',
      glow: 'shadow-green-500/20',
      lightBg: 'bg-green-50',
      darkBg: 'bg-green-900',
      textActive: 'text-green-700'
    }
  };
  
  const color = palette[primaryColor] ?? palette.pink;

  // Dynamic card variants for interactive animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 12 }
    }
  };

  const detailsVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { 
      opacity: 1,
      height: 'auto',
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  // Handler for service selection
  const toggleServiceDetails = (index) => {
    setSelectedService(selectedService === index ? null : index);
  };

  return (
    <section id='services' className='relative py-24 bg-gradient-to-b from-gray-50 to-white'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Header section with animated title */}
        <motion.div 
          className='text-center mb-16'
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className='text-4xl md:text-5xl font-bold text-gray-900 mb-4'>{title}</h2>
          <motion.div 
            className={`h-1 w-24 mx-auto bg-gradient-to-r ${color.gradient} rounded-full mb-6`}
            initial={{ width: 0, opacity: 0 }}
            whileInView={{ width: 96, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
          <motion.p 
            className='text-xl text-gray-600 max-w-2xl mx-auto'
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {description || ''}
          </motion.p>
        </motion.div>

        {/* Interactive Services Display */}
        <motion.div 
          className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8'
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {items?.map((service, i) => {
            // Dynamic icon rendering from Lucide icon library
            const IconComponent = service.iconName && LucideIcons[service.iconName] 
              ? LucideIcons[service.iconName] 
              : LucideIcons.CircleDashed;
            
            const isActive = selectedService === i;
            const isHovered = hoveredIndex === i;
            
            return (
              <motion.div 
                key={i}
                variants={cardVariants}
                className="relative"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => toggleServiceDetails(i)}
              >
                {/* Glass morphism card with interactive effects - FIX: Using CSS classes instead of animated backgrounds */}
                <motion.div 
                  className={`
                    relative cursor-pointer overflow-hidden rounded-2xl 
                    ${isActive ? 'bg-white/90 backdrop-blur-sm' : 'bg-white'} 
                    border ${isActive ? 'border-transparent' : color.border} 
                    shadow-lg transition-all duration-300
                    ${isActive ? `${color.glow} shadow-xl` : 'hover:shadow-xl'}
                  `}
                  animate={{
                    y: isHovered ? -5 : 0,
                    scale: isActive ? 1.02 : 1,
                  }}
                >
                  {/* Card content with hover effects */}
                  <div className="p-6 sm:p-8 z-10 relative">
                    {/* Icon container with 3D floating effect */}
                    <motion.div 
                      className={`relative rounded-2xl ${isActive ? 'bg-gradient-to-br '+color.gradient : color.iconBg} w-16 h-16 flex items-center justify-center mb-6`}
                      animate={{
                        y: isHovered ? -8 : 0,
                        rotateZ: isHovered ? -5 : 0,
                        boxShadow: isHovered ? '0 15px 30px -10px rgba(0, 0, 0, 0.2)' : '0 5px 10px -5px rgba(0, 0, 0, 0.1)'
                      }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    >
                      <IconComponent className={`w-8 h-8 ${isActive ? 'text-white' : color.icon}`} />
                      
                      {/* Energy particles that appear on hover */}
                      <AnimatePresence>
                        {isHovered && (
                          <>
                            {[...Array(5)].map((_, j) => (
                              <motion.div
                                key={`particle-${i}-${j}`}
                                className={`absolute w-1 h-1 rounded-full ${color.textActive}`}
                                initial={{ 
                                  opacity: 1, 
                                  x: 0, 
                                  y: 0,
                                  scale: 0
                                }}
                                animate={{ 
                                  opacity: 0,
                                  x: (Math.random() - 0.5) * 50,
                                  y: (Math.random() - 0.5) * 50,
                                  scale: Math.random() * 3 + 1
                                }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.8 + (j * 0.1) }}
                              />
                            ))}
                          </>
                        )}
                      </AnimatePresence>
                      
                      {/* Accent decorative element */}
                      <div className={`absolute -right-1 -top-1 w-3 h-3 rounded-full bg-gradient-to-r ${color.gradient}`}></div>
                    </motion.div>

                    <div className="relative z-10">
                      {/* Service title with animated underline on hover - FIX: Using className instead of animate */}
                      <div className="overflow-hidden mb-3">
                        <h3 
                          className={`text-xl font-bold inline-block transition-colors duration-300 ${
                            isActive ? color.textActive : 'text-gray-900'
                          }`}
                        >
                          {service.title}
                        </h3>
                        <motion.div 
                          className={`h-0.5 bg-gradient-to-r ${color.gradient}`}
                          initial={{ width: 0, opacity: 0 }}
                          animate={{ 
                            width: isHovered || isActive ? '100%' : '0%', 
                            opacity: isHovered || isActive ? 1 : 0 
                          }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      
                      {/* Service description with fade-in effect */}
                      <motion.p 
                        className={`text-gray-600 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-80'}`}
                      >
                        {service.description.length > 100 && !isActive
                          ? `${service.description.substring(0, 100)}...`
                          : service.description}
                      </motion.p>
                      
                      {/* Expandable content section */}
                      <AnimatePresence>
                        {isActive && (
                          <motion.div
                            variants={detailsVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            className="mt-4 pt-4 border-t border-gray-100"
                          >
                            {service.details && (
                              <ul className="space-y-2">
                                {service.details.map((detail, j) => (
                                  <motion.li 
                                    key={j}
                                    className="flex items-start"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: j * 0.1 }}
                                  >
                                    <LucideIcons.CheckCircle className={`w-5 h-5 ${color.icon} mt-1 mr-2 flex-shrink-0`} />
                                    <span>{detail}</span>
                                  </motion.li>
                                ))}
                              </ul>
                            )}
                            
                            {service.ctaText && (
                              <motion.a
                                href={service.ctaLink || '#'}
                                className={`inline-flex items-center gap-2 mt-4 text-sm font-medium ${color.icon}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                              >
                                <span>{service.ctaText}</span>
                                <LucideIcons.ArrowRight className="w-4 h-4" />
                              </motion.a>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  
                  {/* Interactive corner fold effect */}
                  <div 
                    className={`absolute right-0 top-0 w-16 h-16 transition-opacity ${isActive || isHovered ? 'opacity-100' : 'opacity-0'}`}
                    style={{
                      background: `linear-gradient(to bottom left, ${isActive ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.2)'} 50%, transparent 50%)`,
                      clipPath: 'polygon(100% 0, 100% 100%, 0 0)'
                    }}
                  >
                    <div 
                      className={`absolute right-2 top-2 text-xs w-6 h-6 flex items-center justify-center rounded-full ${isActive ? 'bg-gradient-to-br '+color.gradient+' text-white' : 'bg-white text-gray-500'}`}
                    >
                      {isActive ? <LucideIcons.Minus size={12} /> : <LucideIcons.Plus size={12} />}
                    </div>
                  </div>
                  
                  {/* Spotlight effect with CSS only - FIX: Using CSS transitions instead of animate */}
                  <div 
                    className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                    style={{
                      borderRadius: 'inherit',
                      backgroundImage: `radial-gradient(circle closest-side, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 100%)`,
                      width: '150%',
                      height: '150%',
                      left: '-25%',
                      top: '-25%',
                      transform: isHovered ? 'translate(25%, 25%)' : 'translate(0%, 0%)',
                      transition: 'transform 0.3s ease'
                    }}
                  />
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

export default ServicesSection;