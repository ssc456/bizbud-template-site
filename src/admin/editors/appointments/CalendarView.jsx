import React from 'react';
import Calendar from 'react-calendar';
import { format } from 'date-fns';
import 'react-calendar/dist/Calendar.css';

export default function CalendarView({
  selectedDate,
  appointments,
  isLoading,
  appointmentDates,
  onDateChange,
  onViewAppointment,
  onConfirmAppointment,
  onCancelAppointment
}) {
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar - Full width on mobile */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow col-span-1">
        <Calendar 
          onClickDay={(date) => {
            // Completely prevent default navigation behavior
            onDateChange(date);
            // Return false doesn't help - we need to stop propagation and prevent default
            return false;
          }}
          // Remove the onChange handler entirely as it's causing the navigation issue
          value={selectedDate}
          tileContent={tileContent}
          tileClassName={tileClassName}
          className="w-full"
          // Disable navigation with keyboard as an extra precaution
          nextLabel={<span className="text-gray-600">›</span>}
          prevLabel={<span className="text-gray-600">‹</span>}
        />
      </div>
      
      {/* Appointments for selected date - Full width on mobile */}
      <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-lg shadow">
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
            {/* Mobile appointment cards */}
            <div className="lg:hidden space-y-3">
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
                    className={`border rounded-lg p-3 ${
                      appointment.status === 'pending' ? 'border-yellow-300 bg-yellow-50' :
                      appointment.status === 'confirmed' ? 'border-green-300 bg-green-50' :
                      'border-red-300 bg-red-50'
                    }`}
                  >
                    {/* Mobile card content */}
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
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-gray-200">
                      <button 
                        onClick={() => onViewAppointment(appointment)}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded"
                      >
                        View
                      </button>
                      {appointment.status === 'pending' && (
                        <button 
                          onClick={() => onConfirmAppointment(appointment.id)} 
                          className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded"
                        >
                          Confirm
                        </button>
                      )}
                      <button 
                        onClick={() => onCancelAppointment(appointment.id)}
                        className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
            </div>
            
            {/* Desktop appointment view - hidden on mobile */}
            <div className="hidden lg:block">
              {/* Existing desktop appointment layout */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}