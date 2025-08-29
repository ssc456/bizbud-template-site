import { motion } from 'framer-motion';
import { useState } from 'react';
import { Camera } from 'lucide-react';

// Component for handling image loading with fallback
function GalleryImage({ src, alt, title, description, colors, className, isPlaceholder = false }) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(!isPlaceholder && src);

  const handleImageLoad = () => setIsLoading(false);
  const handleImageError = () => { setIsLoading(false); setHasError(true); };
  
  const showPlaceholder = isPlaceholder || !src || hasError || src === 'PLACEHOLDER';

  if (showPlaceholder) {
    return (
      <div className={`${className} bg-gradient-to-br ${colors.gradient} opacity-20 flex flex-col items-center justify-center text-gray-600`}>
        <Camera size={28} className="mb-2 opacity-60" />
        <span className="text-sm font-medium opacity-70 text-center px-2">{title || 'Gallery Image'}</span>
      </div>
    );
  }

  return (
    <div className={`${className} relative overflow-hidden`}>
      {isLoading && (
        <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-20 flex items-center justify-center`}>
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-400 border-t-transparent"></div>
        </div>
      )}
      <img src={src} alt={alt} className="w-full h-full object-cover transition-transform hover:scale-110"
           onLoad={handleImageLoad} onError={handleImageError} style={{ display: isLoading ? 'none' : 'block' }} />
    </div>
  );
}

function GallerySection({ title, subtitle, layout, images, primaryColor, maxImages = 6 }) {
  const processedImages = (images || []).slice(0, maxImages).map((image, index) => {
    const src = typeof image === 'string' ? image : image?.src;
    const isPlaceholder = !src || src === 'PLACEHOLDER' || src.includes('placeholder');
    return {
      src, alt: image?.alt || `Gallery image ${index + 1}`, title: image?.title || `Gallery Item ${index + 1}`,
      description: image?.description || '', isPlaceholder
    };
  });
  
  const colorClasses = {
    pink: {
      accent: 'text-pink-500',
      bg: 'bg-pink-500',
      gradient: 'from-pink-500 to-rose-400',
    },
    purple: {
      accent: 'text-purple-500',
      bg: 'bg-purple-500',
      gradient: 'from-purple-500 to-indigo-400',
    },
    blue: {
      accent: 'text-blue-500',
      bg: 'bg-blue-500',
      gradient: 'from-blue-500 to-cyan-400',
    },
    green: {
      accent: 'text-green-500',
      bg: 'bg-green-500',
      gradient: 'from-green-500 to-emerald-400',
    },
    red: {
      accent: 'text-red-500',
      bg: 'bg-red-500',
      gradient: 'from-red-500 to-rose-400',
    },
    yellow: {
      accent: 'text-yellow-500',
      bg: 'bg-yellow-500',
      gradient: 'from-yellow-400 to-amber-400',
    }
  }[primaryColor] || colorClasses.blue;

  return (
    <section id="gallery" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-block">
            <div className={`h-1 w-20 ${colorClasses.bg} mb-4 mx-auto rounded`}></div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
          <p className="text-gray-600 text-lg">{subtitle}</p>
        </div>
        
        {processedImages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {processedImages.map((image, index) => (
              <motion.div key={index} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }}
                className="overflow-hidden rounded-lg shadow-md bg-white">
                <div className="h-64 overflow-hidden">
                  <GalleryImage src={image.src} alt={image.alt} title={image.title} description={image.description}
                    isPlaceholder={image.isPlaceholder} colors={colorClasses} className="w-full h-full" />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-medium mb-1">{image.title}</h3>
                  <p className="text-gray-600 text-sm">{image.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          /* Empty state when no images */
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className={`w-20 h-20 mx-auto mb-6 rounded-lg bg-gradient-to-br ${colorClasses.gradient} opacity-20 flex items-center justify-center`}>
              <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Gallery Coming Soon</h3>
            <p className="text-gray-600 text-lg max-w-md mx-auto">
              We're preparing beautiful images to showcase here. Please check back later for our gallery collection.
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}

export default GallerySection;