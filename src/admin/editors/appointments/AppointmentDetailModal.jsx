import React from 'react';

export default function AppointmentDetailModal({ appointment, onClose, onConfirm, onCancel }) {
  if (!appointment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium">
            Appointment Details
            <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }`}>
              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
            </span>
          </h3>
          <button 
            onClick={onClose}
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
              <p><span className="font-medium">Date:</span> {appointment.date}</p>
              <p><span className="font-medium">Time:</span> {appointment.time}</p>
              <p><span className="font-medium">Duration:</span> {appointment.duration} minutes</p>
              <p><span className="font-medium">Service:</span> {appointment.service || "General Appointment"}</p>
              <p><span className="font-medium">Created:</span> {new Date(appointment.createdAt).toLocaleString()}</p>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Customer Information</h4>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <p><span className="font-medium">Name:</span> {appointment.customer.name}</p>
              <p><span className="font-medium">Email:</span> {appointment.customer.email}</p>
              <p><span className="font-medium">Phone:</span> {appointment.customer.phone}</p>
              {appointment.customer.notes && (
                <>
                  <p className="font-medium mt-3">Notes:</p>
                  <p className="bg-white p-2 rounded border border-gray-100">
                    {appointment.customer.notes}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3 rounded-b-lg">
          {appointment.status === 'pending' && (
            <button
              onClick={() => onConfirm(appointment.id)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Confirm Appointment
            </button>
          )}
          {appointment.status !== 'cancelled' && (
            <button
              onClick={() => onCancel(appointment.id)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Cancel Appointment
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}