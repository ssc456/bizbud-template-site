import FormField from '../components/FormField'

function ContactEditor({ clientData, setClientData }) {
  const handleChange = (field, value) => {
    setClientData(prev => ({
      ...prev,
      contact: {
        ...prev.contact,
        [field]: value
      }
    }));
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold mb-4">Contact Information</h2>
        <div className="space-y-4">
          <FormField
            label="Section Title"
            id="contact-title"
            type="text"
            value={clientData.contact?.title || ''}
            onChange={(e) => handleChange('title', e.target.value)}
          />

          <FormField
            label="Description"
            id="contact-description"
            type="textarea"
            value={clientData.contact?.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            helpText="Brief text explaining how to get in touch"
            rows={4}
          />

          <FormField
            label="Email Address"
            id="contact-email"
            type="email"
            value={clientData.contact?.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
          />

          
          
        </div>
      </div>
    </div>
  );
}

export default ContactEditor