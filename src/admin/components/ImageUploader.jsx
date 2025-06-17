import { useState, useRef } from 'react';

export default function ImageUploader({ 
  value, 
  onChange,
  label = 'Image',
  helpText,
  height = 'h-40'
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);
  const siteId = localStorage.getItem('siteId') || extractSiteId();

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsUploading(true);
    setUploadError(null);
    
    // Create form data for upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('siteId', siteId);
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json();
      onChange(data.url);
    } catch (err) {
      console.error('Error uploading image:', err);
      setUploadError('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      
      <div className={`border border-gray-300 rounded-md overflow-hidden ${height}`}>
        {value ? (
          <div className="relative w-full h-full">
            <img 
              src={value} 
              alt={label}
              className="w-full h-full object-contain" 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f0f0f0'/%3E%3Cpath d='M30 40 L50 20 L70 40' stroke='%23ccc' fill='none' stroke-width='2'/%3E%3Cpath d='M30 60 L50 80 L70 60' stroke='%23ccc' fill='none' stroke-width='2'/%3E%3C/svg%3E";
              }}
            />
            
            <button
              type="button"
              className="absolute bottom-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
              onClick={() => onChange('')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ) : (
          <div 
            className="flex flex-col items-center justify-center h-full bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-gray-500 mt-2">Click to upload</p>
          </div>
        )}
      </div>
      
      {helpText && <p className="text-xs text-gray-500">{helpText}</p>}
      {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}
      
      <input 
        ref={fileInputRef}
        type="file" 
        className="hidden" 
        accept="image/*" 
        onChange={handleUpload} 
      />
      
      <div className="flex justify-between mt-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`px-3 py-2 text-sm ${value ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : 'bg-blue-600 text-white hover:bg-blue-700'} rounded`}
          disabled={isUploading}
        >
          {isUploading ? 'Uploading...' : (value ? 'Change Image' : 'Upload Image')}
        </button>
        
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="px-3 py-2 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}