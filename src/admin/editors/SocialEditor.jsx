import FormField from '../components/FormField'

function SocialEditor({ clientData, setClientData }) {
  const handleChange = (field, value) => {
    setClientData(prev => ({
      ...prev,
      social: {
        ...prev.social,
        [field]: value
      }
    }));
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold mb-4">Social Media Links</h2>
        <div className="space-y-4">
          <FormField
            label="Facebook"
            id="social-facebook"
            type="text"
            value={clientData.social?.facebook || ''}
            onChange={(e) => handleChange('facebook', e.target.value)}
            helpText="Full URL to your Facebook page (e.g., https://facebook.com/yourpage)"
          />

          <FormField
            label="Instagram"
            id="social-instagram"
            type="text"
            value={clientData.social?.instagram || ''}
            onChange={(e) => handleChange('instagram', e.target.value)}
            helpText="Full URL to your Instagram profile"
          />

          <FormField
            label="Twitter"
            id="social-twitter"
            type="text"
            value={clientData.social?.twitter || ''}
            onChange={(e) => handleChange('twitter', e.target.value)}
            helpText="Full URL to your Twitter profile"
          />

          <FormField
            label="LinkedIn"
            id="social-linkedin"
            type="text"
            value={clientData.social?.linkedin || ''}
            onChange={(e) => handleChange('linkedin', e.target.value)}
            helpText="Full URL to your LinkedIn profile or company page"
          />

          <FormField
            label="YouTube"
            id="social-youtube"
            type="text"
            value={clientData.social?.youtube || ''}
            onChange={(e) => handleChange('youtube', e.target.value)}
            helpText="Full URL to your YouTube channel"
          />

          <FormField
            label="TikTok"
            id="social-tiktok"
            type="text"
            value={clientData.social?.tiktok || ''}
            onChange={(e) => handleChange('tiktok', e.target.value)}
            helpText="Full URL to your TikTok profile"
          />
        </div>
      </div>
    </div>
  );
}

export default SocialEditor