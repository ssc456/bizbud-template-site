import FormField from '../components/FormField';
import ImageUploader from '../components/ImageUploader';

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

          <ImageUploader
            label="Logo Image"
            value={clientData.logoUrl || ''}
            onChange={(value) => handleChange('logoUrl', value)}
            helpText="Upload your logo (recommended size: 200x50px)"
            height="h-24"
          />
        </div>
      </div>
    </div>
  )
}

export default GeneralEditor