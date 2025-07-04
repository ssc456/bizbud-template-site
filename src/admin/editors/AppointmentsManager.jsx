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
    ]
  });
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    fetchSettings();
    fetchAppointments(selectedDate);
  }, [selectedDate]);
  
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
          <h3 className="font-medium text-lg mb-4">All Appointments</h3>
          
          <div className="mb-4 flex items-center space-x-2">
            <select 
              className="border rounded p-2"
              onChange={(e) => {
                const value = e.target.value;
                let startDate, endDate;
                
                if (value === 'upcoming') {
                  startDate = format(new Date(), 'yyyy-MM-dd');
                  // No end date for upcoming
                } else if (value === 'past') {
                  endDate = format(new Date(), 'yyyy-MM-dd');
                  // No start date for past
                } else if (value === 'month') {
                  const now = new Date();
                  startDate = format(new Date(now.getFullYear(), now.getMonth(), 1), 'yyyy-MM-dd');
                  endDate = format(new Date(now.getFullYear(), now.getMonth() + 1, 0), 'yyyy-MM-dd');
                }
                
                fetchAppointmentsList(startDate, endDate);
              }}
            >
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
              <option value="month">This Month</option>
              <option value="all">All Time</option>
            </select>
            
            <button 
              className="px-3 py-1 bg-blue-600 text-white rounded"
              onClick={() => fetchAppointmentsList()}
            >
              Refresh
            </button>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {appointments.length === 0 ? (
              <p className="text-gray-500">No appointments found.</p>
            ) : 
              appointments.map(appointment => (
                <div key={appointment.id} className="p-3 border rounded-lg">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">{appointment.customer?.name || 'No name'}</p>
                      <p className="text-sm text-gray-500">
                        {appointment.date} at {appointment.time}
                      </p>
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