import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { format, parseISO, addDays, isSameDay } from 'date-fns';
import { toast } from 'react-hot-toast';
import 'react-calendar/dist/Calendar.css';

export default function AppointmentsManager() {
  const [view, setView] = useState('dashboard'); // dashboard, calendar, list, settings
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [weekCount, setWeekCount] = useState(0);
  const [settings, setSettings] = useState({
    duration: 30,
    bufferTime: 5,
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
  const [appointmentDates, setAppointmentDates] = useState({}); // For calendar highlighting
  const [activeAppointment, setActiveAppointment] = useState(null); // For appointment details view
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all'); // all, today, week, month, custom
  const [customDateRange, setCustomDateRange] = useState({
    start: format(new Date(), 'yyyy-MM-dd'),
    end: format(addDays(new Date(), 7), 'yyyy-MM-dd')
  });
  
  useEffect(() => {
    fetchSettings();
    fetchAllAppointments();
    fetchDashboardStats();
    // Poll for updates every 60 seconds
    const intervalId = setInterval(fetchDashboardStats, 60000);
    return () => clearInterval(intervalId);
  }, []);
  
  const fetchDashboardStats = async () => {
    try {
      const csrfToken = sessionStorage.getItem('csrfToken');
      const extractedSiteId = window.location.hostname.split('.')[0];
      
      // Get pending count
      const pendingResponse = await fetch(
        `/api/appointments?action=pendingCount&siteId=${extractedSiteId}`, 
        {
          credentials: 'include',
          headers: { 'X-CSRF-Token': csrfToken || '' }
        }
      );
      
      if (pendingResponse.ok) {
        const pendingData = await pendingResponse.json();
        setPendingCount(pendingData.count);
      }
      
      // Fetch all appointments for calculations
      const response = await fetch(
        `/api/appointments?action=list&siteId=${extractedSiteId}`, 
        {
          credentials: 'include',
          headers: { 'X-CSRF-Token': csrfToken || '' }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        const allAppts = data.appointments || [];
        
        // Calculate today's appointments
        const today = new Date();
        const todayStr = format(today, 'yyyy-MM-dd');
        const todayAppointments = allAppts.filter(appt => 
          appt.date === todayStr && appt.status !== 'cancelled'
        );
        setTodayCount(todayAppointments.length);
        
        // Calculate this week's appointments
        const nextWeek = addDays(today, 7);
        const weekAppointments = allAppts.filter(appt => {
          const apptDate = parseISO(appt.date);
          return appt.status !== 'cancelled' && 
                 apptDate >= today && 
                 apptDate <= nextWeek;
        });
        setWeekCount(weekAppointments.length);
        
        // Build appointment dates object for calendar highlighting
        const dateMap = {};
        allAppts.forEach(appt => {
          if (!dateMap[appt.date]) {
            dateMap[appt.date] = { total: 0, pending: 0 };
          }
          dateMap[appt.date].total++;
          if (appt.status === 'pending') {
            dateMap[appt.date].pending++;
          }
        });
        setAppointmentDates(dateMap);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

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
      
      setIsLoading(true);
      const response = await fetch(
        `/api/appointments?action=list&siteId=${extractedSiteId}&date=${formattedDate}`, 
        {
          credentials: 'include',
          headers: { 'X-CSRF-Token': csrfToken || '' }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        // Only keep appointments that match the selected date exactly
        const filteredAppointments = (data.appointments || []).filter(
          appt => appt.date === formattedDate
        );
        setAppointments(filteredAppointments);
      } else {
        console.error('Error fetching appointments:', await response.text());
        toast.error('Failed to load appointments');
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchAllAppointments = async () => {
    setIsLoading(true);
    try {
      const csrfToken = sessionStorage.getItem('csrfToken');
      const extractedSiteId = window.location.hostname.split('.')[0];
      
      const response = await fetch(
        `/api/appointments?action=list&siteId=${extractedSiteId}`, 
        {
          credentials: 'include',
          headers: { 'X-CSRF-Token': csrfToken || '' }
        }
      );
      
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
        fetchAllAppointments();
        fetchDashboardStats();
        if (activeAppointment && activeAppointment.id === appointmentId) {
          setActiveAppointment({...activeAppointment, status: 'confirmed'});
        }
      } else {
        toast.error('Failed to confirm appointment');
      }
    } catch (error) {
      console.error('Error confirming appointment:', error);
      toast.error('Failed to confirm appointment');
    }
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
        fetchAllAppointments();
        fetchDashboardStats();
        if (activeAppointment && activeAppointment.id === appointmentId) {
          setActiveAppointment({...activeAppointment, status: 'cancelled'});
        }
      } else {
        toast.error('Failed to cancel appointment');
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error('Failed to cancel appointment');
    }
  };
  
  // Calendar tile content - show appointment counts
  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null;
    
    const dateStr = format(date, 'yyyy-MM-dd');
    const dateInfo = appointmentDates[dateStr];
    
    if (!dateInfo) return null;
    
    return (
      <div className="flex flex-col items-center mt-1">
        <div className="text-xs font-semibold">
          {dateInfo.total}
        </div>
        {dateInfo.pending > 0 && (
          <div className="text-xs px-1 text-white bg-yellow-500 rounded-full">
            {dateInfo.pending}
          </div>
        )}
      </div>
    );
  };
  
  // Calendar tile class - highlight dates with appointments
  const tileClassName = ({ date, view }) => {
    if (view !== 'month') return '';
    
    const dateStr = format(date, 'yyyy-MM-dd');
    const dateInfo = appointmentDates[dateStr];
    
    if (!dateInfo) return '';
    
    if (dateInfo.pending > 0) {
      return 'bg-yellow-100 font-semibold';
    } else if (dateInfo.total > 0) {
      return 'bg-blue-50 font-semibold';
    }
    
    return '';
  };

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Appointments Manager</h2>
        <div className="flex space-x-2">
          <button 
            className={`px-3 py-1.5 rounded-lg ${view === 'dashboard' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
            onClick={() => setView('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={`px-3 py-1.5 rounded-lg ${view === 'calendar' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
            onClick={() => {
              setView('calendar');
              fetchAppointments(selectedDate);
            }}
          >
            Calendar
          </button>
          <button 
            className={`px-3 py-1.5 rounded-lg ${view === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
            onClick={() => {
              setView('list');
              fetchAllAppointments();
            }}
          >
            List
          </button>
          <button 
            className={`px-3 py-1.5 rounded-lg ${view === 'settings' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
            onClick={() => setView('settings')}
          >
            Settings
          </button>
        </div>
      </div>
      
      {/* Dashboard View */}
      {view === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Pending Requests Card */}
            <div className="bg-gradient-to-br from-yellow-50 to-amber-100 rounded-lg shadow p-6 border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-800 text-sm font-medium">Pending Requests</p>
                  <h3 className="text-3xl font-bold text-yellow-900 mt-2">{pendingCount}</h3>
                </div>
                <div className="bg-yellow-200 rounded-full p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-yellow-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <button 
                onClick={() => {
                  setView('list');
                  setListTab('pending');
                }}
                className="mt-4 w-full py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md text-sm font-medium transition-colors"
              >
                View Pending Requests
              </button>
            </div>
            
            {/* Today's Appointments Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg shadow p-6 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-800 text-sm font-medium">Today's Appointments</p>
                  <h3 className="text-3xl font-bold text-blue-900 mt-2">{todayCount}</h3>
                </div>
                <div className="bg-blue-200 rounded-full p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <button 
                onClick={() => {
                  setView('calendar');
                  setSelectedDate(new Date());
                  fetchAppointments(new Date());
                }}
                className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
              >
                View Today's Schedule
              </button>
            </div>
            
            {/* This Week's Appointments Card */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg shadow p-6 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-800 text-sm font-medium">This Week's Appointments</p>
                  <h3 className="text-3xl font-bold text-green-900 mt-2">{weekCount}</h3>
                </div>
                <div className="bg-green-200 rounded-full p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <button 
                onClick={() => setView('calendar')}
                className="mt-4 w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors"
              >
                View Weekly Schedule
              </button>
            </div>
          </div>
          
          {/* Recent Appointments Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Recent Appointment Requests</h3>
              <button 
                onClick={() => {
                  setView('list');
                  fetchAllAppointments();
                }}
                className="text-blue-600 text-sm hover:underline"
              >
                View All
              </button>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
              </div>
            ) : appointments.filter(a => a.status === 'pending').length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No pending appointments</h3>
                <p className="mt-1 text-sm text-gray-500">All appointment requests have been handled.</p>
              </div>
            ) : (
              <div className="overflow-hidden border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {appointments
                      .filter(a => a.status === 'pending')
                      .sort((a, b) => new Date(a.date) - new Date(b.date))
                      .slice(0, 5)
                      .map(appointment => (
                        <tr key={appointment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{appointment.customer.name}</div>
                            <div className="text-sm text-gray-500">{appointment.customer.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{appointment.service || "General"}</div>
                            <div className="text-sm text-gray-500">{appointment.duration} mins</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{appointment.date}</div>
                            <div className="text-sm text-gray-500">{appointment.time}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button 
                              onClick={() => setActiveAppointment(appointment)} 
                              className="text-blue-600 hover:text-blue-900 mr-4"
                            >
                              View
                            </button>
                            <button 
                              onClick={() => handleConfirmAppointment(appointment.id)} 
                              className="text-green-600 hover:text-green-900 mr-4"
                            >
                              Confirm
                            </button>
                            <button 
                              onClick={() => handleCancelAppointment(appointment.id)} 
                              className="text-red-600 hover:text-red-900"
                            >
                              Cancel
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Calendar View */}
      {view === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <Calendar 
              onChange={(date) => {
                setSelectedDate(date);
                fetchAppointments(date);
              }}
              value={selectedDate}
              className="w-full"
              tileContent={tileContent}
              tileClassName={tileClassName}
            />
            <div className="mt-4 text-center text-sm">
              <div className="flex justify-center items-center space-x-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-100 mr-1"></div>
                  <span>Pending</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-50 mr-1"></div>
                  <span>Confirmed</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
            <h3 className="font-medium text-lg mb-4">
              Appointments for {format(selectedDate, 'MMMM d, yyyy')}
            </h3>
            
            {isLoading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
              </div>
            ) : appointments.length === 0 ? (
              <p className="text-gray-500 py-10 text-center">No appointments scheduled for this day.</p>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {appointments
                  .sort((a, b) => {
                    // Convert times to comparable format
                    const timeA = a.time.replace(/[^\d:]/g, '');
                    const timeB = b.time.replace(/[^\d:]/g, '');
                    return timeA.localeCompare(timeB);
                  })
                  .map(appointment => (
                    <div 
                      key={appointment.id} 
                      className={`p-4 border rounded-lg ${
                        appointment.status === 'pending' ? 'border-yellow-300 bg-yellow-50' : 
                        appointment.status === 'confirmed' ? 'border-green-300 bg-green-50' :
                        'border-red-300 bg-red-50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center mb-1">
                            <h4 className="font-medium text-gray-900">{appointment.customer?.name || 'No name'}</h4>
                            <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                              appointment.status === 'pending' ? 'bg-yellow-200 text-yellow-800' :
                              appointment.status === 'confirmed' ? 'bg-green-200 text-green-800' :
                              'bg-red-200 text-red-800'
                            }`}>
                              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">Time:</span> {appointment.time} ({appointment.duration} min)
                          </p>
                          <p className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">Service:</span> {appointment.service || 'General Appointment'}
                          </p>
                          <p className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">Contact:</span> {appointment.customer?.email}
                          </p>
                          {appointment.customer?.phone && (
                            <p className="text-sm text-gray-600 mb-1">
                              <span className="font-medium">Phone:</span> {appointment.customer.phone}
                            </p>
                          )}
                          {appointment.customer?.notes && (
                            <p className="text-sm text-gray-600 mt-2 bg-white p-2 rounded border border-gray-100">
                              <span className="font-medium">Notes:</span> {appointment.customer.notes}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex space-x-2">
                          {appointment.status === 'pending' && (
                            <button 
                              onClick={() => handleConfirmAppointment(appointment.id)} 
                              className="px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded text-sm"
                            >
                              Confirm
                            </button>
                          )}
                          <button 
                            onClick={() => handleCancelAppointment(appointment.id)}
                            className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* List View */}
      {view === 'list' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-medium text-lg mb-4">Appointment List</h3>
          
          <div className="mb-6">
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
              <button
                className={`py-2 px-4 ${listTab === 'all' ? 'border-b-2 border-blue-500 font-medium text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setListTab('all')}
              >
                All Appointments
              </button>
            </div>
          </div>
          
          {/* Add search input */}
          <div className="mb-6 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, service..."
              className="pl-10 pr-4 py-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 block w-full rounded-md"
            />
          </div>
          
          {/* Date filter */}
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="text-sm font-medium text-gray-700">Date Range:</div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setDateFilter('all')}
                className={`px-3 py-1 text-sm rounded ${dateFilter === 'all' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
              >
                All Dates
              </button>
              <button
                onClick={() => setDateFilter('today')}
                className={`px-3 py-1 text-sm rounded ${dateFilter === 'today' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
              >
                Today
              </button>
              <button
                onClick={() => setDateFilter('week')}
                className={`px-3 py-1 text-sm rounded ${dateFilter === 'week' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
              >
                Next 7 Days
              </button>
              <button
                onClick={() => setDateFilter('month')}
                className={`px-3 py-1 text-sm rounded ${dateFilter === 'month' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
              >
                This Month
              </button>
              <button
                onClick={() => setDateFilter('custom')}
                className={`px-3 py-1 text-sm rounded ${dateFilter === 'custom' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
              >
                Custom Range
              </button>
            </div>
            
            {dateFilter === 'custom' && (
              <div className="flex items-center gap-2 ml-2">
                <input
                  type="date"
                  value={customDateRange.start}
                  onChange={(e) => setCustomDateRange({...customDateRange, start: e.target.value})}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={customDateRange.end}
                  onChange={(e) => setCustomDateRange({...customDateRange, end: e.target.value})}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                />
              </div>
            )}
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
            </div>
          ) : (
            <div className="overflow-hidden border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointments
                    .filter(a => listTab === 'all' ? true : a.status === listTab)
                    .filter(appointment => {
                      // First apply status filter
                      if (listTab !== 'all' && appointment.status !== listTab) return false;
                      
                      // Then apply search term filter
                      if (searchTerm.trim()) {
                        const term = searchTerm.toLowerCase();
                        const matchesSearch = 
                          appointment.customer.name?.toLowerCase().includes(term) ||
                          appointment.customer.email?.toLowerCase().includes(term) ||
                          appointment.service?.toLowerCase().includes(term) ||
                          appointment.date?.includes(term) ||
                          appointment.time?.includes(term) ||
                          appointment.customer.phone?.includes(term) ||
                          appointment.customer.notes?.toLowerCase().includes(term);
                          
                        if (!matchesSearch) return false;
                      }
                      
                      // Then apply date filter
                      const appointmentDate = parseISO(appointment.date);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      
                      switch (dateFilter) {
                        case 'today':
                          return format(appointmentDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
                        case 'week': {
                          const nextWeek = addDays(today, 7);
                          return appointmentDate >= today && appointmentDate <= nextWeek;
                        }
                        case 'month': {
                          const thisMonth = today.getMonth();
                          const thisYear = today.getFullYear();
                          const apptMonth = appointmentDate.getMonth();
                          const apptYear = appointmentDate.getFullYear();
                          return apptMonth === thisMonth && apptYear === thisYear;
                        }
                        case 'custom': {
                          const startDate = parseISO(customDateRange.start);
                          const endDate = parseISO(customDateRange.end);
                          return appointmentDate >= startDate && appointmentDate <= endDate;
                        }
                        default:
                          return true;
                      }
                    })
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .map(appointment => (
                      <tr key={appointment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{appointment.customer.name}</div>
                          <div className="text-sm text-gray-500">{appointment.customer.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{appointment.service || "General"}</div>
                          <div className="text-sm text-gray-500">{appointment.duration} mins</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{appointment.date}</div>
                          <div className="text-sm text-gray-500">{appointment.time}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            onClick={() => setActiveAppointment(appointment)} 
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            View
                          </button>
                          {appointment.status === 'pending' && (
                            <button 
                              onClick={() => handleConfirmAppointment(appointment.id)} 
                              className="text-green-600 hover:text-green-900 mr-4"
                            >
                              Confirm
                            </button>
                          )}
                          {appointment.status !== 'cancelled' && (
                            <button 
                              onClick={() => handleCancelAppointment(appointment.id)} 
                              className="text-red-600 hover:text-red-900"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      
      {/* Settings View */}
      {view === 'settings' && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="font-medium text-lg mb-6">Appointment Settings</h3>
          
          {/* Working hours */}
          <div className="mb-8">
            <h4 className="font-medium mb-4 text-gray-700">Working Hours</h4>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
              {Object.entries(settings.workingHours).map(([day, hours]) => (
                <div key={day} className="flex items-center flex-wrap">
                  <div className="w-32 md:w-48">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={hours.enabled}
                        onChange={() => {
                          const newWorkingHours = {...settings.workingHours};
                          newWorkingHours[day].enabled = !newWorkingHours[day].enabled;
                          setSettings({...settings, workingHours: newWorkingHours});
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
                        const newWorkingHours = {...settings.workingHours};
                        newWorkingHours[day].start = e.target.value;
                        setSettings({...settings, workingHours: newWorkingHours});
                      }}
                      disabled={!hours.enabled}
                      className="border rounded px-3 py-1.5 text-sm disabled:bg-gray-100 disabled:text-gray-400"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="time"
                      value={hours.end}
                      onChange={(e) => {
                        const newWorkingHours = {...settings.workingHours};
                        newWorkingHours[day].end = e.target.value;
                        setSettings({...settings, workingHours: newWorkingHours});
                      }}
                      disabled={!hours.enabled}
                      className="border rounded px-3 py-1.5 text-sm disabled:bg-gray-100 disabled:text-gray-400"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Duration options */}
          <div className="mb-8">
            <h4 className="font-medium mb-4 text-gray-700">Available Appointment Durations</h4>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex flex-wrap gap-4">
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
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 rounded"
                    />
                    <label htmlFor={`duration-${duration.value}`} className="text-gray-700">{duration.label}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Buffer time */}
          <div className="mb-8">
            <h4 className="font-medium mb-4 text-gray-700">Buffer Time Between Appointments</h4>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <select
                value={settings.bufferTime}
                onChange={(e) => setSettings({...settings, bufferTime: parseInt(e.target.value)})}
                className="w-full md:w-auto border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="0">No buffer</option>
                <option value="5">5 minutes</option>
                <option value="10">10 minutes</option>
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
              </select>
            </div>
          </div>
          
          {/* Service types */}
          <div className="mb-8">
            <h4 className="font-medium mb-4 text-gray-700">Service Types</h4>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="space-y-3">
                {settings.serviceTypes.map((service, index) => (
                  <div key={service.id} className="flex items-center justify-between bg-white p-3 border border-gray-100 rounded">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={service.enabled}
                        onChange={() => {
                          const newServiceTypes = [...settings.serviceTypes];
                          newServiceTypes[index].enabled = !newServiceTypes[index].enabled;
                          setSettings({...settings, serviceTypes: newServiceTypes});
                        }}
                        className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 rounded"
                      />
                      <input
                        type="text"
                        value={service.name}
                        onChange={(e) => {
                          const newServiceTypes = [...settings.serviceTypes];
                          newServiceTypes[index].name = e.target.value;
                          setSettings({...settings, serviceTypes: newServiceTypes});
                        }}
                        className="border-0 p-0 focus:ring-0 text-gray-800 bg-transparent"
                      />
                    </div>
                    
                    {index > 2 && (
                      <button
                        onClick={() => {
                          const newServiceTypes = settings.serviceTypes.filter((_, i) => i !== index);
                          setSettings({...settings, serviceTypes: newServiceTypes});
                        }}
                        className="text-red-500 hover:text-red-700"
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
                onClick={() => {
                  const newServiceTypes = [...(settings.serviceTypes || []), { 
                    id: `service-${Date.now()}`, 
                    name: 'New Service', 
                    enabled: true 
                  }];
                  setSettings({...settings, serviceTypes: newServiceTypes});
                }}
                className="flex items-center text-blue-600 hover:text-blue-800 mt-3"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Service Type
              </button>
            </div>
          </div>
          
          <div className="flex justify-between">
            <button 
              onClick={saveSettings}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Save Settings
            </button>
            
            {/* Maintenance section */}
            <button
              onClick={async () => {
                if (!confirm("This will remove appointments older than 6 months. Continue?")) return;
                
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
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Clean Up Old Appointments
            </button>
          </div>
        </div>
      )}
      
      {/* Appointment Detail Modal */}
      {activeAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium">
                Appointment Details
                <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  activeAppointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  activeAppointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {activeAppointment.status.charAt(0).toUpperCase() + activeAppointment.status.slice(1)}
                </span>
              </h3>
              <button 
                onClick={() => setActiveAppointment(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Appointment Information</h4>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p><span className="font-medium">Date:</span> {activeAppointment.date}</p>
                  <p><span className="font-medium">Time:</span> {activeAppointment.time}</p>
                  <p><span className="font-medium">Duration:</span> {activeAppointment.duration} minutes</p>
                  <p><span className="font-medium">Service:</span> {activeAppointment.service || "General Appointment"}</p>
                  <p><span className="font-medium">Created:</span> {new Date(activeAppointment.createdAt).toLocaleString()}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Customer Information</h4>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p><span className="font-medium">Name:</span> {activeAppointment.customer.name}</p>
                  <p><span className="font-medium">Email:</span> {activeAppointment.customer.email}</p>
                  <p><span className="font-medium">Phone:</span> {activeAppointment.customer.phone}</p>
                  {activeAppointment.customer.notes && (
                    <>
                      <p className="font-medium mt-3">Notes:</p>
                      <p className="bg-white p-2 rounded border border-gray-100">
                        {activeAppointment.customer.notes}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3 rounded-b-lg">
              {activeAppointment.status === 'pending' && (
                <button
                  onClick={() => {
                    handleConfirmAppointment(activeAppointment.id);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Confirm Appointment
                </button>
              )}
              {activeAppointment.status !== 'cancelled' && (
                <button
                  onClick={() => {
                    handleCancelAppointment(activeAppointment.id);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Cancel Appointment
                </button>
              )}
              <button
                onClick={() => setActiveAppointment(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}