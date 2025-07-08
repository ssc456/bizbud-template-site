import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function SettingsView({ settings, onSaveSettings }) {
  const [localSettings, setLocalSettings] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);
  
  const handleServiceChange = (index, field, value) => {
    const newServiceTypes = [...localSettings.serviceTypes];
    newServiceTypes[index] = {
      ...newServiceTypes[index],
      [field]: value
    };
    setLocalSettings({
      ...localSettings,
      serviceTypes: newServiceTypes
    });
  };

  const addNewService = () => {
    const newServiceTypes = [
      ...(localSettings.serviceTypes || []),
      { 
        id: `service-${Date.now()}`, 
        name: 'New Service', 
        enabled: true,
        duration: 30 // Default duration
      }
    ];
    setLocalSettings({...localSettings, serviceTypes: newServiceTypes});
  };
  
  const handleSave = async () => {
    try {
      setIsSaving(true);
      setSaveSuccess(false);
      await onSaveSettings(localSettings);
      
      // Show success state
      setSaveSuccess(true);
      
      // Reset success indicator after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (!localSettings) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="font-medium text-lg mb-6">Appointment Settings</h3>
      
      {/* Working hours */}
      <div className="mb-8">
        <h4 className="font-medium mb-4 text-gray-700">Working Hours</h4>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
          {Object.entries(localSettings.workingHours).map(([day, hours]) => (
            <div key={day} className="flex items-center flex-wrap">
              <div className="w-32 md:w-48">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={hours.enabled}
                    onChange={() => {
                      const newWorkingHours = {...localSettings.workingHours};
                      newWorkingHours[day].enabled = !newWorkingHours[day].enabled;
                      setLocalSettings({...localSettings, workingHours: newWorkingHours});
                    }}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 rounded"
                  />
                  <span className="capitalize text-gray-700">{day}</span>
                </label>
              </div>
              
              <div className="flex space-x-2 items-center">
                <input
                  type="time"
                  value={hours.start}
                  onChange={(e) => {
                    const newWorkingHours = {...localSettings.workingHours};
                    newWorkingHours[day].start = e.target.value;
                    setLocalSettings({...localSettings, workingHours: newWorkingHours});
                  }}
                  disabled={!hours.enabled}
                  className="border rounded px-3 py-1.5 text-sm disabled:bg-gray-100 disabled:text-gray-400"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="time"
                  value={hours.end}
                  onChange={(e) => {
                    const newWorkingHours = {...localSettings.workingHours};
                    newWorkingHours[day].end = e.target.value;
                    setLocalSettings({...localSettings, workingHours: newWorkingHours});
                  }}
                  disabled={!hours.enabled}
                  className="border rounded px-3 py-1.5 text-sm disabled:bg-gray-100 disabled:text-gray-400"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Service types */}
      <div className="mb-8">
        <h4 className="font-medium mb-4 text-gray-700">Service Types</h4>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="space-y-3">
            {localSettings.serviceTypes.map((service, index) => (
              <div key={service.id} className="flex items-center justify-between bg-white p-3 border border-gray-100 rounded">
                <div className="flex items-center flex-1">
                  <input
                    type="checkbox"
                    checked={service.enabled}
                    onChange={() => handleServiceChange(index, 'enabled', !service.enabled)}
                    className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 rounded"
                  />
                  <div className="flex flex-col sm:flex-row sm:items-center flex-1">
                    <input
                      type="text"
                      value={service.name}
                      onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
                      className="border-0 p-0 focus:ring-0 text-gray-800 bg-transparent flex-1"
                      placeholder="Service Name"
                    />
                    <div className="mt-2 sm:mt-0 sm:ml-4 flex items-center">
                      <span className="text-xs text-gray-500 mr-2">Duration:</span>
                      <select
                        value={service.duration || 30}
                        onChange={(e) => handleServiceChange(index, 'duration', parseInt(e.target.value))}
                        className="border rounded-md text-sm py-1 bg-gray-50"
                      >
                        <option value={15}>15 minutes</option>
                        <option value={30}>30 minutes</option>
                        <option value={45}>45 minutes</option>
                        <option value={60}>1 hour</option>
                        <option value={90}>1.5 hours</option>
                        <option value={120}>2 hours</option>
                        <option value={180}>3 hours</option>
                        <option value={240}>4 hours</option>
                        <option value={300}>5 hours</option>
                        <option value={360}>6 hours</option>
                        <option value={420}>7 hours</option>
                        <option value={480}>8 hours</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                {index > 2 && (
                  <button
                    onClick={() => {
                      const newServiceTypes = localSettings.serviceTypes.filter((_, i) => i !== index);
                      setLocalSettings({...localSettings, serviceTypes: newServiceTypes});
                    }}
                    className="text-red-500 hover:text-red-700 ml-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
          
          <button
            onClick={addNewService}
            className="flex items-center text-blue-600 hover:text-blue-800 mt-3"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Service Type
          </button>
        </div>
      </div>
      
      {/* Updated button section with better feedback */}
      <div className="flex justify-between items-center">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            isSaving 
              ? 'bg-gray-400 text-white cursor-not-allowed' 
              : saveSuccess 
                ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500' 
                : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
          }`}
        >
          {isSaving ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </span>
          ) : saveSuccess ? (
            <span className="flex items-center">
              <svg className="h-5 w-5 mr-1.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Saved Successfully
            </span>
          ) : (
            'Save Settings'
          )}
        </button>
      </div>
    </div>
  );
}