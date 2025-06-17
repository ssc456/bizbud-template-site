import { useState } from 'react'
import FormField from '../components/FormField'

function GalleryEditor({ clientData, setClientData }) {
  const [activeImageIndex, setActiveImageIndex] = useState(null);

  const handleSectionChange = (field, value) => {
    setClientData(prev => ({
      ...prev,
      gallery: {
        ...prev.gallery,
        [field]: value
      }
    }));
  };

  const handleImageChange = (index, field, value) => {
    const updatedImages = [...clientData.gallery.images];
    updatedImages[index] = {
      ...updatedImages[index],
      [field]: value
    };
    
    setClientData(prev => ({
      ...prev,
      gallery: {
        ...prev.gallery,
        images: updatedImages
      }
    }));
  };

  const addImage = () => {
    const newImage = {
      src: "",
      alt: "",
      title: "New Image",
      description: ""
    };
    
    setClientData(prev => ({
      ...prev,
      gallery: {
        ...prev.gallery,
        images: [...prev.gallery.images, newImage]
      }
    }));
    
    setActiveImageIndex(clientData.gallery.images.length);
  };

  const removeImage = (index) => {
    const updatedImages = [...clientData.gallery.images];
    updatedImages.splice(index, 1);
    
    setClientData(prev => ({
      ...prev,
      gallery: {
        ...prev.gallery,
        images: updatedImages
      }
    }));
    
    if (activeImageIndex === index) {
      setActiveImageIndex(null);
    } else if (activeImageIndex > index) {
      setActiveImageIndex(activeImageIndex - 1);
    }
  };

  const layoutOptions = [
    { value: 'grid', label: 'Grid' },
    { value: 'masonry', label: 'Masonry' },
    { value: 'carousel', label: 'Carousel' }
  ];

  return (
    <div className="space-y-6">
      {/* Gallery Section Settings */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold mb-4">Gallery Settings</h2>
        <div className="space-y-4">
          <FormField
            label="Section Title"
            id="gallery-title"
            type="text"
            value={clientData.gallery?.title || ''}
            onChange={(e) => handleSectionChange('title', e.target.value)}
          />
          
          <FormField
            label="Section Subtitle"
            id="gallery-subtitle"
            type="text"
            value={clientData.gallery?.subtitle || ''}
            onChange={(e) => handleSectionChange('subtitle', e.target.value)}
          />
          
          <FormField
            label="Layout Style"
            id="gallery-layout"
            type="select"
            value={clientData.gallery?.layout || 'grid'}
            options={layoutOptions}
            onChange={(e) => handleSectionChange('layout', e.target.value)}
          />
          
          <FormField
            label="Maximum Images to Show"
            id="gallery-maxImages"
            type="number"
            value={clientData.gallery?.maxImages || 6}
            onChange={(e) => handleSectionChange('maxImages', parseInt(e.target.value))}
          />
          
          <FormField
            label="View All Link"
            id="gallery-viewAllLink"
            type="text"
            value={clientData.gallery?.viewAllLink || ''}
            onChange={(e) => handleSectionChange('viewAllLink', e.target.value)}
            helpText="URL for the 'View All' button (leave empty to hide the button)"
          />
        </div>
      </div>

      {/* Gallery Images */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Gallery Images</h2>
          <button
            onClick={addImage}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
          >
            Add Image
          </button>
        </div>

        {clientData.gallery?.images?.length > 0 ? (
          <div className="space-y-4">
            {/* Thumbnail gallery */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {clientData.gallery.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImageIndex(activeImageIndex === index ? null : index)}
                  className={`relative aspect-square ${
                    activeImageIndex === index
                      ? 'ring-2 ring-blue-500'
                      : 'hover:opacity-90'
                  }`}
                >
                  {image.src ? (
                    <img
                      src={image.src}
                      alt={image.alt || `Image ${index + 1}`}
                      className="w-full h-full object-cover rounded"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/150?text=Error";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded text-gray-400">
                      No Image
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 bg-gray-800 bg-opacity-70 text-white text-xs px-1">
                    {index + 1}
                  </span>
                </button>
              ))}
            </div>

            {/* Active image editor */}
            {activeImageIndex !== null && (
              <div className="mt-6 border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold">
                    Editing Image {activeImageIndex + 1}
                  </h3>
                  <button
                    onClick={() => removeImage(activeImageIndex)}
                    className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
                  >
                    Remove
                  </button>
                </div>

                <div className="space-y-4">
                  <FormField
                    label="Image Source URL"
                    id={`image-${activeImageIndex}-src`}
                    type="text"
                    value={clientData.gallery.images[activeImageIndex].src || ''}
                    onChange={(e) => handleImageChange(activeImageIndex, 'src', e.target.value)}
                    helpText="Path to your image (e.g., /images/gallery/image1.jpg)"
                  />

                  <FormField
                    label="Alt Text"
                    id={`image-${activeImageIndex}-alt`}
                    type="text"
                    value={clientData.gallery.images[activeImageIndex].alt || ''}
                    onChange={(e) => handleImageChange(activeImageIndex, 'alt', e.target.value)}
                    helpText="Descriptive text for accessibility"
                  />

                  <FormField
                    label="Title"
                    id={`image-${activeImageIndex}-title`}
                    type="text"
                    value={clientData.gallery.images[activeImageIndex].title || ''}
                    onChange={(e) => handleImageChange(activeImageIndex, 'title', e.target.value)}
                  />

                  <FormField
                    label="Description"
                    id={`image-${activeImageIndex}-description`}
                    type="text"
                    value={clientData.gallery.images[activeImageIndex].description || ''}
                    onChange={(e) => handleImageChange(activeImageIndex, 'description', e.target.value)}
                  />
                  
                  {/* Preview */}
                  {clientData.gallery.images[activeImageIndex].src && (
                    <div className="mt-4">
                      <p className="font-medium mb-2">Preview</p>
                      <div className="border border-gray-200 rounded p-2">
                        <img
                          src={clientData.gallery.images[activeImageIndex].src}
                          alt={clientData.gallery.images[activeImageIndex].alt}
                          className="max-h-60 mx-auto"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://via.placeholder.com/400x300?text=Invalid+Image";
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No images in gallery. Click 'Add Image' to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default GalleryEditor