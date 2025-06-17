import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { extractSiteId } from '../../utils/siteId';

export default function MediaLibrary() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [siteId, setSiteId] = useState('');
  
  useEffect(() => {
    setSiteId(extractSiteId());
  }, []);
  
  useEffect(() => {
    fetchMedia();
  }, []);
  
  const fetchMedia = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/get-media?siteId=${extractSiteId()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch media');
      }
      
      const data = await response.json();
      setMedia(data.media || []);
    } catch (err) {
      toast.error('Failed to load media library');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const deleteImage = async (publicId) => {
    if (!confirm('Are you sure you want to delete this image? This cannot be undone.')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/delete-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ publicId })
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete image');
      }
      
      toast.success('Image deleted successfully');
      setSelectedImage(null);
      fetchMedia();
    } catch (err) {
      toast.error('Failed to delete image');
      console.error(err);
    }
  };
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Media Library</h2>
          <button
            onClick={() => fetchMedia()}
            className="px-3 py-1.5 bg-gray-100 rounded text-sm hover:bg-gray-200"
          >
            Refresh
          </button>
        </div>
        
        <div className="mb-4 p-4 bg-blue-50 rounded-md text-sm text-blue-800">
          <p className="mb-2"><strong>How to use the Media Library:</strong></p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Upload images from any editor (General, About, Gallery, etc.)</li>
            <li>All uploaded images appear here for reuse</li>
            <li>Click on any image to get its URL</li>
            <li>Copy and paste the URL into any image field</li>
          </ol>
        </div>
        
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
            <p className="mt-2 text-gray-500">Loading media...</p>
          </div>
        ) : media.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-gray-500">No images found in your library.</p>
            <p className="text-gray-500 mt-2">Upload images from any of the editors to see them here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {media.map((item, index) => (
              <div 
                key={index} 
                className="relative border border-gray-200 rounded-md overflow-hidden group cursor-pointer"
                onClick={() => setSelectedImage(item)}
              >
                <img 
                  src={item.url} 
                  alt="Media item" 
                  className="w-full h-32 object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='12' fill='%23999' text-anchor='middle' dominant-baseline='middle'%3EImage Not Found%3C/text%3E%3C/svg%3E";
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button 
                    className="p-1 bg-blue-600 text-white rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(item.url);
                    }}
                  >
                    Copy URL
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Image Detail Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-medium">Image Details</h3>
              <button onClick={() => setSelectedImage(null)}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="p-4 max-h-[70vh] overflow-auto">
              <img 
                src={selectedImage.url} 
                alt="Full size" 
                className="max-w-full mx-auto max-h-[50vh] object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='12' fill='%23999' text-anchor='middle' dominant-baseline='middle'%3EImage Not Found%3C/text%3E%3C/svg%3E";
                }}
              />
              
              <div className="mt-4">
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedImage.width && selectedImage.height && (
                    <div className="bg-gray-100 px-3 py-1 rounded text-sm">
                      {selectedImage.width} x {selectedImage.height}
                    </div>
                  )}
                  {selectedImage.format && (
                    <div className="bg-gray-100 px-3 py-1 rounded text-sm">
                      {selectedImage.format.toUpperCase()}
                    </div>
                  )}
                  {selectedImage.createdAt && (
                    <div className="bg-gray-100 px-3 py-1 rounded text-sm">
                      {new Date(selectedImage.createdAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <div className="flex">
                    <input
                      type="text"
                      value={selectedImage.url}
                      readOnly
                      className="flex-1 p-2 border border-gray-300 rounded-l text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(selectedImage.url)}
                      className="bg-blue-600 text-white px-4 rounded-r"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t flex justify-end">
              <button
                onClick={() => deleteImage(selectedImage.publicId)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}