import FormField from '../components/FormField'

function GeneralEditor({ clientData, setClientData }) {
  const handleChange = (field, value) => {
    setClientData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold mb-4">General Settings</h2>
        <div className="space-y-4">
          <FormField
            label="Website Title"
            id="siteTitle"
            type="text"
            value={clientData.siteTitle || ''}
            onChange={(e) => handleChange('siteTitle', e.target.value)}
            helpText="This appears in the browser tab and at the top of your site"
          />

          <FormField
            label="Logo URL"
            id="logoUrl"
            type="text"
            value={clientData.logoUrl || ''}
            onChange={(e) => handleChange('logoUrl', e.target.value)}
            helpText="Path to your logo image (e.g., /images/logo.png)"
          />

          <div className="pt-4">
            <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-800">
              <p className="font-medium">Logo Preview</p>
              {clientData.logoUrl ? (
                <div className="mt-2 p-4 bg-white border border-gray-200 rounded">
                  <img 
                    src={clientData.logoUrl} 
                    alt="Logo Preview"
                    className="h-12 object-contain" 
                    onError={(e) => {
                      e.target.onerror = null; 
                      e.target.src = "https://via.placeholder.com/150x50?text=Invalid+Image";
                    }}
                  />
                </div>
              ) : (
                <p className="mt-2 italic">No logo set</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GeneralEditor