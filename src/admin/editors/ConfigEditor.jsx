import FormField from '../components/FormField'

function ConfigEditor({ clientData, setClientData }) {
  const handleChange = (field, value) => {
    setClientData(prev => ({
      ...prev,
      config: {
        ...prev.config,
        [field]: value
      }
    }))
  }

  const colorOptions = [
    { value: 'pink', label: 'Pink' },
    { value: 'blue', label: 'Blue' },
    { value: 'purple', label: 'Purple' },
    { value: 'green', label: 'Green' },
    { value: 'red', label: 'Red' },
    { value: 'yellow', label: 'Yellow' },
  ]

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold mb-4">Display Settings</h2>
        
        <div className="mb-6">
          <h3 className="font-medium mb-2">Theme Color</h3>
          <FormField
            label="Primary Color"
            id="config-primaryColor"
            type="select"
            value={clientData.config?.primaryColor || 'blue'}
            options={colorOptions}
            onChange={(e) => handleChange('primaryColor', e.target.value)}
            helpText="The main color theme for your website"
          />
        </div>
        
        <div className="mb-6">
          <h3 className="font-medium mb-2">Section Visibility</h3>
          <div className="space-y-3">
            <FormField
              label="Show Hero Section"
              id="config-showHero"
              type="checkbox"
              value={clientData.config?.showHero || false}
              onChange={(e) => handleChange('showHero', e.target.checked)}
            />
            
            <FormField
              label="Show About Section"
              id="config-showAbout"
              type="checkbox"
              value={clientData.config?.showAbout || false}
              onChange={(e) => handleChange('showAbout', e.target.checked)}
            />
            
            <FormField
              label="Show Services Section"
              id="config-showServices"
              type="checkbox"
              value={clientData.config?.showServices || false}
              onChange={(e) => handleChange('showServices', e.target.checked)}
            />
            
            <FormField
              label="Show Features Section"
              id="config-showFeatures"
              type="checkbox"
              value={clientData.config?.showFeatures || false}
              onChange={(e) => handleChange('showFeatures', e.target.checked)}
            />
            
            <FormField
              label="Show Gallery Section"
              id="config-showGallery"
              type="checkbox"
              value={clientData.config?.showGallery || false}
              onChange={(e) => handleChange('showGallery', e.target.checked)}
            />
            
            <FormField
              label="Show Testimonials Section"
              id="config-showTestimonials"
              type="checkbox"
              value={clientData.config?.showTestimonials || false}
              onChange={(e) => handleChange('showTestimonials', e.target.checked)}
            />
            
            <FormField
              label="Show FAQ Section"
              id="config-showFAQ"
              type="checkbox"
              value={clientData.config?.showFAQ || false}
              onChange={(e) => handleChange('showFAQ', e.target.checked)}
            />
            
            <FormField
              label="Show Contact Section"
              id="config-showContact"
              type="checkbox"
              value={clientData.config?.showContact || false}
              onChange={(e) => handleChange('showContact', e.target.checked)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfigEditor