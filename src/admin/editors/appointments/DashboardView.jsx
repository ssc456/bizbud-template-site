import React from 'react';

export default function DashboardView({ 
  stats, 
  appointments, 
  isLoading, 
  onViewAppointment, 
  onConfirmAppointment, 
  onCancelAppointment,
  onViewAllClick,
  onViewTodayClick,
  onViewCalendarClick
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Pending Requests Card */}
        <div className="bg-gradient-to-br from-yellow-50 to-amber-100 rounded-lg shadow p-6 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-800 text-sm font-medium">Pending Requests</p>
              <h3 className="text-3xl font-bold text-yellow-900 mt-2">{stats.pending}</h3>
            </div>
            <div className="bg-yellow-200 rounded-full p-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-yellow-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <button 
            onClick={onViewAllClick}
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
              <h3 className="text-3xl font-bold text-blue-900 mt-2">{stats.today}</h3>
            </div>
            <div className="bg-blue-200 rounded-full p-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <button 
            onClick={onViewTodayClick}
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
              <h3 className="text-3xl font-bold text-green-900 mt-2">{stats.week}</h3>
            </div>
            <div className="bg-green-200 rounded-full p-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <button 
            onClick={onViewCalendarClick}
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
            onClick={onViewAllClick}
            className="text-blue-600 text-sm hover:underline"
          >
            View All
          </button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : appointments.length === 0 ? (
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
                          onClick={() => onViewAppointment(appointment)} 
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          View
                        </button>
                        <button 
                          onClick={() => onConfirmAppointment(appointment.id)} 
                          className="text-green-600 hover:text-green-900 mr-4"
                        >
                          Confirm
                        </button>
                        <button 
                          onClick={() => onCancelAppointment(appointment.id)} 
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
  );
}