import { format, parseISO, addDays } from 'date-fns';

// Fetch settings
export async function fetchSettings() {
  try {
    const csrfToken = sessionStorage.getItem('csrfToken');
    const extractedSiteId = window.location.hostname.split('.')[0];
    
    const response = await fetch(`/api/appointments?action=settings&siteId=${extractedSiteId}`, {
      credentials: 'include',
      headers: {
        'X-CSRF-Token': csrfToken || ''
      }
    });
    
    if (response.ok) {
      return await response.json();
    }
    throw new Error('Failed to fetch settings');
  } catch (error) {
    console.error('Error fetching settings:', error);
    return null;
  }
}

// Save settings
export async function saveSettings(settings) {
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
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Unknown error');
    }
    
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
}

// Fetch appointments for a specific date
export async function fetchAppointments(date) {
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
    
    if (!response.ok) {
      throw new Error('Failed to fetch appointments');
    }
    
    const data = await response.json();
    // Filter appointments to match the selected date exactly
    const filteredAppointments = (data.appointments || []).filter(
      appt => appt.date === formattedDate
    );
    return filteredAppointments;
  } catch (error) {
    console.error('Error fetching appointments:', error);
    throw error;
  }
}

// Fetch all appointments
export async function fetchAllAppointments() {
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
    
    if (!response.ok) {
      throw new Error('Failed to fetch appointments');
    }
    
    const data = await response.json();
    return data.appointments || [];
  } catch (error) {
    console.error('Error fetching all appointments:', error);
    throw error;
  }
}

// Fetch dashboard stats
export async function fetchDashboardStats() {
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
    
    let pendingCount = 0;
    if (pendingResponse.ok) {
      const pendingData = await pendingResponse.json();
      pendingCount = pendingData.count;
    }
    
    // Fetch all appointments for calculations
    const appointments = await fetchAllAppointments();
    
    // Calculate today's appointments
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    const todayAppointments = appointments.filter(appt => 
      appt.date === todayStr && appt.status !== 'cancelled'
    );
    
    // Calculate this week's appointments
    const nextWeek = addDays(today, 7);
    const weekAppointments = appointments.filter(appt => {
      const apptDate = parseISO(appt.date);
      return appt.status !== 'cancelled' && 
             apptDate >= today && 
             apptDate <= nextWeek;
    });
    
    // Build appointment dates object for calendar highlighting
    const dateMap = {};
    appointments.forEach(appt => {
      if (!dateMap[appt.date]) {
        dateMap[appt.date] = { total: 0, pending: 0 };
      }
      dateMap[appt.date].total++;
      if (appt.status === 'pending') {
        dateMap[appt.date].pending++;
      }
    });
    
    return {
      stats: {
        pending: pendingCount,
        today: todayAppointments.length,
        week: weekAppointments.length
      },
      dateMap
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      stats: { pending: 0, today: 0, week: 0 },
      dateMap: {}
    };
  }
}

// Confirm an appointment
export async function confirmAppointment(appointmentId) {
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
    
    if (!response.ok) {
      throw new Error('Failed to confirm appointment');
    }
    
    return true;
  } catch (error) {
    console.error('Error confirming appointment:', error);
    throw error;
  }
}

// Cancel an appointment
export async function cancelAppointment(appointmentId) {
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
    
    if (!response.ok) {
      throw new Error('Failed to cancel appointment');
    }
    
    return true;
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    throw error;
  }
}

// Clean up old appointments
export async function cleanupAppointments() {
  try {
    const csrfToken = sessionStorage.getItem('csrfToken');
    const extractedSiteId = window.location.hostname.split('.')[0];
    
    const response = await fetch(
      `/api/appointments?action=cleanup&siteId=${extractedSiteId}`, 
      {
        method: 'POST',
        credentials: 'include',
        headers: { 'X-CSRF-Token': csrfToken || '' }
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to clean up old appointments');
    }
    
    const data = await response.json();
    return data.removed;
  } catch (error) {
    console.error('Error cleaning up appointments:', error);
    throw error;
  }
}