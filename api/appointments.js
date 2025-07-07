import { Redis } from '@upstash/redis';
import { addMinutes, parse, format, parseISO, isAfter } from 'date-fns';

// Try to import email module, but don't fail if it's not available
let sendEmail;
try {
  const emailModule = await import('./utils/email.js');
  sendEmail = emailModule.sendEmail;
} catch (error) {
  console.warn('[Appointments API] Email module not available, emails will be logged only');
  // Provide a fallback implementation that just logs
  sendEmail = async ({ to, subject, text }) => {
    console.log(`[Email Log] To: ${to}, Subject: ${subject}, Body: ${text}`);
    return { success: true, mock: true };
  };
}

// Initialize Redis client
const redis = (() => {
  const url = process.env.KV_REST_API_URL?.trim();
  const token = process.env.KV_REST_API_TOKEN?.trim();
  
  if (!url || !token) {
    console.error('[Appointments API] Missing Redis credentials');
    return null;
  }

  return new Redis({ url, token });
})();

export default async function handler(req, res) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-CSRF-Token');
    return res.status(200).end();
  }
  
  const { action, siteId } = req.query;
  
  if (!siteId) {
    return res.status(400).json({ error: 'Site ID is required' });
  }
  
  // Check if appointments feature is enabled for this site
  try {
    const clientData = await redis.get(`site:${siteId}:client`);
    if (!clientData?.config?.showAppointments) {
      return res.status(404).json({ error: 'Appointment feature not enabled for this site' });
    }
  } catch (error) {
    console.error('Error checking appointment config:', error);
    // Continue anyway since this is just a secondary check
  }
  
  if (!redis) {
    return res.status(500).json({ error: 'Database connection unavailable' });
  }
  
  try {
    switch (action) {
      case 'settings':
        if (req.method === 'GET') {
          return await getSettings(req, res, siteId);
        } else if (req.method === 'POST') {
          return await saveSettings(req, res, siteId);
        }
        break;
        
      case 'availability':
        return await getAvailability(req, res, siteId);
        
      case 'book':
        if (req.method !== 'POST') {
          return res.status(405).json({ error: 'Method not allowed' });
        }
        return await bookAppointment(req, res, siteId);
        
      case 'list':
        return await listAppointments(req, res, siteId);
        
      case 'update':
        if (req.method !== 'PUT') {
          return res.status(405).json({ error: 'Method not allowed' });
        }
        return await updateAppointment(req, res, siteId);
        
      case 'cancel':
        if (req.method !== 'DELETE') {
          return res.status(405).json({ error: 'Method not allowed' });
        }
        return await cancelAppointment(req, res, siteId);
        
      case 'cleanup':
        if (req.method !== 'POST') {
          return res.status(405).json({ error: 'Method not allowed' });
        }
        return await cleanupAppointments(req, res, siteId);
        
      case 'confirm':
        if (req.method !== 'POST') {
          return res.status(405).json({ error: 'Method not allowed' });
        }
        return await confirmAppointment(req, res, siteId);
        
      case 'pendingCount':
        return await getPendingCount(req, res, siteId);
        
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error(`[Appointments API] Error:`, error);
    return res.status(500).json({ error: 'Server error processing appointment request' });
  }
}

// Handler functions for each action
async function getSettings(req, res, siteId) {
  const settings = await redis.get(`site:${siteId}:appointments:settings`);
  
  // If no settings exist, return defaults
  if (!settings) {
    const defaultSettings = {
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
    };
    return res.status(200).json(defaultSettings);
  }
  
  return res.status(200).json(settings);
}

async function saveSettings(req, res, siteId) {
  const { settings } = req.body;
  
  if (!settings) {
    return res.status(400).json({ error: 'Settings object is required' });
  }
  
  try {
    // Basic validation
    if (!settings.workingHours || !settings.durations || !settings.serviceTypes) {
      return res.status(400).json({ error: 'Invalid settings format' });
    }
    
    // Save to Redis
    await redis.set(`site:${siteId}:appointments:settings`, settings);
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(`[Appointments API] Error saving settings:`, error);
    return res.status(500).json({ error: 'Failed to save settings' });
  }
}

