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
  }, [initialView, selectedDate]);

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
            onClick={() => {
              setDateFilter('today');
              setSelectedDate(new Date());
              fetchAppointmentsForDate(new Date());
            }}
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
            onClick={() => {
              setDateFilter('tomorrow');
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              setSelectedDate(tomorrow);
              fetchAppointmentsForDate(tomorrow);
            }}
            className={`p-4 text-left rounded-lg border ${
              dateFilter === 'tomorrow' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">Tomorrow</span>
              {/* You'd need to add a stats.tomorrow count */}
            </div>
            <p className="text-sm text-gray-500 mt-1">{format(addDays(new Date(), 1), 'MMM d, yyyy')}</p>
          </button>
          
          <button 
            onClick={() => {
              setDateFilter('thisWeek');
              fetchAppointmentsForRange('thisWeek');
            }}
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
            onClick={() => {
              setDateFilter('thisMonth');
              fetchAppointmentsForRange('thisMonth');
            }}
            className={`p-4 text-left rounded-lg border ${
              dateFilter === 'thisMonth' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">This Month</span>
              {/* Add monthly count if available */}
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
                setSelectedDate(date);
                setDateFilter('specific');
                fetchAppointmentsForDate(date);
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
            handleViewChange('calendar');
          }}
          onViewCalendarClick={() => handleViewChange('calendar')}
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
            
            {/* Rest of appointment display logic */}
            {isLoading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
              </div>
            ) : appointments.length === 0 ? (
              <p className="text-gray-500 py-10 text-center">No appointments scheduled for this time period.</p>
            ) : (
              <div>
                {/* Display appointments here - you can reuse the mobile card view from ListView */}
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

      {/* Date Filters - New Section */}
      {view === 'calendar' && renderDateFilters()}
    </div>
  );
}