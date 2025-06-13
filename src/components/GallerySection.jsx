import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, ZoomIn, ExternalLink } from 'lucide-react';

function GallerySection({ 
  title, 
  subtitle, 
  images = [], 
  primaryColor, 
  layout = 'masonry', // 'masonry', 'grid', or 'feature'
  maxImages = 9,
  viewAllLink
}) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isHovering, setIsHovering] = useState(null);
  const galleryRef = useRef(null);
  
  const displayImages = images.slice(0, maxImages);
  const hasMore = images.length > maxImages;
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { 
        type: "spring",
        bounce: 0.3
      }
    }
  };
  
  const colorClasses = {
    pink: {
      accent: 'text-pink-600',
      gradient: 'from-pink-600 to-rose-500',
      border: 'border-pink-200',
      overlay: 'bg-pink-900/70',
      button: 'bg-pink-600 hover:bg-pink-700',
      glow: 'shadow-pink-500/20'
    },
    purple: {
      accent: 'text-purple-600',
      gradient: 'from-purple-600 to-indigo-500',
      border: 'border-purple-200',
      overlay: 'bg-purple-900/70',
      button: 'bg-purple-600 hover:bg-purple-700',
      glow: 'shadow-purple-500/20'
    },
    blue: {
      accent: 'text-blue-600',
      gradient: 'from-blue-600 to-cyan-500',
      border: 'border-blue-200', 
      overlay: 'bg-blue-900/70',
      button: 'bg-blue-600 hover:bg-blue-700',
      glow: 'shadow-blue-500/20'
    },
    green: {
      accent: 'text-green-600',
      gradient: 'from-green-600 to-emerald-500', 
      border: 'border-green-200',
      overlay: 'bg-green-900/70',
      button: 'bg-green-600 hover:bg-green-700',
      glow: 'shadow-green-500/20'
    }
  };
  
  const colors = colorClasses[primaryColor] || colorClasses.blue;
  
  // Function to generate random height for masonry layout
  const getRandomHeight = (index) => {
    const heights = ['h-64', 'h-80', 'h-72'];
    return heights[index % heights.length];
  };
  
  return (
    <section id="gallery" className="py-24 px-6 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 -right-20 w-80 h-80 rounded-full bg-gradient-to-br from-transparent to-gray-200 blur-3xl"></div>
        <div className="absolute bottom-1/4 -left-20 w-80 h-80 rounded-full bg-gradient-to-br from-transparent to-gray-200 blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header with animation */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <motion.h2 
            className={`text-4xl md:text-5xl font-bold mb-4 ${colors.accent}`}
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {title}
          </motion.h2>
          
          <motion.div 
            className={`h-1 w-24 mx-auto bg-gradient-to-r ${colors.gradient} rounded-full mb-6`}
            initial={{ width: 0, opacity: 0 }}
            whileInView={{ width: 96, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
          
          {subtitle && (
            <motion.p
              className="text-lg text-gray-600 mb-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {subtitle}
            </motion.p>
          )}
        </div>
        
        {/* Gallery grid with staggered animation */}
        <motion.div 
          ref={galleryRef}
          className={`grid gap-6 sm:gap-8 ${
            layout === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
              : layout === 'feature'
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-min'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
          }`}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {displayImages.map((image, i) => {
            // Support for both string images and object images with metadata
            const src = typeof image === 'string' ? image : image.src;
            const alt = typeof image === 'string' ? `Gallery image ${i+1}` : image.alt || `Gallery image ${i+1}`;
            const title = typeof image === 'string' ? null : image.title;
            const description = typeof image === 'string' ? null : image.description;
            
            // Special layout for featured image in feature layout
            const isFeature = layout === 'feature' && i === 0;
            
            return (
              <motion.div
                key={i}
                variants={itemVariants}
                className={`relative group ${
                  isFeature ? 'md:col-span-2 md:row-span-2' : ''
                }`}
                onMouseEnter={() => setIsHovering(i)}
                onMouseLeave={() => setIsHovering(null)}
                onClick={() => setSelectedImage({src, alt, title, description})}
              >
                <div 
                  className={`rounded-xl overflow-hidden cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 ${colors.glow} ${
                    layout === 'masonry' && !isFeature ? getRandomHeight(i) : 'h-64 md:h-80'
                  } ${isFeature ? 'md:h-[500px]' : ''}`}
                >
                  {/* Image with skeleton loading state */}
                  <div className="relative w-full">
                    <img 
                      src={src} 
                      alt={alt}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ease-in-out"
                    />
                  </div>
                  
                  {/* Overlay that appears on hover */}
                  <div className={`absolute inset-0 ${colors.overlay} opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6`}>
                    <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      {title && (
                        <h3 className="text-white text-xl font-bold mb-2">{title}</h3>
                      )}
                      {description && (
                        <p className="text-white/90 line-clamp-2 text-sm">{description}</p>
                      )}
                    </div>
                    
                    <div className="flex justify-end mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                      <motion.button 
                        className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white hover:text-gray-900 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <ZoomIn size={18} />
                      </motion.button>
                    </div>
                  </div>
                </div>
                
                {/* Floating indicator that appears when hovering (outside image) */}
                <motion.div
                  className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 pointer-events-none`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ 
                    opacity: isHovering === i ? 1 : 0,
                    y: isHovering === i ? 0 : 10
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${colors.gradient}`}></div>
                </motion.div>
              </motion.div>
            );
          })}
          
          {/* "Show more" placeholder if there are more images than we're showing */}
          {hasMore && viewAllLink && (
            <motion.div
              variants={itemVariants}
              className="relative group"
            >
              <a 
                href={viewAllLink}
                className={`h-64 md:h-80 rounded-xl overflow-hidden cursor-pointer flex items-center justify-center ${colors.overlay} bg-opacity-30 hover:bg-opacity-50 transition-all duration-300 border-2 border-dashed ${colors.border}`}
              >
                <div className="text-center">
                  <span className={`${colors.accent} text-xl font-semibold block mb-2`}>
                    +{images.length - maxImages}
                  </span>
                  <span className="text-gray-600">View all</span>
                </div>
              </a>
            </motion.div>
          )}
        </motion.div>
        
        {/* Lightbox modal for full-screen image viewing */}
        {selectedImage && (
          <motion.div 
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 md:p-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
          >
            <motion.div 
              className="absolute top-4 right-4 md:top-8 md:right-8"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <button 
                className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                onClick={() => setSelectedImage(null)}
              >
                <X size={20} />
              </button>
            </motion.div>
            
            <motion.div 
              className="bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden max-w-5xl w-full max-h-[80vh] relative"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", bounce: 0.2 }}
            >
              <div className="relative w-full h-full">
                <img 
                  src={selectedImage.src} 
                  alt={selectedImage.alt} 
                  className="w-full max-h-[80vh] object-contain"
                />
                
                {/* Image metadata in lightbox */}
                {(selectedImage.title || selectedImage.description) && (
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                    {selectedImage.title && (
                      <h3 className="text-white text-xl font-bold mb-2">{selectedImage.title}</h3>
                    )}
                    {selectedImage.description && (
                      <p className="text-white/90">{selectedImage.description}</p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
            
            <motion.div 
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-white/50 text-sm">Click outside to close</p>
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  );
}

export default GallerySection;