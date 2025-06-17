import FormField from '../components/FormField';
import ImageUploader from '../components/ImageUploader';

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
            rows={5}
            value={clientData.about?.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            helpText="Describe your business, services, or mission"
          />
          
          <ImageUploader
            label="About Image"
            value={clientData.about?.image || ''}
            onChange={(value) => handleChange('image', value)}
            helpText="Upload an image for your about section (recommended size: 600x400px)"
            height="h-48"
          />
        </div>
      </div>
    </div>
  )
}

export default AboutEditor