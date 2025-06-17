import { useState } from 'react'
import FormField from '../components/FormField'

function FeaturesEditor({ clientData, setClientData }) {
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(null);

  const handleSectionChange = (field, value) => {
    setClientData(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [field]: value
      }
    }));
  };

  const handleFeatureChange = (index, field, value) => {
    const updatedFeatures = [...clientData.features.items];
    updatedFeatures[index] = {
      ...updatedFeatures[index],
      [field]: value
    };
    
    setClientData(prev => ({
      ...prev,
      features: {
        ...prev.features,
        items: updatedFeatures
      }
    }));
  };

  const addFeature = () => {
    const newFeature = {
      iconName: "Star",
      title: "New Feature",
      description: "Description of this feature"
    };
    
    setClientData(prev => ({
      ...prev,
      features: {
        ...prev.features,
        items: [...prev.features.items, newFeature]
      }
    }));
    
    setActiveFeatureIndex(clientData.features.items.length);
  };

  const removeFeature = (index) => {
    const updatedFeatures = [...clientData.features.items];
    updatedFeatures.splice(index, 1);
    
    setClientData(prev => ({
      ...prev,
      features: {
        ...prev.features,
        items: updatedFeatures
      }
    }));
    
    if (activeFeatureIndex === index) {
      setActiveFeatureIndex(null);
    } else if (activeFeatureIndex > index) {
      setActiveFeatureIndex(activeFeatureIndex - 1);
    }
  };

  const iconOptions = [
    "Briefcase", "Coffee", "Heart", "Star", "Cog", "Calendar", "Home", 
    "CreditCard", "CheckCircle", "Globe", "Mail", "Phone", "User", "Users",
    "Clock", "Bell", "Shield", "Settings", "ChevronsUp", "ChevronsDown"
  ];

  return (
    <div className="space-y-6">
      {/* Section Settings */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold mb-4">Features Section</h2>
        <div className="space-y-4">
          <FormField
            label="Section Title"
            id="features-title"
            type="text"
            value={clientData.features?.title || ''}
            onChange={(e) => handleSectionChange('title', e.target.value)}
          />
        </div>
      </div>

      {/* Features List */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Features</h2>
          <button
            onClick={addFeature}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
          >
            Add Feature
          </button>
        </div>

        {clientData.features?.items?.length > 0 ? (
          <div className="space-y-4">
            {/* List of features */}
            <div className="flex flex-wrap gap-2">
              {clientData.features.items.map((feature, index) => (
                <button
                  key={index}
                  onClick={() => setActiveFeatureIndex(activeFeatureIndex === index ? null : index)}
                  className={`px-3 py-1.5 rounded-md text-sm ${
                    activeFeatureIndex === index
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {feature.title || `Feature ${index + 1}`}
                </button>
              ))}
            </div>

            {/* Active feature editor */}
            {activeFeatureIndex !== null && (
              <div className="mt-6 border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold">
                    Editing: {clientData.features.items[activeFeatureIndex].title || `Feature ${activeFeatureIndex + 1}`}
                  </h3>
                  <button
                    onClick={() => removeFeature(activeFeatureIndex)}
                    className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
                  >
                    Remove
                  </button>
                </div>

                <div className="space-y-4">
                  <FormField
                    label="Icon"
                    id={`feature-${activeFeatureIndex}-iconName`}
                    type="select"
                    value={clientData.features.items[activeFeatureIndex].iconName || 'Star'}
                    options={iconOptions.map(icon => ({ value: icon, label: icon }))}
                    onChange={(e) => handleFeatureChange(activeFeatureIndex, 'iconName', e.target.value)}
                  />

                  <FormField
                    label="Title"
                    id={`feature-${activeFeatureIndex}-title`}
                    type="text"
                    value={clientData.features.items[activeFeatureIndex].title || ''}
                    onChange={(e) => handleFeatureChange(activeFeatureIndex, 'title', e.target.value)}
                  />

                  <FormField
                    label="Description"
                    id={`feature-${activeFeatureIndex}-description`}
                    type="textarea"
                    value={clientData.features.items[activeFeatureIndex].description || ''}
                    onChange={(e) => handleFeatureChange(activeFeatureIndex, 'description', e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No features added yet. Click 'Add Feature' to create your first feature.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default FeaturesEditor