async function getAvailability(req, res, siteId) {
  const { date, year, month } = req.query;
  
  // Get the settings
  const settings = await redis.get(`site:${siteId}:appointments:settings`) || {
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
    ]
  };
  
  // If date is provided, get available time slots for that day
  if (date) {
    const dateObj = parseISO(date);
    const dayOfWeek = format(dateObj, 'EEEE').toLowerCase();
    
    console.log(`Checking availability for ${date} (${dayOfWeek})`);
    
    // Check if this day is enabled
    const daySettings = settings.workingHours[dayOfWeek];
    if (!daySettings || !daySettings.enabled) {
      console.log(`${dayOfWeek} is not enabled in settings`);
      return res.status(200).json({ availableSlots: [] });
    }
    
    console.log(`${dayOfWeek} is enabled: ${daySettings.start}-${daySettings.end}`);
    
    // Get already booked appointments for this day
    const bookedAppointments = await redis.get(`site:${siteId}:appointments:bookings`) || [];
    const todaysBookings = bookedAppointments.filter(appt => 
      appt.date === date
    );
    
    // Create booking objects with the target date included
    const bookingsWithDate = todaysBookings.map(booking => ({
      ...booking,
      dateObject: dateObj
    }));
    
    // If there are no bookings, create a placeholder with the date
    if (bookingsWithDate.length === 0) {
      bookingsWithDate.push({
        dateObject: dateObj,
        date: date,
        placeholder: true
      });
    }
    
    console.log(`Found ${todaysBookings.length} bookings for ${date}`);
    
    // Generate time slots
    const slots = generateTimeSlots(
      daySettings.start,
      daySettings.end,
      settings.duration,
      settings.bufferTime,
      bookingsWithDate
    );
    
    // Return available slots, durations, and service types
    return res.status(200).json({ 
      availableSlots: slots,
      durations: settings.durations?.filter(d => d.enabled) || [],
      serviceTypes: settings.serviceTypes?.filter(s => s.enabled) || [
        { id: 'general', name: 'General Appointment', enabled: true }
      ]
    });
  }
  
  // If year and month are provided, get available dates for that month
  if (year && month) {
    // Generate all dates in this month
    const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
    const availableDates = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(parseInt(year), parseInt(month) - 1, day);
      
      // Skip dates in the past
      if (isAfter(currentDate, new Date())) {
        const dayOfWeek = format(currentDate, 'EEEE').toLowerCase();
        const daySettings = settings.workingHours[dayOfWeek];
        
        if (daySettings && daySettings.enabled) {
          availableDates.push(format(currentDate, 'yyyy-MM-dd'));
        }
      }
    }
    
    return res.status(200).json({ availableDates });
  }
  
  return res.status(400).json({ error: 'Date or year/month parameters required' });
}

