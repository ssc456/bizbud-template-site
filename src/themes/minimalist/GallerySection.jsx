import { motion } from 'framer-motion';
import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Camera } from 'lucide-react';

// Component for handling image loading with fallback
function GalleryImage({ src, alt, title, description, colors, className, isPlaceholder = false, onClick }) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(!isPlaceholder && src);

  const handleImageLoad = () => setIsLoading(false);
  const handleImageError = () => { setIsLoading(false); setHasError(true); };
  
  const showPlaceholder = isPlaceholder || !src || hasError || src === 'PLACEHOLDER' || src.includes('placeholder');

  if (showPlaceholder) {
    return (
      <div className={`${className} ${colors.light} flex flex-col items-center justify-center text-gray-400 cursor-not-allowed`}>
        <Camera size={24} className="mb-2 opacity-60" />
        <span className="text-sm font-light opacity-70 text-center px-2">{title || 'Gallery Image'}</span>
      </div>
    );
  }

  return (
    <div className={`${className} relative overflow-hidden cursor-pointer`} onClick={onClick}>
      {isLoading && (
        <div className={`absolute inset-0 ${colors.light} flex items-center justify-center`}>
          <div className="animate-spin rounded-full h-6 w-6 border border-gray-300 border-t-transparent"></div>
        </div>
      )}
      <img src={src} alt={alt} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
           onLoad={handleImageLoad} onError={handleImageError} style={{ display: isLoading ? 'none' : 'block' }} />
    </div>
  );
}

function GallerySection({ title, images, primaryColor }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Process images to detect placeholders
  const processedImages = (images || []).map((image, index) => {
    const src = image?.src;
    const isPlaceholder = !src || src === 'PLACEHOLDER' || src.includes('placeholder') || src.includes('example.com');
    return {
      ...image, alt: image?.alt || `Gallery image ${index + 1}`, title: image?.title || `Gallery Item ${index + 1}`,
      description: image?.description || '', isPlaceholder
    };
  });

  const validImages = processedImages.filter(img => !img.isPlaceholder);

  // Minimalist color mapping
  const colorClasses = {
    pink: {
      accent: 'bg-rose-500',
      text: 'text-rose-500',
      light: 'bg-rose-50'
    },
    purple: {
      accent: 'bg-purple-500',
      text: 'text-purple-500',
      light: 'bg-purple-50'
    },
    blue: {
      accent: 'bg-blue-500',
      text: 'text-blue-500',
      light: 'bg-blue-50'
    },
    green: {
      accent: 'bg-emerald-500',
      text: 'text-emerald-500',
      light: 'bg-emerald-50'
    },
    red: {
      accent: 'bg-red-500',
      text: 'text-red-500',
      light: 'bg-red-50'
    },
    yellow: {
      accent: 'bg-amber-500',
      text: 'text-amber-500',
      light: 'bg-amber-50'
    }
  }[primaryColor] || {
    accent: 'bg-gray-900',
    text: 'text-gray-900',
    light: 'bg-gray-50'
  };

  const openLightbox = (image, index) => {
    if (!image.isPlaceholder) {
      setSelectedImage(image);
      const validIndex = validImages.findIndex(validItem => validItem === image);
      setSelectedIndex(validIndex);
    }
  };

  const closeLightbox = () => setSelectedImage(null);
  const nextImage = () => {
    const nextIndex = (selectedIndex + 1) % validImages.length;
    setSelectedImage(validImages[nextIndex]);
    setSelectedIndex(nextIndex);
  };
  const prevImage = () => {
    const prevIndex = (selectedIndex - 1 + validImages.length) % validImages.length;
    setSelectedImage(validImages[prevIndex]);
    setSelectedIndex(prevIndex);
  };

  return (
    <section id="gallery" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {/* Section indicator */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className={`w-12 h-0.5 ${colorClasses.accent}`} />
              <span className="text-sm font-medium text-gray-500 tracking-wider uppercase">Gallery</span>
              <div className={`w-12 h-0.5 ${colorClasses.accent}`} />
            </div>
            
            <h2 className="text-4xl md:text-5xl font-light text-gray-900 leading-tight">
              {title}
            </h2>
          </motion.div>
          
          {/* Gallery Grid */}
          {processedImages && processedImages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {processedImages.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`group ${!item.isPlaceholder ? 'cursor-pointer' : ''}`}
                  onClick={() => openLightbox(item, index)}
                >
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    <GalleryImage 
                      src={item.src}
                      alt={item.alt}
                      title={item.title}
                      description={item.description}
                      isPlaceholder={item.isPlaceholder}
                      colors={colorClasses}
                      className="w-full h-full"
                      onClick={() => openLightbox(item, index)}
                    />
                    
                    {/* Minimalist overlay - only for real images */}
                    {!item.isPlaceholder && (
                      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
                    )}
                    
                    {/* Title overlay if available - only for real images */}
                    {!item.isPlaceholder && item.title && (
                      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <h3 className="text-white font-medium text-lg">
                          {item.title}
                        </h3>
                        {item.description && (
                          <p className="text-white/90 text-sm mt-1 font-light">
                            {item.description}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              className="text-center py-20"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className={`w-20 h-20 ${colorClasses.light} rounded-full flex items-center justify-center mx-auto mb-8`}>
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-light text-gray-900 mb-3">Gallery Collection</h3>
              <p className="text-gray-500 font-light max-w-md mx-auto leading-relaxed">
                Our carefully curated gallery is being prepared. Beautiful images will be displayed here soon.
              </p>
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Lightbox Modal */}
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors"
          >
            <X size={32} />
          </button>
          
          {/* Navigation */}
          {validImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-6 text-white hover:text-gray-300 transition-colors"
              >
                <ChevronLeft size={32} />
              </button>
              
              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-6 text-white hover:text-gray-300 transition-colors"
              >
                <ChevronRight size={32} />
              </button>
            </>
          )}
          
          {/* Image */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="max-w-4xl max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage.src}
              alt={selectedImage.alt || 'Gallery image'}
              className="max-w-full max-h-[80vh] object-contain"
            />
            
            {/* Image info */}
            {selectedImage.title && (
              <div className="text-center mt-6">
                <h3 className="text-white text-xl font-medium mb-2">
                  {selectedImage.title}
                </h3>
                {selectedImage.description && (
                  <p className="text-white/80 font-light">
                    {selectedImage.description}
                  </p>
                )}
              </div>
            )}
          </motion.div>
          
          {/* Image counter */}
          {validImages.length > 1 && (
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-white font-light">
              {selectedIndex + 1} / {validImages.length}
            </div>
          )}
        </motion.div>
      )}
    </section>
  );
}

export default GallerySection;
