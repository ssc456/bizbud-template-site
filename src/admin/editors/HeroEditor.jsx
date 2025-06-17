import FormField from '../components/FormField'

function HeroEditor({ clientData, setClientData }) {
  const handleChange = (field, value) => {
    setClientData(prev => ({
      ...prev,
      hero: {
        ...prev.hero,
        [field]: value
      }
    }))
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold mb-4">Hero Section</h2>
        <div className="space-y-4">
          <FormField
            label="Headline"
            id="hero-headline"
            type="text"
            value={clientData.hero?.headline || ''}
            onChange={(e) => handleChange('headline', e.target.value)}
            helpText="Main headline text for your hero section"
          />

          <FormField
            label="Subheadline"
            id="hero-subheadline"
            type="textarea"
            value={clientData.hero?.subheadline || ''}
            onChange={(e) => handleChange('subheadline', e.target.value)}
            helpText="Supporting text below the headline"
          />

          <FormField
            label="Call-to-Action Text"
            id="hero-ctaText"
            type="text"
            value={clientData.hero?.ctaText || ''}
            onChange={(e) => handleChange('ctaText', e.target.value)}
            helpText="Text displayed on the hero button"
          />

          <FormField
            label="Call-to-Action Link"
            id="hero-ctaLink"
            type="text"
            value={clientData.hero?.ctaLink || ''}
            onChange={(e) => handleChange('ctaLink', e.target.value)}
            helpText="Where the button links to (e.g., #contact)"
          />
        </div>
      </div>
    </div>
  )
}

export default HeroEditor