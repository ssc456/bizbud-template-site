import { useState, useEffect } from 'react';
import { Calendar } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format, parseISO, addMinutes } from 'date-fns';
import { toast } from 'react-toastify';

export default function AppointmentsManager() {
  const [view, setView] = useState('calendar'); // calendar, list, settings
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [settings, setSettings] = useState({
    duration: 30, // Default 30 minutes
    bufferTime: 5, // 5 min between appointments
    workingHours: {
      monday: { start: '09:00', end: '17:00', enabled: true },
      tuesday: { start: '09:00', end: '17:00', enabled: true },
      wednesday: { start: '09:00', end: '17:00', enabled: true },
      thursday: { start: '09:00', end: '17:00', enabled: true },
      friday: { start: '09:00', end: '17:00', enabled: true },
      saturday: { start: '10:00', end: '15:00', enabled: false },
      sunday: { start: '10:00', end: '15:00', enabled: false }
    },
    durations: [
      { value: 15, enabled: true, label: '15 minutes' },
      { value: 30, enabled: true, label: '30 minutes' },
      { value: 60, enabled: true, label: '1 hour' }
    ],
    serviceTypes: [
      { id: 'general', name: 'General Appointment', enabled: true },
      { id: 'consultation', name: 'Consultation', enabled: true },
      { id: 'followup', name: 'Follow-up', enabled: true }
    ]
  });
  const [isLoading, setIsLoading] = useState(false);
  const [listTab, setListTab] = useState('pending'); // pending, confirmed, cancelled
  
  useEffect(() => {
    fetchSettings();
    fetchAppointments(selectedDate);
    // Remove selectedDate from the dependencies
  }, []);
  
  // Add this effect
  useEffect(() => {
    if (view === 'list') {
      fetchAppointmentsList();
    }
  }, [view]);
  
  const fetchSettings = async () => {
    const csrfToken = sessionStorage.getItem('csrfToken');
    const extractedSiteId = window.location.hostname.split('.')[0];
    
    try {
      const response = await fetch(`/api/appointments?action=settings&siteId=${extractedSiteId}`, {
        credentials: 'include',
        headers: {
          'X-CSRF-Token': csrfToken || ''
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };
  
  const fetchAppointments = async (date) => {
    try {
      const csrfToken = sessionStorage.getItem('csrfToken');
      const extractedSiteId = window.location.hostname.split('.')[0];
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      const response = await fetch(
        `/api/appointments?action=list&siteId=${extractedSiteId}&date=${formattedDate}`, 
        {
          credentials: 'include',
          headers: { 'X-CSRF-Token': csrfToken || '' }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setAppointments(data.appointments || []);
      } else {
        console.error('Error fetching appointments:', await response.text());
        toast.error('Failed to load appointments');
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    }
  };
  
  const fetchAppointmentsList = async (start, end) => {
    setIsLoading(true);
    try {
      const csrfToken = sessionStorage.getItem('csrfToken');
      const extractedSiteId = window.location.hostname.split('.')[0];
      
      let url = `/api/appointments?action=list&siteId=${extractedSiteId}`;
      if (start) url += `&start=${start}`;
      if (end) url += `&end=${end}`;
      
      const response = await fetch(url, {
        credentials: 'include',
        headers: { 'X-CSRF-Token': csrfToken || '' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAppointments(data.appointments || []);
      } else {
        toast.error('Failed to load appointments');
      }
    } catch (error) {
      console.error('Error fetching appointments list:', error);
      toast.error('Failed to load appointments');
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      const csrfToken = sessionStorage.getItem('csrfToken');
      const extractedSiteId = window.location.hostname.split('.')[0];
      
      console.log("Saving appointment settings:", settings);
      
      const response = await fetch(`/api/appointments?action=settings&siteId=${extractedSiteId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || ''
        },
        credentials: 'include',
        body: JSON.stringify({ settings })
      });
      
      if (response.ok) {
        toast.success('Appointment settings saved successfully');
      } else {
        const errorData = await response.json();
        toast.error(`Failed to save settings: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save appointment settings');
    }
  };
  
  const handleEditAppointment = (appointment) => {
    // For now, just log the appointment - this would open a modal in a complete implementation
    console.log('Edit appointment:', appointment);
    toast.info('Editing appointments will be implemented in the next version');
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    
    try {
      const csrfToken = sessionStorage.getItem('csrfToken');
      const extractedSiteId = window.location.hostname.split('.')[0];
      
      const response = await fetch(
        `/api/appointments?action=cancel&siteId=${extractedSiteId}&appointmentId=${appointmentId}`, 
        {
          method: 'DELETE',
          credentials: 'include',
          headers: { 'X-CSRF-Token': csrfToken || '' }
        }
      );
      
      if (response.ok) {
        toast.success('Appointment cancelled successfully');
        // Refresh appointments
        if (view === 'calendar') {
          fetchAppointments(selectedDate);
        } else {
          fetchAppointmentsList();
        }
      } else {
        toast.error('Failed to cancel appointment');
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error('Failed to cancel appointment');
    }
  };

  // Add a handleConfirmAppointment function:
  const handleConfirmAppointment = async (appointmentId) => {
    try {
      const csrfToken = sessionStorage.getItem('csrfToken');
      const extractedSiteId = window.location.hostname.split('.')[0];
      
      const response = await fetch(
        `/api/appointments?action=confirm&siteId=${extractedSiteId}`, 
        {
          method: 'POST',
          credentials: 'include',
          headers: { 
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken || '' 
          },
          body: JSON.stringify({ appointmentId })
        }
      );
      
      if (response.ok) {
        toast.success('Appointment confirmed successfully');
        // Refresh appointments
        if (view === 'calendar') {
          fetchAppointments(selectedDate);
        } else {
          fetchAppointmentsList();
        }
      } else {
        toast.error('Failed to confirm appointment');
      }
    } catch (error) {
      console.error('Error confirming appointment:', error);
      toast.error('Failed to confirm appointment');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Appointments Manager</h2>
        <div className="flex space-x-2">
          <button 
            className={`px-3 py-1 rounded ${view === 'calendar' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setView('calendar')}
          >
            Calendar
          </button>
          <button 
            className={`px-3 py-1 rounded ${view === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setView('list')}
          >
            List
          </button>
          <button 
            className={`px-3 py-1 rounded ${view === 'settings' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setView('settings')}
          >
            Settings
          </button>
        </div>
      </div>
      
      {view === 'calendar' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <Calendar 
              onChange={(date) => {
                setSelectedDate(date);
                fetchAppointments(date);
              }}
              value={selectedDate}
              className="w-full"
            />
          </div>
          <div className="md:col-span-2 bg-white p-4 rounded-lg shadow-sm">
            <h3 className="font-medium text-lg mb-4">
              Appointments for {format(selectedDate, 'MMMM d, yyyy')}
            </h3>
            {/* Appointments list for selected day */}
            <div className="space-y-3">
              {appointments.length === 0 ? (
                <p className="text-gray-500">No appointments scheduled for this day.</p>
              ) : 
                appointments.map(appointment => (
                  <div key={appointment.id} className="p-3 border rounded-lg flex justify-between">
                    <div>
                      <p className="font-medium">{appointment.customer?.name || 'No name'}</p>
                      <p className="text-sm text-gray-500">
                        {appointment.date} at {appointment.time}
                      </p>
                      <p className="text-sm">{appointment.service || 'General Appointment'}</p>
                    </div>
                    <div className="flex items-center">
                      <button 
                        onClick={() => handleEditAppointment(appointment)} 
                        className="text-blue-600 mr-2"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleCancelAppointment(appointment.id)}
                        className="text-red-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      )}
      
      {view === 'settings' && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="font-medium text-lg mb-4">Appointment Settings</h3>
          
          {/* Duration options */}
          <div className="mb-6">
            <h4 className="font-medium mb-2">Available Appointment Durations</h4>
            <div className="flex flex-wrap gap-3">
              {settings.durations.map((duration, index) => (
                <div key={index} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`duration-${duration.value}`}
                    checked={duration.enabled}
                    onChange={() => {
                      const newDurations = [...settings.durations];
                      newDurations[index].enabled = !newDurations[index].enabled;
                      setSettings({...settings, durations: newDurations});
                    }}
                    className="mr-2"
                  />
                  <label htmlFor={`duration-${duration.value}`}>{duration.label}</label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Working hours */}
          <div className="mb-6">
            <h4 className="font-medium mb-2">Working Hours</h4>
            <div className="space-y-3">
              {Object.entries(settings.workingHours).map(([day, hours]) => (
                <div key={day} className="flex items-center flex-wrap">
                  <div className="w-32">
                    <input
                      type="checkbox"
                      id={`day-${day}`}
                      checked={hours.enabled}
                      onChange={() => {
                        const newWorkingHours = {...settings.workingHours};
                        newWorkingHours[day].enabled = !newWorkingHours[day].enabled;
                        setSettings({...settings, workingHours: newWorkingHours});
                      }}
                      className="mr-2"
                    />
                    <label htmlFor={`day-${day}`} className="capitalize">{day}</label>
                  </div>
                  
                  <div className="flex space-x-2 items-center">
                    <input
                      type="time"
                      value={hours.start}
                      onChange={(e) => {
                        const newWorkingHours = {...settings.workingHours};
                        newWorkingHours[day].start = e.target.value;
                        setSettings({...settings, workingHours: newWorkingHours});
                      }}
                      disabled={!hours.enabled}
                      className="border rounded p-1"
                    />
                    <span>to</span>
                    <input
                      type="time"
                      value={hours.end}
                      onChange={(e) => {
                        const newWorkingHours = {...settings.workingHours};
                        newWorkingHours[day].end = e.target.value;
                        setSettings({...settings, workingHours: newWorkingHours});
                      }}
                      disabled={!hours.enabled}
                      className="border rounded p-1"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Buffer time */}
          <div className="mb-6">
            <h4 className="font-medium mb-2">Buffer Time Between Appointments</h4>
            <select
              value={settings.bufferTime}
              onChange={(e) => setSettings({...settings, bufferTime: parseInt(e.target.value)})}
              className="border rounded p-2"
            >
              <option value="0">No buffer</option>
              <option value="5">5 minutes</option>
              <option value="10">10 minutes</option>
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
            </select>
          </div>
          
          {/* Service Types */}
          <div className="mb-6">
            <h4 className="font-medium mb-2">Service Types</h4>
            <div className="space-y-2">
              {settings.serviceTypes?.map((service, index) => (
                <div key={service.id || index} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`service-${service.id}`}
                    checked={service.enabled}
                    onChange={() => {
                      const newServiceTypes = [...settings.serviceTypes];
                      newServiceTypes[index].enabled = !newServiceTypes[index].enabled;
                      setSettings({...settings, serviceTypes: newServiceTypes});
                    }}
                    className="mr-2"
                  />
                  <input
                    type="text"
                    value={service.name}
                    onChange={(e) => {
                      const newServiceTypes = [...settings.serviceTypes];
                      newServiceTypes[index].name = e.target.value;
                      setSettings({...settings, serviceTypes: newServiceTypes});
                    }}
                    className="border rounded p-1 flex-grow"
                  />
                  {settings.serviceTypes.length > 1 && (
                    <button
                      onClick={() => {
                        const newServiceTypes = settings.serviceTypes.filter((_, i) => i !== index);
                        setSettings({...settings, serviceTypes: newServiceTypes});
                      }}
                      className="ml-2 text-red-600 hover:text-red-800"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => {
                  const newServiceTypes = [...(settings.serviceTypes || []), { 
                    id: `service-${Date.now()}`, 
                    name: 'New Service', 
                    enabled: true 
                  }];
                  setSettings({...settings, serviceTypes: newServiceTypes});
                }}
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Service Type
              </button>
            </div>
          </div>
          
          <button 
            onClick={saveSettings}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save Settings
          </button>
          
          {/* Maintenance section */}
          <div className="mt-8 pt-4 border-t border-gray-200">
            <h4 className="font-medium mb-2">Maintenance</h4>
            <button
              onClick={async () => {
                try {
                  const csrfToken = sessionStorage.getItem('csrfToken');
                  const extractedSiteId = window.location.hostname.split('.')[0];
                  
                  const response = await fetch(`/api/appointments?action=cleanup&siteId=${extractedSiteId}`, {
                    method: 'POST',
                    headers: { 'X-CSRF-Token': csrfToken || '' }
                  });
                  if (response.ok) {
                    const data = await response.json();
                    toast.success(`Removed ${data.removed} old appointments`);
                  }
                } catch (error) {
                  toast.error('Failed to clean up old appointments');
                }
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Clean Up Old Appointments
            </button>
          </div>
        </div>
      )}
      
      {view === 'list' && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="font-medium text-lg mb-4">Appointment Requests</h3>
          
          <div className="mb-4">
            <div className="flex border-b border-gray-200">
              <button
                className={`py-2 px-4 ${listTab === 'pending' ? 'border-b-2 border-blue-500 font-medium text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setListTab('pending')}
              >
                Pending
                {appointments.filter(a => a.status === 'pending').length > 0 && (
                  <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded-full">
                    {appointments.filter(a => a.status === 'pending').length}
                  </span>
                )}
              </button>
              <button
                className={`py-2 px-4 ${listTab === 'confirmed' ? 'border-b-2 border-blue-500 font-medium text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setListTab('confirmed')}
              >
                Confirmed
              </button>
              <button
                className={`py-2 px-4 ${listTab === 'cancelled' ? 'border-b-2 border-blue-500 font-medium text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setListTab('cancelled')}
              >
                Cancelled
              </button>
            </div>
          </div>
          
          {/* Filter appointments based on selected tab */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {appointments.filter(a => a.status === listTab).length === 0 ? (
              <p className="text-gray-500">No {listTab} appointments found.</p>
            ) : 
              appointments
                .filter(a => a.status === listTab)
                .map(appointment => (
                  <div 
                    key={appointment.id} 
                    className={`p-3 border rounded-lg ${
                      appointment.status === 'pending' ? 'border-yellow-300 bg-yellow-50' : 
                      appointment.status === 'confirmed' ? 'border-green-300 bg-green-50' :
                      'border-red-300 bg-red-50'
                    }`}
                  >
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">{appointment.customer?.name || 'No name'}</p>
                        <p className="text-sm text-gray-500">
                          {appointment.date} at {appointment.time}
                        </p>
                      </div>
                      <div className="flex items-center">
                        {appointment.status === 'pending' && (
                          <button 
                            onClick={() => handleConfirmAppointment(appointment.id)}
                            className="text-green-600 mr-2"
                          >
                            Confirm
                          </button>
                        )}
                        <button 
                          onClick={() => handleEditAppointment(appointment)}
                          className="text-blue-600 mr-2"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleCancelAppointment(appointment.id)}
                          className="text-red-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                    <div className="mt-1 text-sm">
                      <p><span className="font-medium">Email:</span> {appointment.customer?.email}</p>
                      <p><span className="font-medium">Phone:</span> {appointment.customer?.phone}</p>
                      {appointment.customer?.notes && (
                        <p><span className="font-medium">Notes:</span> {appointment.customer.notes}</p>
                      )}
                    </div>
                  </div>
                ))
            }
          </div>
        </div>
      )}
    </div>
  );
}