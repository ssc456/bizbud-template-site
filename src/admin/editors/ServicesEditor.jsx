import { useState } from 'react'
import FormField from '../components/FormField'

function ServicesEditor({ clientData, setClientData }) {
  const [activeServiceIndex, setActiveServiceIndex] = useState(null);

  const handleServiceChange = (index, field, value) => {
    const updatedServices = [...clientData.services.items];
    updatedServices[index] = {
      ...updatedServices[index],
      [field]: value
    };
    
    setClientData(prev => ({
      ...prev,
      services: {
        ...prev.services,
        items: updatedServices
      }
    }));
  };

  const handleServiceDetailChange = (serviceIndex, detailIndex, value) => {
    const updatedServices = [...clientData.services.items];
    const updatedDetails = [...updatedServices[serviceIndex].details];
    updatedDetails[detailIndex] = value;
    
    updatedServices[serviceIndex] = {
      ...updatedServices[serviceIndex],
      details: updatedDetails
    };
    
    setClientData(prev => ({
      ...prev,
      services: {
        ...prev.services,
        items: updatedServices
      }
    }));
  };

  const addService = () => {
  const newService = {
    title: "New Service",
    description: "Description of the new service",
    iconName: "Star",
    details: [
      "Detail 1",
      "Detail 2"
    ]
  };
  
  // Update client data first
  setClientData(prev => {
    const newServicesList = [...prev.services.items, newService];
    
    // Set active index to the new service's index AFTER the state update
    // We use requestAnimationFrame to ensure this happens after the DOM update
    requestAnimationFrame(() => {
      setActiveServiceIndex(newServicesList.length - 1);
    });
    
    return {
      ...prev,
      services: {
        ...prev.services,
        items: newServicesList
      }
    };
  });
};

  const removeService = (index) => {
    const updatedServices = [...clientData.services.items];
    updatedServices.splice(index, 1);
    
    setClientData(prev => ({
      ...prev,
      services: {
        ...prev.services,
        items: updatedServices
      }
    }));
    
    if (activeServiceIndex === index) {
      setActiveServiceIndex(null);
    } else if (activeServiceIndex > index) {
      setActiveServiceIndex(activeServiceIndex - 1);
    }
  };

  const addServiceDetail = (serviceIndex) => {
    const updatedServices = [...clientData.services.items];
    updatedServices[serviceIndex] = {
      ...updatedServices[serviceIndex],
      details: [...updatedServices[serviceIndex].details, "New detail"]
    };
    
    setClientData(prev => ({
      ...prev,
      services: {
        ...prev.services,
        items: updatedServices
      }
    }));
  };

  const removeServiceDetail = (serviceIndex, detailIndex) => {
    const updatedServices = [...clientData.services.items];
    const updatedDetails = [...updatedServices[serviceIndex].details];
    updatedDetails.splice(detailIndex, 1);
    
    updatedServices[serviceIndex] = {
      ...updatedServices[serviceIndex],
      details: updatedDetails
    };
    
    setClientData(prev => ({
      ...prev,
      services: {
        ...prev.services,
        items: updatedServices
      }
    }));
  };

  const handleSectionChange = (field, value) => {
    setClientData(prev => ({
      ...prev,
      services: {
        ...prev.services,
        [field]: value
      }
    }));
  };

  const iconOptions = [
    "Briefcase", "Coffee", "Heart", "Star", "Cog", "Calendar", "Home", 
    "CreditCard", "CheckCircle", "Globe", "Mail", "Phone", "User", "Users",
    "Clock", "Bell", "Shield", "Settings", "ChevronsUp", "ChevronsDown", 
    "Scissors", "GraduationCap", "Mountain", "MapPin", "Smile", "Paw"
  ];

  return (
    <div className="space-y-6">
      {/* Section Settings */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold mb-4">Services Section Settings</h2>
        <div className="space-y-4">
          <FormField
            label="Section Title"
            id="services-title"
            type="text"
            value={clientData.services?.title || ''}
            onChange={(e) => handleSectionChange('title', e.target.value)}
          />

          <FormField
            label="Section Description"
            id="services-description"
            type="textarea"
            value={clientData.services?.description || ''}
            onChange={(e) => handleSectionChange('description', e.target.value)}
          />

          <FormField
            label="Layout Style"
            id="services-layoutStyle"
            type="select"
            value={clientData.services?.layoutStyle || 'cards'}
            options={[
              { value: 'cards', label: 'Cards' },
              { value: 'interactive', label: 'Interactive' },
              { value: 'simple', label: 'Simple' }
            ]}
            onChange={(e) => handleSectionChange('layoutStyle', e.target.value)}
          />
        </div>
      </div>

      {/* Services List */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Services</h2>
          <button
            onClick={addService}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
          >
            Add Service
          </button>
        </div>

        {clientData.services?.items?.length > 0 ? (
          <div className="space-y-4">
            {/* List of services */}
            <div className="flex flex-wrap gap-2">
              {clientData.services.items.map((service, index) => (
                <button
                  key={index}
                  onClick={() => setActiveServiceIndex(activeServiceIndex === index ? null : index)}
                  className={`px-3 py-1.5 rounded-md text-sm ${
                    activeServiceIndex === index
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {service.title || `Service ${index + 1}`}
                </button>
              ))}
            </div>

            {/* Active service editor */}
            {activeServiceIndex !== null && (
              <div className="mt-6 border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold">
                    Editing: {clientData.services.items[activeServiceIndex].title || `Service ${activeServiceIndex + 1}`}
                  </h3>
                  <button
                    onClick={() => removeService(activeServiceIndex)}
                    className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
                  >
                    Remove
                  </button>
                </div>

                <div className="space-y-4">
                  <FormField
                    label="Title"
                    id={`service-${activeServiceIndex}-title`}
                    type="text"
                    value={clientData.services.items[activeServiceIndex].title || ''}
                    onChange={(e) => handleServiceChange(activeServiceIndex, 'title', e.target.value)}
                  />

                  <FormField
                    label="Description"
                    id={`service-${activeServiceIndex}-description`}
                    type="textarea"
                    value={clientData.services.items[activeServiceIndex].description || ''}
                    onChange={(e) => handleServiceChange(activeServiceIndex, 'description', e.target.value)}
                  />

                  <FormField
                    label="Icon"
                    id={`service-${activeServiceIndex}-iconName`}
                    type="select"
                    value={clientData.services.items[activeServiceIndex].iconName || 'Star'}
                    options={iconOptions.map(icon => ({ value: icon, label: icon }))}
                    onChange={(e) => handleServiceChange(activeServiceIndex, 'iconName', e.target.value)}
                  />

                  {/* Service Details */}
                  <div className="space-y-3 mt-6">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Service Details</h4>
                      <button
                        onClick={() => addServiceDetail(activeServiceIndex)}
                        className="px-2 py-1 bg-gray-200 text-gray-800 rounded text-xs hover:bg-gray-300"
                      >
                        Add Detail
                      </button>
                    </div>
                    
                    {clientData.services.items[activeServiceIndex].details?.map((detail, detailIndex) => (
                      <div key={detailIndex} className="flex items-center gap-2">
                        <input
                          type="text"
                          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={detail}
                          onChange={(e) => handleServiceDetailChange(activeServiceIndex, detailIndex, e.target.value)}
                        />
                        <button
                          onClick={() => removeServiceDetail(activeServiceIndex, detailIndex)}
                          className="p-2 text-red-500 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No services added yet. Click 'Add Service' to create your first service.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ServicesEditor