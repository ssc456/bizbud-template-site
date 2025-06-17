import FormField from '../components/FormField'

function AboutEditor({ clientData, setClientData }) {
  const handleChange = (field, value) => {
    setClientData(prev => ({
      ...prev,
      about: {
        ...prev.about,
        [field]: value
      }
    }))
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold mb-4">About Section</h2>
        <div className="space-y-4">
          <FormField
            label="Title"
            id="about-title"
            type="text"
            value={clientData.about?.title || ''}
            onChange={(e) => handleChange('title', e.target.value)}
          />

          <FormField
            label="Description"
            id="about-description"
            type="textarea"
            value={clientData.about?.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={6}
          />

          <FormField
            label="Image URL"
            id="about-image"
            type="text"
            value={clientData.about?.image || ''}
            onChange={(e) => handleChange('image', e.target.value)}
            helpText="Path to your about section image (e.g., /images/about.jpg)"
          />
          
          {clientData.about?.image && (
            <div className="mt-2 p-4 bg-gray-50 border border-gray-200 rounded">
              <p className="font-medium mb-2">Image Preview</p>
              <img 
                src={clientData.about.image} 
                alt="About section preview"
                className="max-h-40 object-contain" 
                onError={(e) => {
                  e.target.onerror = null; 
                  e.target.src = "https://via.placeholder.com/400x300?text=Invalid+Image";
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AboutEditor