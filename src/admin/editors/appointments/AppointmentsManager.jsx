import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { format, addDays } from 'date-fns';
import DashboardView from './DashboardView';
import CalendarView from './CalendarView';
import ListView from './ListView';
import SettingsView from './SettingsView';
import AppointmentDetailModal from './AppointmentDetailModal';
import { 
  fetchSettings, 
  saveSettings, 
  fetchAppointments, 
  fetchAllAppointments, 
  fetchDashboardStats,
  confirmAppointment,
  cancelAppointment,
  cleanupAppointments
} from './appointmentsAPI';

export default function AppointmentsManager({ initialView = 'list' }) {
  const [view, setView] = useState(initialView);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({ pending: 0, today: 0, week: 0 });
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeAppointment, setActiveAppointment] = useState(null);
  const [appointmentDates, setAppointmentDates] = useState({});
  const [listTab, setListTab] = useState('all'); // Start with "all" selected instead of "pending"
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [customDateRange, setCustomDateRange] = useState({
    start: format(new Date(), 'yyyy-MM-dd'),
    end: format(new Date(new Date().setDate(new Date().getDate() + 7)), 'yyyy-MM-dd')
  });

  // Load initial data
  useEffect(() => {
    async function loadInitialData() {
      try {
        setIsLoading(true);
        
        // Fetch settings
        const settingsData = await fetchSettings();
        if (settingsData) {
          setSettings(settingsData);
        }
        
        // Fetch stats and appointments
        const { stats, dateMap } = await fetchDashboardStats();
        setStats(stats);
        setAppointmentDates(dateMap);
        
        // Fetch appointments
        if (view === 'calendar') {
          const appointmentsData = await fetchAppointments(selectedDate);
          setAppointments(appointmentsData);
        } else if (view === 'list' || view === 'dashboard') {
          const allAppointments = await fetchAllAppointments();
          setAppointments(allAppointments);
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
        toast.error('Failed to load appointment data');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadInitialData();
    
    // Poll for updates every 60 seconds
    const intervalId = setInterval(async () => {
      try {
        const { stats, dateMap } = await fetchDashboardStats();
        setStats(stats);
        setAppointmentDates(dateMap);
      } catch (error) {
        console.error('Error polling for updates:', error);
      }
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, []);

  // This effect will update the view when initialView changes (from sidebar)
  useEffect(() => {
    setView(initialView === 'pending' ? 'list' : initialView);
    
    // When switching views, load appropriate data
    const loadViewData = async () => {
      setIsLoading(true);
      try {
        if (initialView === 'calendar') {
          const appointmentsData = await fetchAppointments(selectedDate);
          setAppointments(appointmentsData);
        } else if (initialView === 'pending') {
          // Special case for pending - set list tab to pending
          setListTab('pending');
          const allAppointments = await fetchAllAppointments();
          setAppointments(allAppointments);
        } else if (initialView === 'list') {
          // Default to 'all' tab for normal list view
          setListTab('all');
          const allAppointments = await fetchAllAppointments();
          setAppointments(allAppointments);
        } else if (initialView === 'dashboard') {
          const allAppointments = await fetchAllAppointments();
          setAppointments(allAppointments);
          await fetchDashboardStats();
        } else if (initialView === 'settings') {
          await fetchSettings();
        }
      } catch (error) {
        console.error('Error loading view data:', error);
        toast.error('Failed to load appointments data');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadViewData();
  }, [initialView]); // REMOVE selectedDate from dependencies

  // Handle date change in calendar
  const handleDateChange = async (date, e) => {
    // Prevent default behavior if it's an event
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    
    try {
      setSelectedDate(date);
      setIsLoading(true);
      const appointmentsData = await fetchAppointments(date);
      setAppointments(appointmentsData);
    } catch (error) {
      toast.error('Failed to load appointments for selected date');
    } finally {
      setIsLoading(false);
    }
  };

  // Update handleViewChange to be simpler
  const handleViewChange = (newView) => {
    setView(newView);
  };

  // Handle confirm appointment
  const handleConfirmAppointment = async (appointmentId) => {
    try {
      await confirmAppointment(appointmentId);
      toast.success('Appointment confirmed successfully');
      
      // Update local state
      setAppointments(appointments.map(appt => 
        appt.id === appointmentId ? { ...appt, status: 'confirmed' } : appt
      ));
      
      if (activeAppointment?.id === appointmentId) {
        setActiveAppointment({...activeAppointment, status: 'confirmed'});
      }
      
      // Refresh stats
      const { stats, dateMap } = await fetchDashboardStats();
      setStats(stats);
      setAppointmentDates(dateMap);
    } catch (error) {
      toast.error('Failed to confirm appointment');
    }
  };

  // Handle cancel appointment
  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    
    try {
      await cancelAppointment(appointmentId);
      toast.success('Appointment cancelled successfully');
      
      // Update local state
      setAppointments(appointments.map(appt => 
        appt.id === appointmentId ? { ...appt, status: 'cancelled' } : appt
      ));
      
      if (activeAppointment?.id === appointmentId) {
        setActiveAppointment({...activeAppointment, status: 'cancelled'});
      }
      
      // Refresh stats
      const { stats, dateMap } = await fetchDashboardStats();
      setStats(stats);
      setAppointmentDates(dateMap);
    } catch (error) {
      toast.error('Failed to cancel appointment');
    }
  };

  // Handle save settings
  const handleSaveSettings = async (updatedSettings) => {
    try {
      await saveSettings(updatedSettings);
      setSettings(updatedSettings);
      toast.success('Settings saved successfully');
      return true;  // Return success so the SettingsView can update its state
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
      throw error;  // Re-throw to let SettingsView know it failed
    }
  };

  // Handle clean up old appointments
  const handleCleanup = async () => {
    if (!window.confirm('This will remove appointments older than 6 months. Continue?')) return;
    
    try {
      const removed = await cleanupAppointments();
      toast.success(`Removed ${removed} old appointments`);
      
      // Refresh appointments and stats
      const allAppointments = await fetchAllAppointments();
      setAppointments(allAppointments);
      
      const { stats, dateMap } = await fetchDashboardStats();
      setStats(stats);
      setAppointmentDates(dateMap);
    } catch (error) {
      toast.error('Failed to clean up old appointments');
    }
  };

  // Add this function to replace the calendar view with an enhanced filtering system
  const renderDateFilters = () => {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-medium text-lg mb-4">Date Filtering</h3>
        
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <button 
            onClick={() => filterAppointmentsByDate('today')}
            className={`p-4 text-left rounded-lg border ${
              dateFilter === 'today' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">Today</span>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                {stats.today || 0}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">{format(new Date(), 'MMM d, yyyy')}</p>
          </button>
          
          <button 
            onClick={() => filterAppointmentsByDate('tomorrow')}
            className={`p-4 text-left rounded-lg border ${
              dateFilter === 'tomorrow' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">Tomorrow</span>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                {stats.tomorrow || 0}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">{format(addDays(new Date(), 1), 'MMM d, yyyy')}</p>
          </button>
          
          <button 
            onClick={() => filterAppointmentsByDate('thisWeek')}
            className={`p-4 text-left rounded-lg border ${
              dateFilter === 'thisWeek' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">This Week</span>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                {stats.week || 0}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">Next 7 days</p>
          </button>
          
          <button 
            onClick={() => filterAppointmentsByDate('thisMonth')}
            className={`p-4 text-left rounded-lg border ${
              dateFilter === 'thisMonth' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">This Month</span>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                {stats.month || 0}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">{format(new Date(), 'MMMM yyyy')}</p>
          </button>
        </div>
        
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Specific Date</label>
          <div className="flex items-center">
            <input 
              type="date" 
              value={format(selectedDate, 'yyyy-MM-dd')}
              onChange={(e) => {
                const date = new Date(e.target.value);
                filterAppointmentsByDate('specific', date);
              }}
              className="p-2 border border-gray-300 rounded w-full"
            />
          </div>
        </div>
        
        {dateFilter === 'specific' && (
          <div className="mt-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium">
              Appointments for {format(selectedDate, 'MMMM d, yyyy')}
            </h4>
            <p className="text-sm text-gray-600 mt-1">
              {appointments.filter(a => a.date === format(selectedDate, 'yyyy-MM-dd')).length} appointment(s)
            </p>
          </div>
        )}
      </div>
    );
  };

  // Function to fetch appointments for a specific date
  const fetchAppointmentsForDate = async (date) => {
    try {
      setIsLoading(true);
      
      // First get all appointments
      const allAppointments = await fetchAllAppointments();
      
      // Then manually filter for the exact date
      const selectedDateStr = format(date, 'yyyy-MM-dd');
      const filteredAppointments = allAppointments.filter(appointment => 
        appointment.date === selectedDateStr
      );
      
      setAppointments(filteredAppointments);
    } catch (error) {
      toast.error('Failed to load appointments for the selected date');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch appointments for a date range
  const fetchAppointmentsForRange = async (rangeType) => {
    try {
      setIsLoading(true);
      let startDate = new Date();
      let endDate = new Date();
      
      // Set appropriate date range based on type
      if (rangeType === 'thisWeek') {
        // Start with today and end 7 days later
        startDate.setHours(0, 0, 0, 0);
        endDate.setDate(startDate.getDate() + 7);
        endDate.setHours(23, 59, 59, 999);
      } else if (rangeType === 'thisMonth') {
        // Start with first day of current month
        startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        // End with last day of current month
        endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
      } else if (rangeType === 'custom') {
        startDate = new Date(customDateRange.start);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(customDateRange.end);
        endDate.setHours(23, 59, 59, 999);
      }
      
      // Fetch all appointments and filter client-side
      const allAppointments = await fetchAllAppointments();
      const filteredAppointments = allAppointments.filter(appointment => {
        const appointmentDate = new Date(appointment.date);
        return appointmentDate >= startDate && appointmentDate <= endDate;
      });
      
      setAppointments(filteredAppointments);
    } catch (error) {
      toast.error('Failed to load appointments for the selected date range');
    } finally {
      setIsLoading(false);
    }
  };

  // Single function to handle all date filtering
  const filterAppointmentsByDate = async (filterType, date = new Date()) => {
    setIsLoading(true);
    setDateFilter(filterType);
    
    try {
      const allAppointments = await fetchAllAppointments();
      let filtered = [];
      
      switch (filterType) {
        case 'today': {
          const todayStr = format(new Date(), 'yyyy-MM-dd');
          console.log(`Filtering for today: ${todayStr}`);
          filtered = allAppointments.filter(a => a.date === todayStr);
          break;
        }
        case 'tomorrow': {
          const tomorrow = addDays(new Date(), 1);
          const tomorrowStr = format(tomorrow, 'yyyy-MM-dd');
          console.log(`Filtering for tomorrow: ${tomorrowStr}`);
          filtered = allAppointments.filter(a => a.date === tomorrowStr);
          break;
        }
        case 'thisWeek': {
          const today = new Date();
          const nextWeek = addDays(today, 7);
          console.log(`Filtering for week: ${format(today, 'yyyy-MM-dd')} to ${format(nextWeek, 'yyyy-MM-dd')}`);
          filtered = allAppointments.filter(a => {
            const apptDate = new Date(a.date);
            return apptDate >= today && apptDate <= nextWeek;
          });
          break;
        }
        case 'thisMonth': {
          const today = new Date();
          const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
          const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          console.log(`Filtering for month: ${format(firstDay, 'yyyy-MM-dd')} to ${format(lastDay, 'yyyy-MM-dd')}`);
          filtered = allAppointments.filter(a => {
            const apptDate = new Date(a.date);
            return apptDate >= firstDay && apptDate <= lastDay;
          });
          break;
        }
        case 'specific': {
          const dateStr = format(date, 'yyyy-MM-dd');
          console.log(`Filtering for specific date: ${dateStr}`);
          filtered = allAppointments.filter(a => a.date === dateStr);
          break;
        }
        default:
          filtered = allAppointments;
      }
      
      // IMPORTANT: Change the order here
      handleViewChange('calendar'); // Set view FIRST
      console.log(`Found ${filtered.length} appointments for ${filterType}`);
      setAppointments(filtered);
      setSelectedDate(date); // Set date LAST so it doesn't trigger unwanted effects
      
      return filtered;
    } catch (error) {
      console.error('Error filtering appointments:', error);
      toast.error('Failed to filter appointments');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
        <h2 className="text-2xl font-bold">Appointments</h2>
        
        {/* Mobile Tab Navigation */}
        <div className="flex w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex space-x-2 min-w-max">
            <button 
              className={`px-3 py-1.5 rounded-lg ${view === 'dashboard' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
              onClick={() => handleViewChange('dashboard')}
            >
              Dashboard
            </button>
            <button 
              className={`px-3 py-1.5 rounded-lg ${view === 'calendar' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
              onClick={() => handleViewChange('calendar')}
            >
              Calendar
            </button>
            <button 
              className={`px-3 py-1.5 rounded-lg ${view === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
              onClick={() => handleViewChange('list')}
            >
              List
            </button>
            <button 
              className={`px-3 py-1.5 rounded-lg ${view === 'settings' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
              onClick={() => handleViewChange('settings')}
            >
              Settings
            </button>
          </div>
        </div>
      </div>
      
      {/* Views */}
      {view === 'dashboard' && (
        <DashboardView 
          stats={stats} 
          appointments={appointments.filter(a => a.status === 'pending')}
          isLoading={isLoading}
          onViewAppointment={setActiveAppointment}
          onConfirmAppointment={handleConfirmAppointment}
          onCancelAppointment={handleCancelAppointment}
          onViewAllClick={() => handleViewChange('list')}
          onViewTodayClick={() => {
            setSelectedDate(new Date());
            setDateFilter('today');
            fetchAppointmentsForDate(new Date());
            // View change will happen after state updates
            setTimeout(() => handleViewChange('calendar'), 0);
          }}
          onViewCalendarClick={() => {
            setDateFilter('thisWeek');
            fetchAppointmentsForRange('thisWeek');
            // View change will happen after state updates
            setTimeout(() => handleViewChange('calendar'), 0);
          }}
        />
      )}
      
      {view === 'calendar' && (
        <div className="space-y-6">
          {renderDateFilters()}
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-medium text-lg mb-4">
              {dateFilter === 'specific' 
                ? `Appointments for ${format(selectedDate, 'MMMM d, yyyy')}` 
                : dateFilter === 'today'
                ? 'Today\'s Appointments'
                : dateFilter === 'tomorrow'
                ? 'Tomorrow\'s Appointments'
                : dateFilter === 'thisWeek'
                ? 'This Week\'s Appointments'
                : 'This Month\'s Appointments'}
            </h3>
            
            {/* Debug info */}
            <div className="text-xs text-gray-500 mb-4">
              Active filter: {dateFilter}
              {dateFilter === 'today' && ` (${format(new Date(), 'yyyy-MM-dd')})`}
              {dateFilter === 'tomorrow' && ` (${format(addDays(new Date(), 1), 'yyyy-MM-dd')})`}
              {dateFilter === 'specific' && ` (${format(selectedDate, 'yyyy-MM-dd')})`}
              <br />
              Showing {appointments.length} appointment(s)
            </div>
            
            {/* Rest of appointment display logic */}
            {isLoading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
              </div>
            ) : appointments.length === 0 ? (
              <p className="text-gray-500 py-10 text-center">No appointments scheduled for this time period.</p>
            ) : (
              <div className="space-y-4">
                {appointments
                  .sort((a, b) => {
                    // First sort by date string (yyyy-MM-dd format)
                    const dateA = a.date;
                    const dateB = b.date;
                    if (dateA !== dateB) {
                      return dateA.localeCompare(dateB);
                    }
                    
                    // If same date, sort by time in 24-hour format for proper ordering
                    // Convert time like "2:30 PM" to comparable format
                    const getTimeMinutes = (timeStr) => {
                      const [time, period] = timeStr.split(' ');
                      let [hours, minutes] = time.split(':').map(Number);
                      if (period === 'PM' && hours !== 12) hours += 12;
                      if (period === 'AM' && hours === 12) hours = 0;
                      return hours * 60 + minutes;
                    };
                    
                    return getTimeMinutes(a.time) - getTimeMinutes(b.time);
                  })
                  .map(appointment => (
                    <div 
                      key={appointment.id} 
                      className={`border rounded-lg p-3 ${
                        appointment.status === 'pending' ? 'border-yellow-300 bg-yellow-50' :
                        appointment.status === 'confirmed' ? 'border-green-300 bg-green-50' :
                        'border-red-300 bg-red-50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center flex-wrap mb-1 gap-1">
                            <h4 className="font-medium text-gray-900">{appointment.customer?.name || 'No name'}</h4>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
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
                            <span className="font-medium">Date:</span> {
                              // First, parse the date consistently
                              (() => {
                                try {
                                  // Log the raw date for debugging
                                  console.log("Raw date value:", appointment.date);
                                  
                                  // Try to parse the date and format it consistently
                                  const dateObj = new Date(appointment.date);
                                  return dateObj.toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit'
                                  });
                                } catch (e) {
                                  console.error("Date parsing error:", e);
                                  return appointment.date; // Fall back to raw value
                                }
                              })()
                            }</p>
                          <p className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">Service:</span> {appointment.service || 'General Appointment'}
                          </p>
                          <p className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">Contact:</span> {appointment.customer?.email}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-gray-200">
                        <button 
                          onClick={() => setActiveAppointment(appointment)}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded"
                        >
                          View
                        </button>
                        {appointment.status === 'pending' && (
                          <button 
                            onClick={() => handleConfirmAppointment(appointment.id)} 
                            className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded"
                          >
                            Confirm
                          </button>
                        )}
                        {appointment.status !== 'cancelled' && (
                          <button 
                            onClick={() => handleCancelAppointment(appointment.id)}
                            className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
      
      {view === 'list' && (
        <ListView 
          appointments={appointments}
          isLoading={isLoading}
          listTab={listTab}
          setListTab={setListTab}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          customDateRange={customDateRange}
          setCustomDateRange={setCustomDateRange}
          onViewAppointment={setActiveAppointment}
          onConfirmAppointment={handleConfirmAppointment}
          onCancelAppointment={handleCancelAppointment}
        />
      )}
      
      {view === 'settings' && settings && (
        <SettingsView 
          settings={settings}
          onSaveSettings={handleSaveSettings}
          onCleanup={handleCleanup}
        />
      )}
      
      {/* Appointment Detail Modal */}
      {activeAppointment && (
        <AppointmentDetailModal
          appointment={activeAppointment}
          onClose={() => setActiveAppointment(null)}
          onConfirm={handleConfirmAppointment}
          onCancel={handleCancelAppointment}
        />
      )}
    </div>
  );
}