async function bookAppointment(req, res, siteId) {
  // Extract service from request body
  const { date, time, duration, service, serviceId, customer } = req.body;
  
  if (!date || !time || !customer) {
    return res.status(400).json({ error: 'Missing required booking information' });
  }
  
  // Validate customer data
  if (!customer.name || !customer.email || !customer.phone) {
    return res.status(400).json({ error: 'Customer information incomplete' });
  }
  
  try {
    // Check if slot is still available
    const dateObj = parseISO(date);
    const startTime = parse(time, 'h:mm a', dateObj);
    const endTime = addMinutes(startTime, parseInt(duration) || 30);
    
    // Get existing bookings
    const bookings = await redis.get(`site:${siteId}:appointments:bookings`) || [];
    
    // Check for conflicts
    const hasConflict = bookings.some(booking => {
      if (booking.date !== date) return false;
      
      const bookingStart = parse(booking.time, 'h:mm a', dateObj);
      const bookingEnd = addMinutes(bookingStart, parseInt(booking.duration) || 30);
      
      return (
        (startTime >= bookingStart && startTime < bookingEnd) ||
        (endTime > bookingStart && endTime <= bookingEnd) ||
        (startTime <= bookingStart && endTime >= bookingEnd)
      );
    });
    
    if (hasConflict) {
      return res.status(409).json({ 
        error: 'This time slot is no longer available. Please select another time.' 
      });
    }
    
    // Create appointment with service info
    const appointment = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
      date,
      time,
      duration: duration || 30,
      service,
      serviceId,
      customer,
      status: 'pending', // Change from 'confirmed' to 'pending'
      createdAt: new Date().toISOString()
    };
    
    // Add to bookings
    bookings.push(appointment);
    
    // Save updated bookings
    await redis.set(`site:${siteId}:appointments:bookings`, bookings);
    
    // 1. Send email to customer
    try {
      const emailResult = await sendEmail({
        to: customer.email,
        subject: `Appointment Request Received - ${businessName || siteId}`,
        text: `Thank you for your appointment request on ${date} at ${time}. We will confirm your request shortly.`,
        html: `
          <h2>Appointment Request Received</h2>
          <p>Thank you for requesting an appointment with ${businessName || siteId}.</p>
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Time:</strong> ${time}</p>
          <p><strong>Service:</strong> ${appointment.service || 'General Appointment'}</p>
          <p>We will review your request and send you a confirmation email shortly.</p>
        `
      });
      
      if (!emailResult.success) {
        console.warn(`[Appointments API] Customer confirmation email wasn't sent: ${emailResult.error}`);
      }
    } catch (emailError) {
      console.error('[Appointments API] Failed to send customer confirmation email:', emailError);
      // Continue anyway - don't break appointment booking just because email failed
    }
    
    // 2. Send notification to site owner
    try {
      // Get site owner email from client data
      const clientData = await redis.get(`site:${siteId}:client`);
      const ownerEmail = clientData?.adminEmail || clientData?.email;
      
      if (ownerEmail) {
        await sendEmail({
          to: ownerEmail,
          subject: `New Appointment Request - ${businessName || siteId}`,
          text: `A new appointment has been requested for ${date} at ${time}.`,
          html: `
            <h2>New Appointment Request</h2>
            <p>A new appointment has been requested.</p>
            <p><strong>Customer:</strong> ${customer.name}</p>
            <p><strong>Email:</strong> ${customer.email}</p>
            <p><strong>Phone:</strong> ${customer.phone}</p>
            <p><strong>Date:</strong> ${date}</p>
            <p><strong>Time:</strong> ${time}</p>
            <p><strong>Service:</strong> ${appointment.service || 'General Appointment'}</p>
            <p><strong>Notes:</strong> ${customer.notes || 'No notes provided'}</p>
            <p>To confirm or cancel this appointment, please log in to your <a href="https://${siteId}.entrynets.com/admin/appointments">appointment dashboard</a>.</p>
          `
        });
      }
    } catch (emailError) {
      console.error('Failed to send owner notification email:', emailError);
    }
    
    // Return success
    return res.status(200).json({ 
      success: true,
      appointment
    });
  } catch (error) {
    console.error(`[Appointments API] Error booking appointment:`, error);
    return res.status(500).json({ error: 'Failed to book appointment' });
  }
}

async function listAppointments(req, res, siteId) {
  try {
    // Check if this is an admin request
    const isAdminRequest = req.headers.referer?.includes('/admin/dashboard');
    
    if (isAdminRequest) {
      // Verify admin authentication
      const cookies = req.cookies || {};
      const authToken = cookies.adminToken;
      
      if (!authToken) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const tokenSiteId = await redis.get(`auth:${authToken}`);
      if (!tokenSiteId || tokenSiteId !== siteId) {
        return res.status(403).json({ error: 'Not authorized for this site' });
      }
    }
    
    // Get bookings
    const bookings = await redis.get(`site:${siteId}:appointments:bookings`) || [];
    
    // Filter by date range if provided
    const { start, end } = req.query;
    let filteredBookings = bookings;
    
    if (start) {
      filteredBookings = filteredBookings.filter(booking => 
        booking.date >= start
      );
    }
    
    if (end) {
      filteredBookings = filteredBookings.filter(booking => 
        booking.date <= end
      );
    }
    
    return res.status(200).json({ appointments: filteredBookings });
  } catch (error) {
    console.error(`[Appointments API] Error listing appointments:`, error);
    return res.status(500).json({ error: 'Failed to retrieve appointments' });
  }
}

