import { useState } from 'react';
import FormField from '../components/FormField';

export default function ContactEditor({ clientData, setClientData }) {
  const handleChange = (field, value) => {
    setClientData({
      ...clientData,
      contact: {
        ...clientData.contact,
        [field]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold mb-4">Section Settings</h2>
        <p className="text-gray-600 mb-6">Customize how the contact section appears on your website.</p>
        
        <div className="space-y-4">
          <FormField
            label="Section Title"
            id="contact-title"
            type="text"
            value={clientData.contact?.title || ''}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Get in Touch"
          />
          
          <FormField
            label="Section Description"
            id="contact-description"
            type="textarea"
            rows={2}
            value={clientData.contact?.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Have questions? Contact us today and we'll get back to you as soon as possible."
          />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold mb-4">Contact Information</h2>
        <p className="text-gray-600 mb-6">Update your business contact information displayed on your website.</p>
        
        <div className="space-y-4">
          <FormField
            label="Email Address"
            id="contact-email"
            type="text"
            value={clientData.contact?.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="your@email.com"
          />
          
          <FormField
            label="Phone Number"
            id="contact-phone"
            type="text"
            value={clientData.contact?.phone || ''}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="(555) 123-4567"
          />
          
          <FormField
            label="Business Address"
            id="contact-address"
            type="textarea"
            rows={3}
            value={clientData.contact?.address || ''}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="123 Main St, City, State 12345"
          />
        </div>
      </div>
    </div>
  );
}