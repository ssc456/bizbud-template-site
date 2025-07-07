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
      <div className="bg-white p-6 rounded-lg shadow">
        <Calendar 
          onChange={onDateChange}
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
                      <button 
                        onClick={() => onViewAppointment(appointment)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded text-sm"
                      >
                        View
                      </button>
                      {appointment.status === 'pending' && (
                        <button 
                          onClick={() => onConfirmAppointment(appointment.id)} 
                          className="px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded text-sm"
                        >
                          Confirm
                        </button>
                      )}
                      <button 
                        onClick={() => onCancelAppointment(appointment.id)}
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
  );
}