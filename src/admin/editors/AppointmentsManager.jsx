import { useState, useEffect } from 'react';
import { Calendar } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format } from 'date-fns';
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
    ]
  });
  
  useEffect(() => {
    fetchSettings();
    fetchAppointments(selectedDate);
  }, [selectedDate]);
  
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
    // Implementation to fetch appointments for the selected date/range
  };
  
  const saveSettings = async () => {
    // Implementation to save appointment settings
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
              onChange={setSelectedDate}
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
              ) : (
                appointments.map(appointment => (
                  <div key={appointment.id} className="p-3 border rounded-lg flex justify-between">
                    <div>
                      <p className="font-medium">{appointment.customerName}</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(appointment.startTime), 'h:mm a')} - 
                        {format(new Date(appointment.endTime), 'h:mm a')}
                      </p>
                      <p className="text-sm">{appointment.service || 'General Appointment'}</p>
                    </div>
                    <div className="flex items-center">
                      <button className="text-blue-600 mr-2">Edit</button>
                      <button className="text-red-600">Cancel</button>
                    </div>
                  </div>
                ))
              )}
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
          
          <button 
            onClick={saveSettings}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save Settings
          </button>
        </div>
      )}
      
      {view === 'list' && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="font-medium text-lg mb-4">Upcoming Appointments</h3>
          {/* List view of appointments with filtering options */}
        </div>
      )}
    </div>
  );
}