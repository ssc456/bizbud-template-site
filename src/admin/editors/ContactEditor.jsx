import { useState } from 'react';
import { EditableField } from '../components/EditableField';
import SectionHeader from '../components/SectionHeader';

export default function ContactEditor({ data, onChange }) {
  const [localData, setLocalData] = useState(data);

  const handleChange = (field, value) => {
    const updated = { 
      ...localData, 
      contact: { 
        ...localData.contact, 
        [field]: value 
      } 
    };
    setLocalData(updated);
    onChange(updated);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <SectionHeader 
        title="Contact Information" 
        description="Update your business contact information displayed on your website."
      />
      
      <div className="mt-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <EditableField
            value={localData.contact?.email || ''}
            onChange={(value) => handleChange('email', value)}
            placeholder="your@email.com"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <EditableField
            value={localData.contact?.phone || ''}
            onChange={(value) => handleChange('phone', value)}
            placeholder="(555) 123-4567"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Business Address
          </label>
          <EditableField
            value={localData.contact?.address || ''}
            onChange={(value) => handleChange('address', value)}
            placeholder="123 Main St, City, State 12345"
            multiline={true}
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}