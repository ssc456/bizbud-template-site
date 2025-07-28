import { motion } from 'framer-motion';
import { useState } from 'react';
import { Eye, X, ChevronLeft, ChevronRight } from 'lucide-react';

function GallerySection({ title, description, images, primaryColor }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

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

  const galleryImages = images || [
    { src: 'https://picsum.photos/400/300?random=1', alt: 'Gallery Image 1' },
    { src: 'https://picsum.photos/400/500?random=2', alt: 'Gallery Image 2' },
    { src: 'https://picsum.photos/400/400?random=3', alt: 'Gallery Image 3' },
    { src: 'https://picsum.photos/400/350?random=4', alt: 'Gallery Image 4' },
    { src: 'https://picsum.photos/400/450?random=5', alt: 'Gallery Image 5' },
    { src: 'https://picsum.photos/400/380?random=6', alt: 'Gallery Image 6' },
  ];

  const openLightbox = (image, index) => {
    setSelectedImage(image);
    setCurrentIndex(index);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const nextImage = () => {
    const nextIndex = (currentIndex + 1) % galleryImages.length;
    setCurrentIndex(nextIndex);
    setSelectedImage(galleryImages[nextIndex]);
  };

  const prevImage = () => {
    const prevIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
    setCurrentIndex(prevIndex);
    setSelectedImage(galleryImages[prevIndex]);
  };

  return (
    <section className="py-32 relative overflow-hidden bg-gradient-to-br from-black via-slate-900 to-gray-900">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-80 h-80 bg-gradient-to-br ${colorClasses.primary} opacity-5 blur-3xl rounded-full`}
            style={{
              left: `${(i * 22) % 100}%`,
              top: `${(i * 35) % 100}%`,
            }}
            animate={{
              scale: [1, 1.4, 1],
              x: [0, 60, 0],
              y: [0, -40, 0],
            }}
            transition={{
              duration: 18 + i * 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 2.5,
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

          {/* Gallery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryImages.map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.8, 
                  delay: index * 0.1,
                  type: "spring",
                  bounce: 0.4
                }}
                className="group relative cursor-pointer"
                onClick={() => openLightbox(image, index)}
              >
                {/* Glow effect */}
                <div className={`absolute -inset-1 bg-gradient-to-r ${colorClasses.secondary} opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-500 rounded-2xl`} />
                
                <motion.div 
                  className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-3 overflow-hidden"
                  whileHover={{ scale: 1.02, y: -5 }}
                  transition={{ type: "spring", bounce: 0.4 }}
                >
                  <div className="relative overflow-hidden rounded-xl">
                    <img
                      src={image.src || image}
                      alt={image.alt || `Gallery image ${index + 1}`}
                      className="w-full h-80 object-cover transition-transform duration-700 group-hover:scale-110"
                      style={{
                        height: index % 3 === 1 ? '320px' : index % 3 === 2 ? '400px' : '280px'
                      }}
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* View Icon */}
                    <motion.div
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      whileHover={{ scale: 1.1 }}
                    >
                      <div className={`w-16 h-16 ${colorClasses.accent} rounded-full flex items-center justify-center ${colorClasses.glow} shadow-xl`}>
                        <Eye className="w-8 h-8 text-white" />
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <motion.button
            className="absolute top-6 right-6 w-12 h-12 bg-white/10 border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={closeLightbox}
          >
            <X className="w-6 h-6" />
          </motion.button>

          {/* Navigation buttons */}
          <motion.button
            className="absolute left-6 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/10 border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
          >
            <ChevronLeft className="w-6 h-6" />
          </motion.button>

          <motion.button
            className="absolute right-6 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/10 border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
          >
            <ChevronRight className="w-6 h-6" />
          </motion.button>

          {/* Image */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.4 }}
            className="max-w-5xl max-h-[80vh] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage.src || selectedImage}
              alt={selectedImage.alt || 'Gallery image'}
              className="w-full h-full object-contain rounded-2xl"
            />
          </motion.div>

          {/* Image counter */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-white">
            {currentIndex + 1} / {galleryImages.length}
          </div>
        </motion.div>
      )}
    </section>
  );
}

export default GallerySection;