async function updateAppointment(req, res, siteId) {
  // Implement logic for updating an appointment (admin only)
  const { appointmentId, updates } = req.body;
  
  if (!appointmentId || !updates) {
    return res.status(400).json({ error: 'Appointment ID and updates are required' });
  }
  
  // Verify admin authentication
  const cookies = req.cookies || {};
  const authToken = cookies.adminToken;
  
  if (!authToken) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const tokenSiteId = await redis.get(`auth:${authToken}`);
  if (!tokenSiteId || tokenSiteId !== siteId) {
    return res.status(403).json({ error: 'Not authorized for this site' });
  }
  
  try {
    // Get bookings
    const bookings = await redis.get(`site:${siteId}:appointments:bookings`) || [];
    
    // Find and update the appointment
    const appointmentIndex = bookings.findIndex(appt => appt.id === appointmentId);
    
    if (appointmentIndex === -1) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    // Update the appointment
    bookings[appointmentIndex] = {
      ...bookings[appointmentIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    // Save updated bookings
    await redis.set(`site:${siteId}:appointments:bookings`, bookings);
    
    return res.status(200).json({
      success: true,
      appointment: bookings[appointmentIndex]
    });
  } catch (error) {
    console.error(`[Appointments API] Error updating appointment:`, error);
    return res.status(500).json({ error: 'Failed to update appointment' });
  }
}

async function cancelAppointment(req, res, siteId) {
  const { appointmentId } = req.query;
  
  if (!appointmentId) {
    return res.status(400).json({ error: 'Appointment ID is required' });
  }
  
  try {
    // Get bookings
    const bookings = await redis.get(`site:${siteId}:appointments:bookings`) || [];
    
    // Find the appointment
    const appointmentIndex = bookings.findIndex(appt => appt.id === appointmentId);
    
    if (appointmentIndex === -1) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    // Store the appointment for email notification
    const cancelledAppointment = bookings[appointmentIndex];
    
    // Mark as cancelled instead of removing
    bookings[appointmentIndex] = {
      ...bookings[appointmentIndex],
      status: 'cancelled',
      cancelledAt: new Date().toISOString()
    };
    
    // Save updated bookings
    await redis.set(`site:${siteId}:appointments:bookings`, bookings);
    
    // Send cancellation email
    try {
      await sendEmail({
        to: cancelledAppointment.customer.email,
        subject: `Appointment Cancelled - ${siteId}`,
        text: `Your appointment on ${cancelledAppointment.date} at ${cancelledAppointment.time} has been cancelled.`,
        html: `
          <h2>Appointment Cancelled</h2>
          <p>Your appointment has been cancelled.</p>
          <p><strong>Date:</strong> ${cancelledAppointment.date}</p>
          <p><strong>Time:</strong> ${cancelledAppointment.time}</p>
          <p>If you did not request this cancellation, please contact us.</p>
        `
      });
    } catch (emailError) {
      console.error('Failed to send cancellation email:', emailError);
      // Continue anyway
    }
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(`[Appointments API] Error cancelling appointment:`, error);
    return res.status(500).json({ error: 'Failed to cancel appointment' });
  }
}

// Add this function to periodically clean up old appointments

async function cleanupOldAppointments(siteId) {
  try {
    // Get all bookings
    const bookings = await redis.get(`site:${siteId}:appointments:bookings`) || [];
    
    // Keep only appointments newer than 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const dateThreshold = format(sixMonthsAgo, 'yyyy-MM-dd');
    
    const filteredBookings = bookings.filter(booking => 
      booking.date > dateThreshold || booking.status === 'upcoming'
    );
    
    // Only update if we removed something
    if (filteredBookings.length < bookings.length) {
      await redis.set(`site:${siteId}:appointments:bookings`, filteredBookings);
      return bookings.length - filteredBookings.length; // Number removed
    }
    
    return 0;
  } catch (error) {
    console.error('Error cleaning up old appointments:', error);
    return -1;
  }
}

// New function to handle cleanup request
async function cleanupAppointments(req, res, siteId) {
  try {
    const removed = await cleanupOldAppointments(siteId);
    return res.status(200).json({ success: true, removed });
  } catch (error) {
    console.error(`[Appointments API] Error cleaning up appointments:`, error);
    return res.status(500).json({ error: 'Failed to clean up appointments' });
  }
}

// New function to confirm an appointment
async function confirmAppointment(req, res, siteId) {
  const { appointmentId } = req.body;
  
  if (!appointmentId) {
    return res.status(400).json({ error: 'Appointment ID is required' });
  }
  
  // Verify admin authentication
  const cookies = req.cookies || {};
  const authToken = cookies.adminToken;
  
  if (!authToken) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const tokenSiteId = await redis.get(`auth:${authToken}`);
  if (!tokenSiteId || tokenSiteId !== siteId) {
    return res.status(403).json({ error: 'Not authorized for this site' });
  }
  
  try {
    // Get bookings
    const bookings = await redis.get(`site:${siteId}:appointments:bookings`) || [];
    
    // Find the appointment
    const appointmentIndex = bookings.findIndex(appt => appt.id === appointmentId);
    
    if (appointmentIndex === -1) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    // Update status to confirmed
    bookings[appointmentIndex] = {
      ...bookings[appointmentIndex],
      status: 'confirmed',
      confirmedAt: new Date().toISOString()
    };
    
    // Save updated bookings
    await redis.set(`site:${siteId}:appointments:bookings`, bookings);
    
    // Send confirmation email
    try {
      const appointment = bookings[appointmentIndex];
      const emailResult = await sendEmail({
        to: appointment.customer.email,
        subject: `Appointment Confirmed - ${siteId}`,
        text: `Your appointment on ${appointment.date} at ${appointment.time} has been confirmed.`,
        html: `
          <h2>Appointment Confirmed</h2>
          <p>Your appointment has been confirmed.</p>
          <p><strong>Date:</strong> ${appointment.date}</p>
          <p><strong>Time:</strong> ${appointment.time}</p>
          <p>We look forward to seeing you!</p>
        `
      });
      
      if (!emailResult.success) {
        console.warn(`[Appointments API] Confirmation email wasn't sent: ${emailResult.error}`);
      }
    } catch (emailError) {
      console.error('[Appointments API] Failed to send confirmation email:', emailError);
      // Continue anyway - don't fail the confirmation just because email failed
    }
    
    return res.status(200).json({ 
      success: true,
      appointment: bookings[appointmentIndex]
    });
  } catch (error) {
    console.error(`[Appointments API] Error confirming appointment:`, error);
    return res.status(500).json({ error: 'Failed to confirm appointment' });
  }
}

// New function to get count of pending appointments
async function getPendingCount(req, res, siteId) {
  try {
    // Verify admin authentication
    const cookies = req.cookies || {};
    const authToken = cookies.adminToken;
    
    if (!authToken) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const tokenSiteId = await redis.get(`auth:${authToken}`);
    if (!tokenSiteId || tokenSiteId !== siteId) {
      return res.status(403).json({ error: 'Not authorized for this site' });
    }
    
    // Get bookings
    const bookings = await redis.get(`site:${siteId}:appointments:bookings`) || [];
    
    // Count pending appointments
    const pendingCount = bookings.filter(appt => appt.status === 'pending').length;
    
    return res.status(200).json({ count: pendingCount });
  } catch (error) {
    console.error(`[Appointments API] Error getting pending count:`, error);
    return res.status(500).json({ error: 'Failed to get pending count' });
  }
}

// Helper function to generate available time slots
function generateTimeSlots(startTime, endTime, duration, bufferTime, bookedAppointments) {
  console.log("Generating time slots with:", { startTime, endTime, duration, bufferTime });
  
  const slots = [];
  const now = new Date();
  const today = format(now, 'yyyy-MM-dd');
  
  // Get the target date from the first appointment or use a default date
  // that's definitely not today (to avoid filtering future dates)
  let targetDate;
  if (bookedAppointments.length > 0 && bookedAppointments[0].dateObject) {
    targetDate = bookedAppointments[0].dateObject;
  } else if (bookedAppointments.length > 0 && bookedAppointments[0].date) {
    targetDate = parseISO(bookedAppointments[0].date);
  } else {
    // Use tomorrow as a safe default if no date is available
    targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 1);
  }
  
  console.log("Target date for slots:", targetDate);
  
  // Use the target date for time parsing
  const baseDate = new Date(targetDate);
  baseDate.setHours(0, 0, 0, 0);
  
  // Parse start and end times - IMPORTANT: use 'HH:mm' format for 24-hour time
  const start = parse(startTime, 'HH:mm', baseDate);
  const end = parse(endTime, 'HH:mm', baseDate);
  
  console.log("Time range:", { 
    start: format(start, 'yyyy-MM-dd HH:mm:ss'),
    end: format(end, 'yyyy-MM-dd HH:mm:ss') 
  });
  
  // Generate slots
  let currentSlot = start;
  while (currentSlot < end) {
    const slotEnd = addMinutes(currentSlot, parseInt(duration) || 30);
    
    if (slotEnd <= end) {
      // Format the time slot
      const timeString = format(currentSlot, 'h:mm a');
      
      // Check if slot is booked
      const isBooked = bookedAppointments.some(appt => 
        appt.time === timeString
      );
      
      // Only check for past times if we're dealing with today
      const slotDate = format(currentSlot, 'yyyy-MM-dd');
      const isInPast = slotDate === today && currentSlot <= now;
      
      if (!isBooked && !isInPast) {
        console.log(`Adding available slot: ${timeString}`);
        slots.push({
          time: timeString,
          available: true
        });
      } else {
        console.log(`Skipping slot ${timeString}: ${isBooked ? 'booked' : 'in past'}`);
      }
    }
    
    // Move to next slot
    currentSlot = addMinutes(currentSlot, parseInt(duration) || 30 + parseInt(bufferTime) || 0);
  }
  
  console.log(`Generated ${slots.length} available time slots`);
  return slots;
}